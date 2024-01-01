import { ref } from 'vue';
import { encode } from 'gpt-tokenizer';
import { defineStore } from 'pinia';
// TODO move this back to functions or get rid of it
// it's too big to be in the browser
// it uses Node APIs though
export const useTokenizeStore = defineStore('tokenize', () => {
  const tokenLength = ref(0);

  async function checkTokens(str: string) {
    const encoded = encode(str);
    tokenLength.value = encoded.length;
  }

  return { checkTokens, tokenLength };
});
