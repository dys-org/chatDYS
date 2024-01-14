import { type Conversation } from '../../../src/stores/chat.js';
import { HTTPError } from '../../../src/utils/exceptions.js';
interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async ({ env, params }) => {
  const id = typeof params.id === 'string' ? params.id : params.id[0];

  // Create a prepared statement with our query
  const data = await env.DB.prepare('SELECT * from Conversations WHERE id = ?').bind(id).first();

  // check if data is empty object
  if (data == null) throw new HTTPError(404, 'Conversation not found');

  return new Response(JSON.stringify(data));
};

export const onRequestPut: PagesFunction<Env> = async ({ request, env, params }) => {
  const id = typeof params.id === 'string' ? params.id : params.id[0];
  const { user_id, model, temperature, max_tokens, system_message, messages } =
    (await request.json()) as Omit<Conversation, 'id'>;
  if (!user_id) throw new Error('Missing user_id value');
  if (!model) throw new Error('Missing model value');
  if (!temperature === undefined) throw new Error('Missing temperature value');
  if (!max_tokens === undefined) throw new Error('Missing max_tokens value');
  if (!system_message) throw new Error('Missing system_message value');
  if (!messages) throw new Error('Missing messages value');

  const info = await env.DB.prepare(
    'UPDATE Conversations SET user_id = ?, model = ?, temperature = ?, max_tokens = ?, system_message = ?, messages = ? WHERE id = ?',
  )
    .bind(user_id, model, temperature, max_tokens, system_message, messages, id)
    .run();
  if (info.success) {
    return new Response(JSON.stringify(info), { status: 200 });
  } else {
    throw new Error('Error updating conversation');
  }
};
