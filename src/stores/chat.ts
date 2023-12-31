import { ref } from 'vue';
import OpenAI from 'openai';
import { defineStore } from 'pinia';

import { useTokenize } from '@/composables/useTokenize';
import { auth0 } from '@/main';

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

  const { checkTokens, tokenLength } = useTokenize();

  function addMessage(role: Message['role'], content: string) {
    messages.value.push({ role, content });
  }
  function createPrompt() {
    prompt.value = [
      { role: 'system', content: systemMessage.value || 'You are a helpful assistant.' },
      ...messages.value,
    ];
    const stringToTokenize = prompt.value.map((m) => m.content).join('');
    checkTokens({ stringToTokenize, model: model.value });
  }
  async function streamResponse(params: OpenAI.ChatCompletionCreateParams) {
    const token = await auth0.getAccessTokenSilently();
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token },
      body: JSON.stringify(params),
    });
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
    const params: OpenAI.ChatCompletionCreateParams = {
      model: model.value,
      messages: prompt.value,
      temperature: temperature.value,
      max_tokens: maxTokens.value,
    };
    await streamResponse(params);
    loading.value = false;
  }

  return {
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
    tokenLength, // from useTokenize
    userMessage,
  };
});
