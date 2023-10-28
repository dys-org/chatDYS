import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useCounterStore = defineStore('counter', () => {
  const tokenLength = ref(0);

  async function checkTokens(str: string) {
    tokenLength.value = 0;
    try {
      const res = await fetch('http://localhost:3000/tokenize', {
        method: 'POST',
        body: JSON.stringify({ stringToTokenize: str }),
        headers: { 'Content-Type': 'application/json' },
      });
      const { tokens } = await res.json();
      tokenLength.value = tokens;
    } catch (err) {
      console.error(err);
    }
  }

  return { checkTokens, tokenLength };
});
