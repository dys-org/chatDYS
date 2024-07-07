import type {
  ImageBlockParam,
  MessageCreateParamsBase,
  MessageParam,
} from '@anthropic-ai/sdk/resources/messages.mjs';
import type {
  ChatCompletionCreateParams,
  ChatCompletionMessageParam,
} from 'openai/resources/index.mjs';
import { defineStore } from 'pinia';
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import { useTokenize } from '@/composables/useTokenize';
import { client } from '@/lib/apiClient';

import { useApiKeyStore } from './apiKey';

export const OPENAI_MODELS = [
  'gpt-4o',
  'gpt-4-turbo',
  'gpt-3.5-turbo',
  'gpt-4',
  'gpt-4-1106-preview',
] as const;
export const ANTHROPIC_MODELS = ['claude-3-5-sonnet-20240620', 'claude-3-haiku-20240307'] as const;
type OpenAiModel = (typeof OPENAI_MODELS)[number];
type AnthropicModel = (typeof ANTHROPIC_MODELS)[number];

function get1stTextValue(content: ChatCompletionMessageParam['content'] | MessageParam['content']) {
  if (!Array.isArray(content)) return content;
  for (const part of content) {
    if (part.type === 'text') return part.text;
  }
}

export const useChatStore = defineStore('chat', () => {
  const route = useRoute();
  const { checkTokens, tokenLength } = useTokenize();

  const loading = ref(false);
  const maxTokens = ref(1024);
  const messages = ref<(ChatCompletionMessageParam | MessageParam)[]>([]);
  // const messages = ref<MessageParam[]>([]);
  const model = ref<OpenAiModel | AnthropicModel>('gpt-4o');
  const systemMessage = ref('');
  const temperature = ref(0);
  const textStream = ref('');
  const userMessage = ref('');
  const base64ImgUpload = ref<{ data: string; type?: ImageBlockParam.Source['media_type'] }>();
  const isApiKeyModalOpen = ref(false);
  const id = ref('');
  const provider = ref<'openai' | 'anthropic'>('openai');

  const getSystemMessage = computed(() => systemMessage.value || 'You are a helpful assistant.');
  const currentChat = computed(() => ({
    provider: provider.value,
    model: model.value,
    temperature: temperature.value,
    max_tokens: maxTokens.value,
    system_message: getSystemMessage.value,
    messages: JSON.stringify(messages.value),
    title: get1stTextValue(messages.value[0].content) ?? '',
  }));

  async function streamResponse(
    chatCompletionParams: ChatCompletionCreateParams | MessageCreateParamsBase,
  ) {
    const apiKeyStore = useApiKeyStore();
    const apiKey = provider.value === 'openai' ? apiKeyStore.openAiKey : apiKeyStore.anthropicKey;
    const url = provider.value === 'openai' ? '/api/chat' : '/api/claude';

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatCompletionParams, apiKey }),
    });
    if (!res.ok) {
      const error = await res.text();
      return Promise.reject(new Error(error));
    }
    if (!(res.body instanceof ReadableStream)) {
      return Promise.reject(new Error('Response is not a stream'));
    }
    loading.value = false;
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      // console.log(chunk);
      textStream.value += chunk;
    }
    messages.value.push({ role: 'assistant', content: textStream.value });
    textStream.value = '';
  }
  async function sendOpenAiPrompt() {
    // add the first user message
    messages.value.push({
      role: 'user',
      content: base64ImgUpload.value
        ? [
            { type: 'image_url', image_url: { url: base64ImgUpload.value.data } },
            { type: 'text', text: userMessage.value },
          ]
        : userMessage.value,
    });

    // create the full prompt with the system message
    const prompt: ChatCompletionMessageParam[] = [
      { role: 'system', content: getSystemMessage.value },
      ...(messages.value as ChatCompletionMessageParam[]),
    ];
    const stringToTokenize = prompt.map((m) => m.content).join('');
    checkTokens({ stringToTokenize, model: model.value as OpenAiModel });

    userMessage.value = '';
    base64ImgUpload.value = { data: '' };

    loading.value = true;
    const params: ChatCompletionCreateParams = {
      model: model.value,
      messages: prompt,
      temperature: temperature.value,
      max_tokens: maxTokens.value,
    };
    await streamResponse(params);
    loading.value = false;
  }

  async function sendAnthropicPrompt() {
    // add first user message
    messages.value.push({
      role: 'user',
      content: base64ImgUpload.value?.data
        ? [
            {
              type: 'image',
              source: {
                data: base64ImgUpload.value?.data ?? '',
                media_type: base64ImgUpload.value?.type ?? 'image/jpeg',
                type: 'base64',
              },
            },
            { type: 'text', text: userMessage.value },
          ]
        : userMessage.value,
    });

    // TODO check tokens, maybe from usage returned in response?

    userMessage.value = '';
    base64ImgUpload.value = { data: '' };

    loading.value = true;
    const params: MessageCreateParamsBase = {
      model: model.value,
      max_tokens: maxTokens.value,
      temperature: temperature.value,
      system: systemMessage.value,
      messages: [...(messages.value as MessageParam[])],
    };
    await streamResponse(params);
    loading.value = false;
  }

  async function fetchChat(id: string) {
    loading.value = true;
    const res = await client.api.conversations[':id'].$get({ param: { id } });
    const convo = await res.json();
    // TODO can i validate the JSON before parsing?
    try {
      if (convo.messages) messages.value = JSON.parse(convo.messages);
    } catch (err) {
      console.error(err);
    }
    // @ts-expect-error provider is not returning the union type
    provider.value = convo.provider;
    // @ts-expect-error model is not returning the union type
    model.value = convo.model;
    systemMessage.value = convo.system_message;
    temperature.value = convo.temperature;
    maxTokens.value = convo.max_tokens;
    loading.value = false;
  }

  watch(
    () => route.params.id,
    (newVal) => {
      const val = typeof newVal === 'string' ? newVal : newVal?.[0] || '';
      // console.log(val);
      id.value = val;
    },
  );

  return {
    loading,
    maxTokens,
    messages,
    model,
    sendOpenAiPrompt,
    sendAnthropicPrompt,
    systemMessage,
    temperature,
    textStream,
    tokenLength, // from useTokenize
    userMessage,
    base64ImgUpload,
    currentChat,
    fetchChat,
    isApiKeyModalOpen,
    id,
    provider,
  };
});
