import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useTokenizeStore = defineStore('tokenize', () => {
  const tokenLength = ref(0);

  async function checkTokens(str: string) {
    tokenLength.value = 0;
    try {
      const res = await fetch('/api/tokenize', {
        method: 'POST',
        body: JSON.stringify({ stringToTokenize: str }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || res.statusText);
      }

      const { tokens } = await res.json();
      tokenLength.value = tokens;
    } catch (err) {
      console.error(err);
    }
  }

  return { checkTokens, tokenLength };
});
