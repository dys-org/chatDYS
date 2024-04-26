import { ref } from 'vue';
import type { D1Result } from '@cloudflare/workers-types';
import { defineStore } from 'pinia';

import http from '@/utils/http';

export interface SystemPreset {
  id: number;
  sub?: string;
  name: string;
  text: string;
  created_at?: string;
  updated_at?: string;
}

export const useSystemPresetsStore = defineStore('systemPresets', () => {
  const loading = ref(false);
  const presetList = ref<SystemPreset[] | null>(null);

  async function fetchPresetList() {
    presetList.value = await http.get(`/api/system-presets`);
  }

  async function createSystemPreset(params: { name: string; text: string }) {
    const res: D1Result<Record<string, unknown>> = await http.post('/api/system-presets', params);
    await fetchPresetList();
    return res;
  }
  async function updateSystemPreset(params: { id: number; name: string; text: string }) {
    await http.put(`/api/system-presets/${params.id}`, params);
    await fetchPresetList();
  }
  async function deleteSystemPreset(id: number) {
    await http.delete(`/api/system-presets/${id}`);
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
