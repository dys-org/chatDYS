import { type Conversation } from '../../../src/stores/chat.js';
import { HTTPError } from '../../../src/utils/exceptions.js';
import { getSubject } from '../_middleware.js';

interface Env {
  DB: D1Database;
}

async function validateSubject({ request, env, id }: { request: Request; env: Env; id: string }) {
  const subject = getSubject(request);
  const data = await env.DB.prepare('SELECT sub from Conversations WHERE id = ?1').bind(id).first();
  if (data.sub !== subject) throw new HTTPError(403, 'User does not own this conversation');
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env, params }) => {
  const id = typeof params.id === 'string' ? params.id : params.id[0];
  await validateSubject({ request, env, id });

  // Create a prepared statement with our query
  const data = await env.DB.prepare('SELECT * from Conversations WHERE id = ?1').bind(id).first();

  return Response.json(data);
};

export const onRequestPut: PagesFunction<Env> = async ({ request, env, params }) => {
  const id = typeof params.id === 'string' ? params.id : params.id[0];
  await validateSubject({ request, env, id });

  const { model, temperature, max_tokens, system_message, messages } =
    (await request.json()) as Omit<Conversation, 'id'>;
  if (!model) throw new Error('Missing model value');
  if (!temperature === undefined) throw new Error('Missing temperature value');
  if (!max_tokens === undefined) throw new Error('Missing max_tokens value');
  if (!system_message) throw new Error('Missing system_message value');
  if (!messages) throw new Error('Missing messages value');

  const info = await env.DB.prepare(
    'UPDATE Conversations SET updated_at = CURRENT_TIMESTAMP, model = ?1, temperature = ?2, max_tokens = ?3, system_message = ?4, messages = ?5 WHERE id = ?6',
  )
    .bind(model, temperature, max_tokens, system_message, messages, id)
    .run();
  if (info.success) {
    return Response.json(info, { status: 200 });
  } else {
    throw new Error('Error updating conversation');
  }
};

export const onRequestPatch: PagesFunction<Env> = async ({ request, env, params }) => {
  const id = typeof params.id === 'string' ? params.id : params.id[0];
  await validateSubject({ request, env, id });
  // don't parse the messages, we just want the string to save to the database
  const messages = (await request.text()) as Conversation['messages'];
  if (!messages) throw new Error('Missing messages value');

  const info = await env.DB.prepare(
    'UPDATE Conversations SET updated_at = CURRENT_TIMESTAMP, messages = ?1 WHERE id = ?2',
  )
    .bind(messages, id)
    .run();
  if (info.success) {
    return Response.json(info, { status: 200 });
  } else {
    throw new Error('Error updating messages');
  }
};

export const onRequestDelete: PagesFunction<Env> = async ({ request, env, params }) => {
  const id = typeof params.id === 'string' ? params.id : params.id[0];
  await validateSubject({ request, env, id });

  const info = await env.DB.prepare('DELETE FROM Conversations WHERE id = ?1').bind(id).run();

  if (info.success) {
    return new Response(null, { status: 204 });
  } else {
    throw new Error('Error deleting conversation');
  }
};
