import { useQueryClient } from '@tanstack/vue-query';
import { defineStore } from 'pinia';
import { useRouter } from 'vue-router';

import { useUser } from '@/composables/queries';
import { client } from '@/lib/apiClient';

export const useUserStore = defineStore('user', () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { data, isPending, isError } = useUser();

  async function logout() {
    console.log('LOGGING OUT');
    try {
      await client.auth.logout.$get();
      queryClient.setQueryData(['user'], null);
      router.push('/login');
    } catch (err) {
      console.error(err);
    }
  }

  return {
    data,
    isPending,
    isError,
    logout,
  };
});
