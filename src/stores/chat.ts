import { computed, ref } from 'vue';
import { defineStore } from 'pinia';

import { useTokenizeStore } from './tokenize';

export interface Message {
  role: 'user' | 'system' | 'assistant';
  content: string;
}

export const MODELS = ['gpt-3.5-turbo', 'gpt-4'] as const;
type Model = (typeof MODELS)[number];

export const useChatStore = defineStore('chat', () => {
  const userMessage = ref('');
  const messages = ref<Message[]>([]);
  const systemMessage = ref('');
  const prompt = ref<Message[]>([]);
  const model = ref<Model>('gpt-4');
  const temperature = ref(0);
  const preset = ref('');
  const assistantResponse = ref('asdfasdf');

  const tokenizeStore = useTokenizeStore();

  function addMessage(role: Message['role'], content: string) {
    messages.value.push({ role, content });
  }
  function createPrompt() {
    prompt.value = [{ role: 'system', content: systemMessage.value }, ...messages.value];
    const str = prompt.value.map((m) => m.content).join();
    tokenizeStore.checkTokens(str);
  }

  async function sendPrompt() {
    assistantResponse.value = '';
    addMessage('user', userMessage.value);
    createPrompt();
    const res = await fetch('http://localhost:3000/chat', {
      method: 'POST',
      body: JSON.stringify({ model: model.value, messages: prompt.value }),
      headers: { 'Content-Type': 'application/json' },
    });
    const { message } = await res.json();
    assistantResponse.value = message.content;
    addMessage('assistant', assistantResponse.value);
    userMessage.value = '';
  }

  return {
    userMessage,
    messages,
    systemMessage,
    prompt,
    model,
    temperature,
    preset,
    addMessage,
    createPrompt,
    sendPrompt,
  };
});
