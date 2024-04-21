import { ref } from 'vue';
import type { D1Result } from '@cloudflare/workers-types';
import { defineStore } from 'pinia';

import http from '@/utils/http';

import { type Conversation, useChatStore } from './chat';

export const useConversationStore = defineStore('conversation', () => {
  const chatStore = useChatStore();
  const conversationList = ref<Conversation[] | null>(null);

  async function fetchConversationList() {
    conversationList.value = await http.get(`/api/conversations`);
  }

  async function createConversation() {
    const post: D1Result<Record<string, unknown>> = await http.post(
      '/api/conversations',
      chatStore.currentChat,
    );
    await fetchConversationList();
    return post;
  }
  async function updateConversation(paramsId: string | string[]) {
    const id = typeof paramsId === 'string' ? paramsId : paramsId[0];
    await http.put(`/api/conversations/${id}`, chatStore.currentChat);
  }
  async function updateMessages(paramsId: string | string[]) {
    const id = typeof paramsId === 'string' ? paramsId : paramsId[0];
    await http.patch(`/api/conversations/${id}`, chatStore.messages);
  }
  async function deleteConversation(id: number) {
    await http.delete(`/api/conversations/${id}`);
    await fetchConversationList();
  }

  return {
    conversationList,
    fetchConversationList,
    createConversation,
    updateConversation,
    deleteConversation,
    updateMessages,
  };
});
