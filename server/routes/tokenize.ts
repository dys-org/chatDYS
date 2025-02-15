import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { encodingForModel } from 'js-tiktoken';
// import type { TiktokenModel } from 'js-tiktoken';
import { z } from 'zod';

import { formatZodError } from '../utils.js';

const tokenize = new Hono().post(
  '/',
  zValidator(
    'json',
    z.object({
      stringToTokenize: z.string(),
      // TiktokenModel has a lot more options, but we only use these atm
      model: z.union([
        z.literal('gpt-4o'),
        z.literal('gpt-4o-mini'),
        // z.literal('o1-mini'),
        // z.literal('o1-preview'),
        z.literal('gpt-4'),
        z.literal('gpt-4-1106-preview'),
      ]),
    }),
    (result, c) => {
      if (!result.success) {
        console.log(result.error);
        return c.text(formatZodError(result.error), 400);
      }
    },
  ),
  async (c) => {
    const { model, stringToTokenize } = c.req.valid('json');
    // o1-mini and o1-preview don't support tokenization yet
    // if (model === 'o1-mini' || model === 'o1-preview') {
    //   return c.json({ tokens: NaN });
    // }
    const encoder = encodingForModel(model);
    const encoded = encoder.encode(stringToTokenize);
    const length = encoded.length;
    return c.json({ tokens: length });
  },
);

export default tokenize;
