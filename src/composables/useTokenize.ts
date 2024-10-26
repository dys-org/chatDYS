import { ref } from 'vue';

import { client } from '@/lib/apiClient';

interface TokenizeRequest {
  stringToTokenize: string;
  model:
    | 'gpt-4o'
    | 'gpt-4o-mini'
    // 'o1-mini',
    // 'o1-preview',
    | 'gpt-4-turbo'
    | 'gpt-3.5-turbo'
    | 'gpt-4'
    | 'gpt-4-1106-preview';
}

export function useTokenize() {
  const tokenLength = ref(0);

  async function checkTokens({ stringToTokenize, model }: TokenizeRequest) {
    tokenLength.value = 0;
    try {
      const res = await client.api.tokenize.$post({ json: { stringToTokenize, model } });
      const { tokens } = await res.json();
      tokenLength.value = tokens;
    } catch (err) {
      console.error(err);
    }
  }

  return { checkTokens, tokenLength };
}
