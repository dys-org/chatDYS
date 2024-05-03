import { computed, ref } from 'vue';
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

  const isLoggedIn = computed(() => user.value !== null);

  async function fetchCurrentUser() {
    user.value = await http.get<User>(`/api/users/current`);
  }

  async function logout() {
    console.log('LOGGING OUT');
    user.value = null;
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
