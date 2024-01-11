import { type User } from '@auth0/auth0-vue';

interface Env {
  DB: D1Database;
}

export const onRequest: PagesFunction<Env> = async ({ env }) => {
  // Create a prepared statement with our query
  const ps = env.DB.prepare('SELECT * from Users');
  const { results } = await ps.all();

  return new Response(JSON.stringify(results));
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const { name, email, sub } = (await request.json()) as User;
  if (!sub) throw new Error('Missing sub value for new user');
  if (!name) throw new Error('Missing name value for new user');
  if (!email) throw new Error('Missing email value for new user');

  const { success } = await env.DB.prepare(
    'INSERT INTO Users (sub_id, name, email) VALUES (?, ?, ?)',
  )
    .bind(sub, name, email)
    .run();
  if (success) {
    return new Response('User created successfully', { status: 201 });
  } else {
    throw new Error('Error creating user');
  }
};
