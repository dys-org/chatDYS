import { HTTPError } from '../../../src/utils/exceptions.js';
import { getSubject } from '../_middleware.js';

interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  const subject = getSubject(request);

  // Create a prepared statement with our query
  const data = await env.DB.prepare('SELECT * from Users WHERE sub = ?').bind(subject).first();

  // check if data is empty object
  if (data == null) throw new HTTPError(404, 'User not found');

  return Response.json(data);
};
