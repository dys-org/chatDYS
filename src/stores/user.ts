import { type InferResponseType, hc } from 'hono/client';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

import { client } from '@/lib/apiClient';

type UserResponse = InferResponseType<typeof client.api.users.current.$get, 200>;

export const useUserStore = defineStore('user', () => {
  const router = useRouter();
  const user = ref<UserResponse | null>(null);

  const isLoggedIn = computed(() => user.value !== null);

  async function fetchCurrentUser() {
    const res = await client.api.users.current.$get();
    if (res.ok) user.value = await res.json();
  }

  async function logout() {
    console.log('LOGGING OUT');
    try {
      await client.auth.logout.$get();
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
