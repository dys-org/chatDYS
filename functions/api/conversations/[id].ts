import { type ConversationDetail } from '../../../src/stores/chat.js';
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
