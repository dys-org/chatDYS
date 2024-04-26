import { ref } from 'vue';
import { defineStore } from 'pinia';

import http from '@/utils/http';

interface User {
  id: number;
  sub: string;
  email: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null);

  async function fetchCurrentUser() {
    user.value = await http.get(`/api/users/current`);
  }

  async function createNewUser(userInfo: { email: string; name: string }) {
    for (const [key, val] of Object.entries(userInfo)) {
      if (val === '') {
        console.error(`${key} given to createNewUser is empty`);
        return;
      }
    }
    await http.post(`/api/users`, userInfo);
  }

  return {
    user,
    fetchCurrentUser,
    createNewUser,
  };
});
