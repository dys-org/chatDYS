import { Hono } from 'hono';
import OpenAI from 'openai';
import { Stream } from 'openai/streaming.mjs';

interface requestParams {
  chatCompletionParams: OpenAI.ChatCompletionCreateParams;
  apiKey: string;
}

const chat = new Hono().post('/', async (c) => {
  const headers = new Headers({ 'Content-Type': 'text/event-stream' });
  const init = { status: 200, statusText: 'ok', headers };
  const { chatCompletionParams, apiKey } = (await c.req.json()) as requestParams;
  // TODO can i use zod to validate the request body?
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
});

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

export default chat;
