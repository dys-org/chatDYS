import { type User } from '@auth0/auth0-vue';

import { HTTPError } from '../../../src/utils/exceptions.js';
interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async ({ env, params }) => {
  // decode the sub_id, it uses a | which is encoded to %7C
  const subString = typeof params.sub_id === 'string' ? params.sub_id : params.sub_id[0];
  const sub_id = decodeURIComponent(subString);

  // Create a prepared statement with our query
  const data = await env.DB.prepare('SELECT * from users WHERE sub_id = ?').bind(sub_id).first();

  // check if data is empty object
  if (data == null) throw new HTTPError(404, 'User not found');

  return Response.json(data);
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const { name, email, sub } = (await request.json()) as User;
  if (!sub) throw new Error('Missing sub value for new comment');
  if (!name) throw new Error('Missing name value for new comment');
  if (!email) throw new Error('Missing email value for new comment');

  const { success } = await env.DB.prepare(
    'INSERT INTO users (sub_id, name, email) VALUES (?, ?, ?)',
  )
    .bind(sub, name, email)
    .run();
  if (success) {
    return new Response('User created successfully', { status: 201 });
  } else {
    throw new Error('Error creating user');
  }
};
