import { type User } from '@auth0/auth0-vue';

import { getSubject } from '../_middleware.js';

interface Env {
  DB: D1Database;
}

// TODO the ability to fetch all users should be restricted to admins
export const onRequest: PagesFunction<Env> = async ({ env }) => {
  // Create a prepared statement with our query
  const ps = env.DB.prepare('SELECT * from Users');
  const { results } = await ps.all();

  return Response.json(results);
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const subject = getSubject(request);
  const { name, email } = (await request.json()) as User;
  if (!name) throw new Error('Missing name value for new user');
  if (!email) throw new Error('Missing email value for new user');

  const { success } = await env.DB.prepare(
    'INSERT INTO Users (sub, name, email) VALUES (?1, ?2, ?3)',
  )
    .bind(subject, name, email)
    .run();
  if (success) {
    return new Response('User created successfully', { status: 201 });
  } else {
    throw new Error('Error creating user');
  }
};
