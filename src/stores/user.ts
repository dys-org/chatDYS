import { type InferResponseType, hc } from 'hono/client';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

import { client } from '@/lib/apiClient';
import http from '@/lib/http';

type UserResType = InferResponseType<typeof client.api.users.current.$get, 200>;

export const useUserStore = defineStore('user', () => {
  const router = useRouter();
  const user = ref<UserResType | null>(null);

  const isLoggedIn = computed(() => user.value !== null);

  async function fetchCurrentUser() {
    const data = await http.get<UserResType>(`/api/users/current`);
    user.value = data;
    // const res = await client.api.users.current.$get();
    // const data = await res.json();
    // user.value = data;
  }

  async function logout() {
    console.log('LOGGING OUT');
    try {
      await http.get(`/auth/logout`);
      user.value = null;
      router.push('/login');
    } catch (err) {
      console.error(err);
    }
  }

  return {
    user,
    isLoggedIn,
    fetchCurrentUser,
    logout,
  };
});
