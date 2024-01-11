import { type ConversationDetail } from '../../../src/stores/chat.js';

interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  // Create a prepared statement with our query
  const ps = env.DB.prepare('SELECT id, user_id, messages from Conversations');
  const { results } = await ps.all();
  const convos = results.map((r) => ({
    ...r,
    // first message is always the prompt
    title: JSON.parse(r.messages as string)[0].content,
    messages: undefined,
  }));

  return new Response(JSON.stringify(convos));
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const { user_id, model, temperature, max_tokens, system_message, messages } =
    (await request.json()) as Omit<ConversationDetail, 'id'>;
  if (!user_id) throw new Error('Missing id value for new conversation');
  if (!model) throw new Error('Missing model value for new conversation');
  if (!temperature === undefined) throw new Error('Missing temperature value for new conversation');
  if (!max_tokens === undefined) throw new Error('Missing max_tokens value for new conversation');
  if (!system_message) throw new Error('Missing system_message value for new conversation');
  if (!messages) throw new Error('Missing messages value for new conversation');

  const info = await env.DB.prepare(
    'INSERT INTO Conversations (user_id, model, temperature, max_tokens, system_message, messages) VALUES (?, ?, ?, ?, ?, ?)',
  )
    .bind(user_id, model, temperature, max_tokens, system_message, messages)
    .run();
  if (info.success) {
    return new Response(JSON.stringify(info), { status: 201 });
  } else {
    throw new Error('Error saving conversation');
  }
};
