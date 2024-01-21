import OpenAI from 'openai';
import { Stream } from 'openai/streaming.mjs';

interface Env {
  OPENAI_API_KEY: string;
}

interface requestParams {
  chatCompletionParams: OpenAI.ChatCompletionCreateParams;
  apiKey: string;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const headers = new Headers({ 'Content-Type': 'text/event-stream' });
  const init = { status: 200, statusText: 'ok', headers };
  const { chatCompletionParams, apiKey } = (await request.json()) as requestParams;

  if (apiKey == null) throw new Error('No api key was provided');
  const openai = new OpenAI({ apiKey: apiKey });

  if (chatCompletionParams.messages == null) throw new Error('No prompt was provided');

  // make our request to the OpenAI API
  const stream = await openai.chat.completions.create({
    ...chatCompletionParams,
    stream: true,
  });

  // Using our readable and writable to handle streaming data
  const { readable, writable } = new TransformStream();
  writeToStream(writable, stream);

  // Send readable back to the browser so it can read the stream content
  return new Response(readable, init);
};

// For some reason the stream only pumps when I put this bit in a separate function
async function writeToStream(
  writable: WritableStream,
  stream: Stream<OpenAI.Chat.Completions.ChatCompletionChunk>,
) {
  const writer = writable.getWriter();
  const encoder = new TextEncoder();

  // loop over the data as it is streamed from OpenAI and write it using our writeable
  for await (const part of stream) {
    const content = part.choices[0]?.delta?.content || '';
    console.log(content);
    await writer.write(encoder.encode(content));
  }

  writer.close();
}

//////////// NON-STREAMING VERSION ////////////
// export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
//   const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

//   const params = (await request.json()) as OpenAI.ChatCompletionCreateParams;

//   if (params.messages == null) throw new Error('No prompt was provided');

//   // make our request to the OpenAI API
//   const completion = await openai.chat.completions.create({
//     ...params,
//     stream: false,
//   });
//   console.dir(completion);

//   const message = completion.choices[0].message;
//   console.dir(message);

//   const json = JSON.stringify({ success: true, message });

//   return new Response(json, { headers: { 'content-type': 'application/json' } });
// };
