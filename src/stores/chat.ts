import { ref } from 'vue';
import OpenAI from 'openai';
import { defineStore } from 'pinia';

import $http from '../utils/http';

import { useTokenizeStore } from './tokenize';

export interface Message {
  role: 'user' | 'system' | 'assistant';
  content: string;
}

export const MODELS = ['gpt-3.5-turbo', 'gpt-4'] as const;
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
  const userMessage = ref('');

  const tokenizeStore = useTokenizeStore();

  function addMessage(role: Message['role'], content: string) {
    messages.value.push({ role, content });
  }
  function createPrompt() {
    prompt.value = [
      { role: 'system', content: systemMessage.value || 'You are a helpful assistant.' },
      ...messages.value,
    ];
    const str = prompt.value.map((m) => m.content).join('');
    tokenizeStore.checkTokens(str);
  }

  async function sendPrompt() {
    addMessage('user', userMessage.value);
    createPrompt();
    userMessage.value = '';
    loading.value = true;
    try {
      const { message } = await $http.post('/api/chat', {
        model: model.value,
        messages: prompt.value,
        temperature: temperature.value,
        max_tokens: maxTokens.value,
      });

      addMessage(message.role, message.content);
    } catch (err) {
      if (err instanceof OpenAI.APIError) {
        const { status, message, code, type } = err;
        console.error(`API error: ${status}`);
        console.error(message);
        console.error(`code: ${code}} | type: ${type}}`);
      } else {
        // Non-API error
        console.error(err);
      }
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
    userMessage,
  };
});
