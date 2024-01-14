import { ref } from 'vue';
import { defineStore } from 'pinia';

import http from '@/utils/http';

interface User {
  id: number;
  sub_id: string;
  email: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}

interface ConversationPreview {
  id: number;
  user_id: string;
  title: string;
}

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null);
  const conversations = ref<ConversationPreview[] | null>(null);

  async function fetchUser(sub_id: string) {
    if (sub_id === '') {
      console.error('sub_id given to fetchUser is empty');
      return;
    }
    user.value = await http.get(`/api/users/${sub_id}`);
  }

  async function createNewUser(userInfo: { sub_id: string; email: string; name: string }) {
    for (const [key, val] of Object.entries(userInfo)) {
      if (val === '') {
        console.error(`${key} given to createNewUser is empty`);
        return;
      }
    }
    await http.post(`/api/users`, userInfo);
  }

  async function fetchConversations() {
    conversations.value = await http.get(`/api/conversations`);
  }

  return { fetchUser, createNewUser, user, fetchConversations, conversations };
});
