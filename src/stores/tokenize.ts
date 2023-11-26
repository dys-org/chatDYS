import { ref } from 'vue';
import { encode } from 'gpt-tokenizer';
import { defineStore } from 'pinia';

export const useTokenizeStore = defineStore('tokenize', () => {
  const tokenLength = ref(0);

  async function checkTokens(str: string) {
    const encoded = encode(str);
    tokenLength.value = encoded.length;
  }

  return { checkTokens, tokenLength };
});
