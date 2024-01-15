import { computed, ref } from 'vue';
import OpenAI from 'openai';
import { defineStore } from 'pinia';

import { useTokenize } from '@/composables/useTokenize';
import { auth0 } from '@/main';
import http from '@/utils/http';

export interface Message {
  role: 'user' | 'system' | 'assistant';
  content: string;
}
export interface Conversation {
  id: number;
  sub: string;
  model: Model;
  temperature: number;
  max_tokens: number;
  system_message: string;
  messages?: string;
  title?: string;
}

export const MODELS = ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-1106-preview'] as const;
type Model = (typeof MODELS)[number];

export const useChatStore = defineStore('chat', () => {
  const loading = ref(false);
  const maxTokens = ref(1024);
  const messages = ref<Message[]>([]);
  const model = ref<Model>('gpt-4');
  const prompt = ref<Message[]>([]);
  const systemMessage = ref('');
  const temperature = ref(0);
  const textStream = ref('');
  const userMessage = ref('');

  const { checkTokens, tokenLength } = useTokenize();

  const getSystemMessage = computed(() => systemMessage.value || 'You are a helpful assistant.');

  const currentConversation = computed(() => ({
    model: model.value,
    temperature: temperature.value,
    max_tokens: maxTokens.value,
    system_message: getSystemMessage.value,
    messages: JSON.stringify(messages.value),
    title: messages.value[0].content,
  }));

  function addMessage(role: Message['role'], content: string) {
    messages.value.push({ role, content });
  }
  function createPrompt() {
    prompt.value = [{ role: 'system', content: getSystemMessage.value }, ...messages.value];
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

  async function fetchConversation(id: number) {
    loading.value = true;
    const convo = await http.get<Conversation>(`/api/conversations/${id}`);
    if (convo.messages) messages.value = JSON.parse(convo.messages);
    model.value = convo.model;
    systemMessage.value = convo.system_message;
    temperature.value = convo.temperature;
    loading.value = false;
  }

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
    currentConversation,
    fetchConversation,
  };
});
