import { ref } from 'vue';
import { type TiktokenModel } from 'js-tiktoken';

import http from '@/utils/http';

export interface TokenizeRequest {
  stringToTokenize: string;
  model?: TiktokenModel;
}
export interface TokenizeResponse {
  tokens: number;
}

export function useTokenize() {
  const tokenLength = ref(0);

  async function checkTokens({ stringToTokenize, model = 'gpt-4' }: TokenizeRequest) {
    tokenLength.value = 0;
    try {
      const { tokens } = await http.post<TokenizeRequest, TokenizeResponse>('/api/tokenize', {
        stringToTokenize,
        model,
      });

      tokenLength.value = tokens;
      // console.log('tokens =', tokens);
    } catch (err) {
      console.error(err);
    }
  }

  return { checkTokens, tokenLength };
}
