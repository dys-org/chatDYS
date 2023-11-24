import { ref } from 'vue';
import { defineStore } from 'pinia';

import { $http } from '@/utils/http';

export const useTokenizeStore = defineStore('tokenize', () => {
  const tokenLength = ref(0);

  async function checkTokens(str: string) {
    tokenLength.value = 0;
    try {
      const { tokens } = await $http.post('/api/tokenize', { stringToTokenize: str });

      tokenLength.value = tokens;
    } catch (err) {
      console.error(err);
    }
  }

  return { checkTokens, tokenLength };
});
