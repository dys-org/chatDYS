import type { Handler } from '@netlify/functions';
import OpenAI from 'openai';

export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const handler: Handler = async (event) => {
  const { model, messages, temperature } = JSON.parse(event.body ?? '');
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

    return {
      body: JSON.stringify({ success: true, message, temperature }),
      statusCode: 200,
    };
  } catch (err: any) {
    if (err instanceof OpenAI.APIError) {
      const { status, message, code, type } = err;
      return {
        body: JSON.stringify({ message, code, type }),
        statusCode: status ?? 500,
      };
    }
    console.error('chat error: ', err);
    const { errorType, errorMessage, stack } = err;
    return {
      body: JSON.stringify({ message: errorMessage, type: errorType, stack }),
      statusCode: err.statusCode ?? err.status ?? 500,
    };
  }
};
