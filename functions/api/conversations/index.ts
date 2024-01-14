import type { Conversation, Message } from '../../../src/stores/chat.js';

interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  // Create a prepared statement with our query
  const ps = env.DB.prepare('SELECT id, user_id, messages from Conversations');
  const { results } = await ps.all<Pick<Conversation, 'id' | 'user_id' | 'messages'>>();
  const convos = results.map((r) => ({
    ...r,
    // first message is always the prompt
    title: (JSON.parse(r.messages)[0] as Message).content,
    messages: undefined,
  }));

  return new Response(JSON.stringify(convos));
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const { user_id, model, temperature, max_tokens, system_message, messages } =
    (await request.json()) as Omit<Conversation, 'id'>;
  if (!user_id) throw new Error('Missing user_id value');
  if (!model) throw new Error('Missing model value');
  if (!temperature === undefined) throw new Error('Missing temperature value');
  if (!max_tokens === undefined) throw new Error('Missing max_tokens value');
  if (!system_message) throw new Error('Missing system_message value');
  if (!messages) throw new Error('Missing messages value');

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
