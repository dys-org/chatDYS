import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { defineStore } from 'pinia';

import http from '@/utils/http';

// TODO get from Hono Client
export interface User {
  id: number;
  sub: string;
  email: string;
  name: string;
  avatar_url: string;
  created_at: Date;
  updated_at: Date;
}

export const useUserStore = defineStore('user', () => {
  const router = useRouter();
  const user = ref<User | null>(null);
  const isLoggedIn = ref(false);

  async function fetchCurrentUser() {
    try {
      const data = await http.get<User>(`/api/users/current`);
      user.value = data;
      isLoggedIn.value = true;
    } catch (err) {
      console.log(err);
    }
  }

  async function logout() {
    console.log('LOGGING OUT');
    user.value = null;
    isLoggedIn.value = false;
    await http.get(`/auth/logout`);
    router.push('/login');
  }

  return {
    user,
    isLoggedIn,
    fetchCurrentUser,
    logout,
  };
});
