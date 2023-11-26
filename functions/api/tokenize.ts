import { encode } from 'gpt-tokenizer';

//@ts-ignore
export const onRequestPost: PagesFunction<Env> = async ({ request }) => {
  const { stringToTokenize } = await request.json();

  if (stringToTokenize == null) throw new Error('No string was provided');

  const encoded = encode(stringToTokenize);
  const length = encoded.length;
  console.log('Token count is ' + length);

  const json = JSON.stringify({ success: true, tokens: length });

  return new Response(json, { headers: { 'content-type': 'application/json;charset=UTF-8' } });
};

// } catch (err: any) {
//   console.error('tokenize error: ', err);
//   const { errorType, errorMessage, stack, message } = err;
//   return {
//     body: JSON.stringify({ message, errorMessage, errorType, stack }),
//     statusCode: err.statusCode ?? err.status ?? 500,
//   };
// }
