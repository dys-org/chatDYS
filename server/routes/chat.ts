import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';
import { zValidator } from '@hono/zod-validator';
import { coreMessageSchema, streamText } from 'ai';
import { Hono } from 'hono';
import { stream } from 'hono/streaming';
import { z } from 'zod';

import { ANTHROPIC_MODELS, OPENAI_MODELS } from '../aiModels.js';
import { formatZodError } from '../utils.js';

type OpenAiModel = (typeof OPENAI_MODELS)[number];
type AnthropicModel = (typeof ANTHROPIC_MODELS)[number];

function isOpenAIModel(model: OpenAiModel | AnthropicModel): model is OpenAiModel {
  return OPENAI_MODELS.includes(model as OpenAiModel);
}

export const chatParamsSchema = z.object({
  chatCompletionParams: z.object({
    model: z.enum([...OPENAI_MODELS, ...ANTHROPIC_MODELS]),
    system: z.string(),
    messages: z.array(coreMessageSchema),
    temperature: z.number().min(0).max(2),
    max_tokens: z.number().int().positive(),
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
    const { chatCompletionParams, apiKey } = c.req.valid('json');

    const provider = isOpenAIModel(chatCompletionParams.model)
      ? createOpenAI({ apiKey })
      : createAnthropic({ apiKey });

    const { textStream } = streamText({
      model: provider(chatCompletionParams.model),
      system: chatCompletionParams.system,
      messages: chatCompletionParams.messages,
      temperature: chatCompletionParams.temperature,
      maxTokens: chatCompletionParams.max_tokens,
    });

    return stream(c, async (stream) => {
      // Write a process to be executed when aborted.
      stream.onAbort(() => {
        console.log('Aborted!');
      });
      // Pipe a readable stream.
      await stream.pipe(textStream);
    });
  },
);

export default chat;
