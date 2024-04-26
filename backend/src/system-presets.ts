import { Hono } from 'hono';
import { db } from '../drizzle/db';
import { System_Presets, type SystemPresetInsert } from '../drizzle/schema';
import { asc, eq, sql } from 'drizzle-orm';

const app = new Hono();

app.get('/', async (c) => {
  // SELECT id, sub, name, text, created_at, updated_at from System_Presets WHERE sub = ?1 ORDER BY name ASC
  const { id, sub, name, text, created_at, updated_at } = System_Presets;
  const ps = db
    .select({ id, sub, name, text, created_at, updated_at })
    .from(System_Presets)
    .where(eq(System_Presets.sub, sql.placeholder('sub')))
    .orderBy(asc(System_Presets.name))
    .prepare();

  const data = ps.all({ sub: 'github|26875701' }); // TODO get sub from auth
  return c.json(data);
});

app.post('/', async (c) => {
  // INSERT INTO System_Presets (sub, name, text) VALUES (?1, ?2, ?3)
  const preset: SystemPresetInsert = await c.req.json(); // validate with zod
  const ps = db.insert(System_Presets).values(preset).prepare();
  const info = ps.run();
  c.status(201);
  return c.json({ info });
});

app.get('/:id', async (c) => {
  // SELECT * from System_Presets WHERE id = ?1
  const ps = db
    .select()
    .from(System_Presets)
    .where(eq(System_Presets.id, parseInt(c.req.param('id'))))
    .prepare();
  const data = ps.get();
  return c.json(data);
});

app.put('/:id', async (c) => {
  // UPDATE System_Presets SET updated_at = CURRENT_TIMESTAMP, name = ?1, text = ?2 WHERE id = ?3
  const preset: SystemPresetInsert = await c.req.json();
  const ps = db
    .update(System_Presets)
    .set(preset)
    .where(eq(System_Presets.id, parseInt(c.req.param('id'))))
    .prepare();
  const info = ps.run();
  return c.json({ info });
});

app.delete('/:id', async (c) => {
  // DELETE FROM System_Presets WHERE id = ?1
  const ps = db
    .delete(System_Presets)
    .where(eq(System_Presets.id, parseInt(c.req.param('id'))))
    .prepare();
  const info = ps.run();
  c.status(204);
  return c.json({ info });
});

export default app;
