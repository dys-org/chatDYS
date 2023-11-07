import cors from 'cors';
import { config as dotenvConfig } from 'dotenv';
import express from 'express';
import { encode } from 'gpt-3-encoder';
import OpenAI from 'openai';

dotenvConfig();
dotenvConfig({ path: `.env.local`, override: true });

const port = process.env.API_PORT || 3000;
const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// CHAT COMPLETION
app.post('/chat', async (req, res) => {
  const { model, messages } = req.body;
  console.log(req.body);
  try {
    if (messages == null) throw new Error('No prompt was provided');
    if (model == null) throw new Error('No model was provided');

    const completion = await openai.chat.completions.create({
      model,
      messages,
    });
    console.dir(completion.choices[0]);
    const message = completion.choices[0].message;

    return res.status(200).json({ success: true, message });
    // return res
    //   .status(200)
    //   .json({ success: true, message: { user: 'assistant', content: 'ass and titties' } });
  } catch (err: any) {
    if (err instanceof OpenAI.APIError) {
      const { status, message, code, type } = err;
      console.error(`API error: ${status}`);
      console.error(message);
      console.error(`code: ${code}} | type: ${type}}`);
    } else {
      // Non-API error
      console.error(err);
    }
  }
});

// TOKEN COUNTER
app.post('/tokenize', async (req, res) => {
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
    console.error(err.message);
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
