import type { Conversation } from '../../../src/stores/chat.js';
import { getSubject } from '../_middleware.js';

interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const subject = getSubject(request);
  // Create a prepared statement with our query
  const ps = env.DB.prepare(
    'SELECT id, sub, title, model, created_at, updated_at from Conversations WHERE sub = ?',
  ).bind(subject);
  const { results } = await ps.all<Conversation>();

  return new Response(JSON.stringify(results));
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const subject = getSubject(request);
  const { model, temperature, max_tokens, system_message, messages, title } =
    (await request.json()) as Omit<Conversation, 'id'>;
  if (!model) throw new Error('Missing model value');
  if (!temperature === undefined) throw new Error('Missing temperature value');
  if (!max_tokens === undefined) throw new Error('Missing max_tokens value');
  if (!system_message) throw new Error('Missing system_message value');
  if (!messages) throw new Error('Missing messages value');
  if (!title) throw new Error('Missing title value');

  const info = await env.DB.prepare(
    'INSERT INTO Conversations (sub, model, temperature, max_tokens, system_message, messages, title) VALUES (?, ?, ?, ?, ?, ?, ?)',
  )
    .bind(subject, model, temperature, max_tokens, system_message, messages, title)
    .run();
  if (info.success) {
    return new Response(JSON.stringify(info), { status: 201 });
  } else {
    throw new Error('Error saving conversation');
  }
};
