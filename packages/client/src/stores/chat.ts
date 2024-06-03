import { get as getIDB } from 'idb-keyval';
import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/index.mjs';
import { defineStore } from 'pinia';
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import { useTokenize } from '@/composables/useTokenize';
import { client } from '@/lib/apiClient';
import { IDB_APIKEY_OPENAI } from '@/lib/constants';

export const MODELS = [
  'gpt-4o',
  'gpt-4-turbo',
  'gpt-3.5-turbo',
  'gpt-4',
  'gpt-4-1106-preview',
] as const;
type Model = (typeof MODELS)[number];

function get1stTextValue(content: ChatCompletionMessageParam['content']) {
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
  const messages = ref<ChatCompletionMessageParam[]>([]);
  const model = ref<Model>('gpt-4o');
  const prompt = ref<ChatCompletionMessageParam[]>([]);
  const systemMessage = ref('');
  const temperature = ref(0);
  const textStream = ref('');
  const userMessage = ref('');
  const base64ImgUpload = ref<string>();
  const isApiKeyModalOpen = ref(false);
  const id = ref('');

  const getSystemMessage = computed(() => systemMessage.value || 'You are a helpful assistant.');
  const currentChat = computed(() => ({
    model: model.value,
    temperature: temperature.value,
    max_tokens: maxTokens.value,
    system_message: getSystemMessage.value,
    messages: JSON.stringify(messages.value),
    title: get1stTextValue(messages.value[0].content) ?? '',
  }));

  function addMessage(param: ChatCompletionMessageParam) {
    messages.value.push(param);
  }
  function createPrompt() {
    prompt.value = [{ role: 'system', content: getSystemMessage.value }, ...messages.value];
    const stringToTokenize = prompt.value.map((m) => m.content).join('');
    checkTokens({ stringToTokenize, model: model.value });
  }
  async function streamResponse(chatCompletionParams: OpenAI.ChatCompletionCreateParams) {
    const apiKey = await getIDB(IDB_APIKEY_OPENAI);
    const res = await fetch('/api/chat', {
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
    addMessage({ role: 'assistant', content: textStream.value }); // addMessage({ role: 'assistant', content: [{ type: 'text', text: textStream.value }] });
    textStream.value = '';
  }
  async function sendPrompt() {
    addMessage({
      role: 'user',
      content: base64ImgUpload.value
        ? [
            { type: 'image_url', image_url: { url: base64ImgUpload.value } },
            { type: 'text', text: userMessage.value },
          ]
        : userMessage.value,
    });

    createPrompt();
    userMessage.value = '';
    base64ImgUpload.value = undefined;

    loading.value = true;
    const params: OpenAI.ChatCompletionCreateParams = {
      model: model.value,
      messages: prompt.value,
      temperature: temperature.value,
      max_tokens: maxTokens.value,
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
    prompt,
    sendPrompt,
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
  };
});
