import type { PagesFunction } from '@cloudflare/workers-types';
import OpenAI from 'openai';

// @ts-ignore
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

  const params: OpenAI.ChatCompletionCreateParams = await request.json();

  if (params.messages == null) throw new Error('No prompt was provided');

  // make our request to the OpenAI API
  const completion = await openai.chat.completions.create({
    ...params,
    stream: false,
  });
  console.dir(completion);

  const message = completion.choices[0].message;
  console.dir(message);

  const json = JSON.stringify({ success: true, message });

  return new Response(json, { headers: { 'content-type': 'application/json;charset=UTF-8' } });
};
