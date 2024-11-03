import Anthropic from '@anthropic-ai/sdk';
import { type Stream } from '@anthropic-ai/sdk/streaming.mjs';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';

import { formatZodError } from '../utils.js';

export const contentSchema = z.union([
  z.object({
    type: z.literal('image'),
    source: z.object({
      data: z.string(),
      media_type: z.union([
        z.literal('image/jpeg'),
        z.literal('image/png'),
        z.literal('image/gif'),
        z.literal('image/webp'),
      ]),
      type: z.literal('base64'),
    }),
  }),
  z.object({ type: z.literal('text'), text: z.string() }),
]);
const chatParamsSchema = z.object({
  chatCompletionParams: z.object({
    model: z.union([
      z.literal('claude-3-5-sonnet-latest'),
      z.literal('claude-3-haiku-latest'),
      z.literal('claude-3-5-sonnet-20240620'),
      z.literal('claude-3-haiku-20240307'),
    ]),
    messages: z.array(
      z.object({
        role: z.union([z.literal('user'), z.literal('assistant')]),
        content: z.union([z.string(), z.array(contentSchema)]),
      }),
    ),
    temperature: z.number(),
    max_tokens: z.number(),
    system: z.string(),
  }),
  apiKey: z.string(),
});

const chat = new Hono().post(
  '/',
  zValidator('json', chatParamsSchema, (result, c) => {
    if (!result.success) {
      console.log(result.error);
      return c.text(formatZodError(result.error), 400);
    }
  }),
  async (c) => {
    const headers = new Headers({ 'Content-Type': 'text/event-stream' });
    const init = { status: 200, statusText: 'ok', headers };
    const { chatCompletionParams, apiKey } = c.req.valid('json');

    const anthropic = new Anthropic({ apiKey });
    const stream = await anthropic.messages.create({
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
  stream: Stream<Anthropic.Messages.RawMessageStreamEvent>,
) {
  const writer = writable.getWriter();
  const encoder = new TextEncoder();

  // loop over the data as it is streamed from OpenAI and write it using our writeable
  for await (const messageStreamEvent of stream) {
    console.log(messageStreamEvent);
    if (
      messageStreamEvent.type === 'content_block_delta' &&
      messageStreamEvent.delta.type === 'text_delta'
    ) {
      const text = messageStreamEvent.delta.text;
      await writer.write(encoder.encode(text));
    }
  }

  writer.close();
}

export default chat;
