import { ref } from 'vue';

import http from '@/utils/http';

export interface TokenizeRequest {
  stringToTokenize: string;
}
export interface TokenizeResponse {
  success: boolean;
  tokens: number;
}

export function useTokenize() {
  const tokenLength = ref(0);

  async function checkTokens(str: string) {
    tokenLength.value = 0;
    try {
      const { tokens } = await http.post<TokenizeRequest, TokenizeResponse>('/api/tokenize', {
        stringToTokenize: str,
      });

      tokenLength.value = tokens;
      // console.log('tokens =', tokens);
    } catch (err) {
      console.error(err);
    }
  }

  return { checkTokens, tokenLength };
}
