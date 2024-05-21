import { useQuery } from '@tanstack/vue-query';
import { watch } from 'vue';

import { toastErrorHandler } from '@/lib';
import { client } from '@/lib/apiClient';

export function useSystemPresets() {
  const query = useQuery({
    queryKey: ['presetList'],
    queryFn: async () => {
      const res = await client.api.systemPresets.$get();
      if (res.ok) return await res.json();
    },
    refetchOnMount: false,
  });

  watch(query.error, (newVal) => {
    if (newVal) toastErrorHandler(newVal, 'There was a problem fetching presets.');
  });

  return query;
}
