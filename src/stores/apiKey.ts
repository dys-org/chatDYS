import { getMany, set } from 'idb-keyval';
import { defineStore } from 'pinia';
import { ref } from 'vue';

import { IDB_APIKEY_ANTHROPIC, IDB_APIKEY_OPENAI } from '@/lib/constants';

export const useApiKeyStore = defineStore('apiKey', () => {
  const openAiKey = ref<string>();
  const anthropicKey = ref<string>();

  async function getApiKeys() {
    const [openAi, anthropic] = await getMany([IDB_APIKEY_OPENAI, IDB_APIKEY_ANTHROPIC]);
    openAiKey.value = openAi;
    anthropicKey.value = anthropic;
  }

  async function setApiKey(provider: 'openai' | 'anthropic', apiKey: string) {
    if (provider === 'openai') {
      openAiKey.value = apiKey;
      await set(IDB_APIKEY_OPENAI, apiKey);
    }
    if (provider === 'anthropic') {
      anthropicKey.value = apiKey;
      await set(IDB_APIKEY_ANTHROPIC, apiKey);
    }
  }

  return { openAiKey, anthropicKey, getApiKeys, setApiKey };
});
