import { encode } from 'gpt-tokenizer';

import { type TokenizeRequest } from '../../src/composables/useTokenize.js';

export const onRequestPost: PagesFunction = async ({ request }) => {
  const { stringToTokenize }: TokenizeRequest = await request.json();

  if (stringToTokenize == null) throw new Error('No string was provided');

  const encoded = encode(stringToTokenize);
  const length = encoded.length;
  console.log('Token count is ' + length);

  const json = JSON.stringify({ success: true, tokens: length });

  return new Response(json, { headers: { 'content-type': 'application/json;charset=UTF-8' } });
};
