import type { CoreMessage } from 'ai';
import { InferRequestType } from 'hono';
import { defineStore } from 'pinia';
import { Conversation } from 'server/drizzle/schema';
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

// import { useTokenize } from '@/composables/useTokenize';
import { client } from '@/lib/apiClient';

import { useApiKeyStore } from './apiKey';

type Provider = 'openai' | 'anthropic';
export type ImageMedia = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';

const $post = client.api.chat.$post;

export type Model = InferRequestType<typeof $post>['json']['chatCompletionParams']['model'];

function get1stTextValue(content: CoreMessage['content']) {
  if (!Array.isArray(content)) return content;
  for (const part of content) {
    if (part.type === 'text') return part.text;
  }
}

export const useChatStore = defineStore('chat', () => {
  const route = useRoute();
  // const { checkTokens, tokenLength } = useTokenize();

  const loading = ref(false);
  const maxTokens = ref(1024);
  const messages = ref<CoreMessage[]>([]);
  const model = ref<Model>('claude-3-5-sonnet-latest');
  const systemMessage = ref('You are a helpful assistant.');
  const temperature = ref(0);
  const userMessage = ref('');
  const base64ImgUpload = ref<{ data: string; type?: ImageMedia }>();
  const isApiKeyModalOpen = ref(false);
  const id = ref('');
  const provider = ref<Provider>('anthropic');

  const currentChat = computed(() => ({
    provider: provider.value,
    model: model.value,
    temperature: temperature.value,
    max_tokens: maxTokens.value,
    system_message: systemMessage.value,
    messages: JSON.stringify(messages.value),
    title: get1stTextValue(messages.value[0].content) ?? '',
  }));

  async function sendPrompt() {
    // add the first user message
    messages.value.push({
      role: 'user',
      content: base64ImgUpload.value
        ? [
            { type: 'image', image: base64ImgUpload.value.data },
            { type: 'text', text: userMessage.value },
          ]
        : userMessage.value,
    });

    // create the full prompt with the system message
    // const prompt = [{ role: 'system', content: systemMessage.value }, ...messages.value];
    // const stringToTokenize = prompt.map((m) => m.content).join('');
    // checkTokens({ stringToTokenize, model: model.value as OpenAiModel });

    userMessage.value = '';
    base64ImgUpload.value = undefined;

    loading.value = true;

    const chatCompletionParams: InferRequestType<typeof $post>['json']['chatCompletionParams'] = {
      model: model.value,
      system: systemMessage.value,
      messages: messages.value,
      temperature: temperature.value,
      max_tokens: maxTokens.value,
    };
    const apiKeyStore = useApiKeyStore();
    const apiKey = provider.value === 'openai' ? apiKeyStore.openAiKey : apiKeyStore.anthropicKey;

    const res = await $post({ json: { chatCompletionParams, apiKey: apiKey ?? '' } });

    if (!res.ok) {
      const error = await res.text();
      return Promise.reject(new Error(error));
    }
    if (!(res.body instanceof ReadableStream)) {
      return Promise.reject(new Error('Response is not a stream'));
    }

    const asstMsgIdx = messages.value.length;
    messages.value.push({ content: '', role: 'assistant' });
    loading.value = false;
    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      messages.value[asstMsgIdx].content += chunk;
    }
  }

  async function fetchChat(id: string) {
    loading.value = true;
    const res = await client.api.conversations[':id'].$get({ param: { id } });
    // This isn't getting inferred correctly after updating to hono >=4.5.2
    const convo: Conversation = await res.json();
    try {
      if (convo.messages) messages.value = JSON.parse(convo.messages) as CoreMessage[];
    } catch (err) {
      console.error(err);
    }
    provider.value = convo.provider as Provider;
    model.value = convo.model as Model;
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
    sendPrompt,
    systemMessage,
    temperature,
    // tokenLength, // from useTokenize
    userMessage,
    base64ImgUpload,
    currentChat,
    fetchChat,
    isApiKeyModalOpen,
    id,
    provider,
  };
});
