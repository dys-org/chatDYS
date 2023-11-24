import type { Handler } from '@netlify/functions';
import { encode } from 'gpt-tokenizer';

export const handler: Handler = async (event) => {
  const { stringToTokenize } = JSON.parse(event.body ?? '');
  try {
    if (stringToTokenize == null) throw new Error('No string was provided');

    const encoded = encode(stringToTokenize);
    const length = encoded.length;
    console.log('Token count is ' + length);

    return {
      body: JSON.stringify({ success: true, tokens: length }),
      statusCode: 200,
    };
  } catch (err: any) {
    return {
      body: JSON.stringify({
        message: err.message ?? 'There was a problem calculating the tokens.',
      }),
      statusCode: err.statusCode ?? err.status ?? 500,
    };
  }
};
