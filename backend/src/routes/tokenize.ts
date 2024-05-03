import { Hono } from 'hono';
import { type TiktokenModel, encodingForModel } from 'js-tiktoken';

interface TokenizeRequest {
  stringToTokenize: string;
  model: TiktokenModel;
}

const tokenize = new Hono();

tokenize.get('/', async (c) => {
  const { stringToTokenize, model }: TokenizeRequest = await c.req.json();
  if (stringToTokenize == null) throw new Error('No string was provided');
  const encoder = encodingForModel(model);
  const encoded = encoder.encode(stringToTokenize);
  const length = encoded.length;
  return c.json({ tokens: length });
});

export default tokenize;
