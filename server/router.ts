import { Router } from 'express';
import { encode } from 'gpt-tokenizer';

import { openai } from '.';

const router: Router = Router();

// CHAT COMPLETION
router.post('/chat', async (req, res, next) => {
  const { model, messages, temperature } = req.body;
  console.log(req.body);
  try {
    if (messages == null) throw new Error('No prompt was provided');
    if (model == null) throw new Error('No model was provided');

    const completion = await openai.chat.completions.create({
      model,
      messages,
    });
    console.dir(completion);
    const message = completion.choices[0].message;
    console.dir(message);

    return res.status(200).json({ success: true, message, temperature });
  } catch (err: any) {
    next(err);
  }
});

// TOKEN COUNTER
router.post('/tokenize', async (req, res, next) => {
  const str = req.body.stringToTokenize;
  try {
    if (str == null) {
      throw new Error('No string was provided');
    }

    const encoded = encode(str);
    const length = encoded.length;
    console.log('Token count is ' + length);

    return res.status(200).json({ success: true, tokens: length });
  } catch (err: any) {
    next(err);
  }
});

export default router;
