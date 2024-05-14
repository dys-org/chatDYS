import { InferResponseType } from 'hono';
import { defineStore } from 'pinia';
import { ref } from 'vue';

import { client } from '@/lib/apiClient';

import { useChatStore } from './chat';

type ConversationResponse = InferResponseType<typeof client.api.conversations.$get, 200>;

export const useConversationStore = defineStore('conversation', () => {
  const chatStore = useChatStore();
  const conversationList = ref<ConversationResponse | null>(null);

  async function fetchConversationList() {
    const res = await client.api.conversations.$get();
    if (res.ok) conversationList.value = await res.json();
  }

  async function createConversation() {
    const res = await client.api.conversations.$post({ json: chatStore.currentChat });
    const info = await res.json();
    fetchConversationList();
    return info;
  }
  // async function updateConversation(paramsId: string | string[]) {
  //   const id = typeof paramsId === 'string' ? paramsId : paramsId[0];
  //   const res = await client.api.conversations[':id'].$put({
  //     param: { id },
  //     json: chatStore.currentChat,
  //   });
  //   const info = await res.json();
  //   return info;
  // }
  async function updateMessages(paramsId: string | string[]) {
    const id = typeof paramsId === 'string' ? paramsId : paramsId[0];
    const res = await client.api.conversations[':id'].$patch({
      param: { id },
      json: chatStore.messages,
    });
    const info = await res.json();
    return info;
  }
  async function deleteConversation(id: number) {
    const res = await client.api.conversations[':id'].$delete({ param: { id: id.toString() } });
    const info = await res.json();
    await fetchConversationList();
    return info;
  }

  return {
    conversationList,
    fetchConversationList,
    createConversation,
    // updateConversation, // unused atm
    deleteConversation,
    updateMessages,
  };
});
