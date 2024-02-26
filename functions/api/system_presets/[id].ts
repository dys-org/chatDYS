import { type SystemPreset } from '../../../src/stores/systemPresets.js';
import { HTTPError } from '../../../src/utils/exceptions.js';
import { getSubject } from '../_middleware.js';

interface Env {
  DB: D1Database;
}

async function validateSubject({ request, env, id }: { request: Request; env: Env; id: string }) {
  const subject = getSubject(request);
  const data = await env.DB.prepare('SELECT sub from System_Presets WHERE id = ?1')
    .bind(id)
    .first();
  if (data.sub !== subject) throw new HTTPError(403, 'User does not own this preset');
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env, params }) => {
  const id = typeof params.id === 'string' ? params.id : params.id[0];
  await validateSubject({ request, env, id });

  // Create a prepared statement with our query
  const data = await env.DB.prepare('SELECT * from System_Presets WHERE id = ?1').bind(id).first();

  return Response.json(data);
};

export const onRequestPut: PagesFunction<Env> = async ({ request, env, params }) => {
  const id = typeof params.id === 'string' ? params.id : params.id[0];
  await validateSubject({ request, env, id });

  const { name, text } = (await request.json()) as SystemPreset;
  if (!name) throw new Error('Missing name value');
  if (!text) throw new Error('Missing text value');

  const info = await env.DB.prepare(
    'UPDATE System_Presets SET updated_at = CURRENT_TIMESTAMP, name = ?1, text = ?2 WHERE id = ?3',
  )
    .bind(name, text, id)
    .run();
  if (info.success) {
    return Response.json(info, { status: 200 });
  } else {
    throw new Error('Error updating preset');
  }
};

export const onRequestDelete: PagesFunction<Env> = async ({ request, env, params }) => {
  const id = typeof params.id === 'string' ? params.id : params.id[0];
  await validateSubject({ request, env, id });

  const info = await env.DB.prepare('DELETE FROM System_Presets WHERE id = ?1').bind(id).run();

  if (info.success) {
    return new Response(null, { status: 204 });
  } else {
    throw new Error('Error deleting preset');
  }
};
