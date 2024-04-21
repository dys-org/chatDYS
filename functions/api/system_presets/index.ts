import { type SystemPreset } from "../../../frontend/src/stores/systemPresets.js";
import { getSubject } from "../_middleware.js";

interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const subject = getSubject(request);
  // Create a prepared statement with our query
  const ps = env.DB.prepare(
    "SELECT id, sub, name, text, created_at, updated_at from System_Presets WHERE sub = ?1 ORDER BY name ASC"
  ).bind(subject);
  const { results } = await ps.all<SystemPreset>();

  return Response.json(results);
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const subject = getSubject(request);
  const { name, text } = (await request.json()) as SystemPreset;
  if (!name) throw new Error("Missing name value");
  if (!text) throw new Error("Missing text value");

  const info = await env.DB.prepare(
    "INSERT INTO System_Presets (sub, name, text) VALUES (?1, ?2, ?3)"
  )
    .bind(subject, name, text)
    .run();
  if (info.success) {
    return Response.json(info, { status: 201 });
  } else {
    throw new Error("Error saving preset");
  }
};
