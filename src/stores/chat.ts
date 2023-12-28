import { ref } from 'vue';
import OpenAI from 'openai';
import { defineStore } from 'pinia';

import http from '@/utils/http';

// import { useTokenizeStore } from './tokenize';
export interface Message {
  role: 'user' | 'system' | 'assistant';
  content: string;
}

export const MODELS = ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-1106-preview'] as const;
type Model = (typeof MODELS)[number];

export const useChatStore = defineStore('chat', () => {
  const loading = ref(false);
  const maxTokens = ref(1024);
  const messages = ref<Message[]>([]);
  const model = ref<Model>('gpt-4');
  const preset = ref('');
  const prompt = ref<Message[]>([]);
  const systemMessage = ref('');
  const temperature = ref(0);
  const textStream = ref('');
  const userMessage = ref('');

  // const tokenizeStore = useTokenizeStore();

  function addMessage(role: Message['role'], content: string) {
    messages.value.push({ role, content });
  }
  function createPrompt() {
    prompt.value = [
      { role: 'system', content: systemMessage.value || 'You are a helpful assistant.' },
      ...messages.value,
    ];
    // const str = prompt.value.map((m) => m.content).join('');
    // tokenizeStore.checkTokens(str);
  }
  async function streamResponse(params: OpenAI.ChatCompletionCreateParams) {
    const res = await http.post<OpenAI.ChatCompletionCreateParams, Response>('/api/chat', params);
    if (!res.ok) {
      const error = await res.json();
      return Promise.reject(error);
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
    addMessage('assistant', textStream.value);
    textStream.value = '';
  }
  async function sendPrompt() {
    addMessage('user', userMessage.value);
    createPrompt();
    userMessage.value = '';
    loading.value = true;

    // const params: OpenAI.ChatCompletionCreateParams = {
    const params = {
      model: model.value,
      messages: prompt.value,
      temperature: temperature.value,
      max_tokens: maxTokens.value,
    };
    try {
      await streamResponse(params);
    } catch (err: any) {
      console.error(err);
    } finally {
      loading.value = false;
    }
  }

  return {
    addMessage,
    createPrompt,
    loading,
    maxTokens,
    messages,
    model,
    preset,
    prompt,
    sendPrompt,
    systemMessage,
    temperature,
    textStream,
    userMessage,
  };
});
