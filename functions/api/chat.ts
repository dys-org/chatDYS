import type { PagesFunction } from '@cloudflare/workers-types';
import OpenAI from 'openai';

// @ts-ignore
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

  const params: OpenAI.ChatCompletionCreateParams = await request.json();

  if (params.messages == null) throw new Error('No prompt was provided');

  // make our request to the OpenAI API
  const completion = await openai.chat.completions.create({
    ...params,
    stream: false,
  });
  console.dir(completion);

  const message = completion.choices[0].message;
  console.dir(message);

  const json = JSON.stringify({ success: true, message });

  return new Response(json, { headers: { 'content-type': 'application/json;charset=UTF-8' } });
};

//////////// STREAMING VERSION ////////////
interface Env {
  OPENAI_API_KEY: string;
}

//@ts-ignore
// export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
//   const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

//   const params: OpenAI.ChatCompletionCreateParams = await request.json();

//   if (params.messages == null) throw new Error('No prompt was provided');

//   // make our request to the OpenAI API
//   const stream = await openai.chat.completions.create({
//   ...params,
//     stream: true,
//   });

//   // Using our readable and writable to handle streaming data
//   const { readable, writable } = new TransformStream();

//   const writer = writable.getWriter();
//   const textEncoder = new TextEncoder();

//   // loop over the data as it is streamed from OpenAI and write it using our writeable
//   for await (const part of stream) {
//     console.log(part.choices[0]?.delta?.content || '');
//     writer.write(textEncoder.encode(part.choices[0]?.delta?.content || ''));
//   }

//   writer.close();

//   // Send readable back to the browser so it can read the stream content
//   return new Response(readable);
// };

//////////// ERROR HANDLING ////////////
//   } catch (err: any) {
//     if (err instanceof OpenAI.APIError) {
//       const { status, message, code, type } = err;
//       return {
//         body: JSON.stringify({ message, code, type }),
//         statusCode: status ?? 500,
//       };
//     }
//     console.error('chat error: ', err);
//     const { errorType, errorMessage, stack, message } = err;
//     return {
//       body: JSON.stringify({ message, errorMessage, errorType, stack }),
//       statusCode: err.statusCode ?? err.status ?? 500,
//     };
//   }
