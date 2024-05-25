import { useQuery } from '@tanstack/vue-query';
import { watch } from 'vue';
import { useRoute } from 'vue-router';

import { client } from '@/lib/apiClient';
import { HTTPError } from '@/lib/exceptions';
import { useUserStore } from '@/stores/user';

export async function fetchCurrentUser() {
  const res = await client.api.users.current.$get();
  return await res.json();
}

export function useUser() {
  const route = useRoute();
  const userStore = useUserStore();
  const query = useQuery({
    queryKey: ['user'],
    queryFn: fetchCurrentUser,
    refetchInterval: 1000 * 60 * 60,
    // refetchOnMount: false,
  });

  watch(query.error, (err) => {
    if (err instanceof HTTPError && [401, 403].includes(err.status)) {
      if (route.meta.requiresAuth) userStore.logout();
      console.error(err.message);
    }
  });

  return query;
}
export function useSystemPresets() {
  const query = useQuery({
    queryKey: ['presetList'],
    queryFn: async () => {
      const res = await client.api.systemPresets.$get();
      return await res.json();
    },
    meta: { errorMessage: 'There was a problem fetching presets.' },
    refetchOnMount: false,
  });

  return query;
}

export function useConversations() {
  const query = useQuery({
    queryKey: ['conversationList'],
    queryFn: async () => {
      const res = await client.api.conversations.$get();
      return await res.json();
    },
    meta: { errorMessage: 'There was a problem fetching conversations.' },
    refetchOnMount: false,
  });

  return query;
}
