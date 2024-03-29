import { encodingForModel } from 'js-tiktoken';

import { type TokenizeRequest } from '../../src/composables/useTokenize.js';

export const onRequestPost: PagesFunction = async ({ request }) => {
  const { stringToTokenize, model }: TokenizeRequest = await request.json();

  if (stringToTokenize == null) throw new Error('No string was provided');

  const encoder = encodingForModel(model);
  const encoded = encoder.encode(stringToTokenize);
  const length = encoded.length;
  console.log('Token count is ' + length);

  return Response.json({ tokens: length });
};
