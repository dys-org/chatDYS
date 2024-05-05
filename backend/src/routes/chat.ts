import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import OpenAI from 'openai';
import { Stream } from 'openai/streaming.mjs';
import { z } from 'zod';

const chatParamsSchema = z.object({
  chatCompletionParams: z.object({
    model: z.string(),
    messages: z.array(
      z.object({
        role: z.union([z.literal('user'), z.literal('system'), z.literal('assistant')]),
        content: z.string(),
      }),
    ),
    temperature: z.number(),
    max_tokens: z.number(),
  }),
  apiKey: z.string(),
});

const chat = new Hono().post(
  '/',
  zValidator('json', chatParamsSchema, (result, c) => {
    if (!result.success) c.json({ message: result.error.message }, 400);
  }),
  async (c) => {
    const headers = new Headers({ 'Content-Type': 'text/event-stream' });
    const init = { status: 200, statusText: 'ok', headers };
    const { chatCompletionParams, apiKey } = c.req.valid('json');

    const openai = new OpenAI({ apiKey: apiKey });

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
  },
);

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
