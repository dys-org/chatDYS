import { InferResponseType } from 'hono';
import { defineStore } from 'pinia';
import { ref } from 'vue';

import { client } from '@/lib/apiClient';

export type SystemPresetsResponse = InferResponseType<typeof client.api.systemPresets.$get, 200>;

export const useSystemPresetsStore = defineStore('systemPresets', () => {
  const loading = ref(false);
  const presetList = ref<SystemPresetsResponse | null>(null);

  async function fetchPresetList() {
    const res = await client.api.systemPresets.$get();
    if (res.ok) presetList.value = await res.json();
  }
  async function createSystemPreset(params: { name: string; text: string }) {
    const res = await client.api.systemPresets.$post({ json: params });
    const info = await res.json();
    await fetchPresetList();
    return info;
  }
  async function updateSystemPreset(params: { id: number; name: string; text: string }) {
    const { id, name, text } = params;
    await client.api.systemPresets[':id'].$put({
      param: { id: id.toString() },
      json: { name, text },
    });
    await fetchPresetList();
  }
  async function deleteSystemPreset(id: number) {
    await client.api.systemPresets[':id'].$delete({
      param: { id: id.toString() },
    });
    await fetchPresetList();
  }

  return {
    loading,
    presetList,
    fetchPresetList,
    createSystemPreset,
    updateSystemPreset,
    deleteSystemPreset,
  };
});
