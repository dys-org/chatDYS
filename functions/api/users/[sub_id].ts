import { HTTPError } from '../../../src/utils/exceptions.js';
interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async ({ env, params }) => {
  // decode the sub_id, it uses a | which is encoded to %7C
  const subString = typeof params.sub_id === 'string' ? params.sub_id : params.sub_id[0];
  const sub_id = decodeURIComponent(subString);

  // Create a prepared statement with our query
  const data = await env.DB.prepare('SELECT * from Users WHERE sub_id = ?').bind(sub_id).first();

  // check if data is empty object
  if (data == null) throw new HTTPError(404, 'User not found');

  return new Response(JSON.stringify(data));
};
