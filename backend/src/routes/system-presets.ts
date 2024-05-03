import { asc, eq, sql } from 'drizzle-orm';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { Session, User } from 'lucia';

import { db } from '../drizzle/db';
import { type SystemPresetInsert, System_Presets } from '../drizzle/schema';

const systemPresets = new Hono<{ Variables: { user: User | null; session: Session | null } }>();

systemPresets.get('/', async (c) => {
  const user = c.get('user');
  if (!user) throw new HTTPException(401, { message: 'User not found in request authorization.' });
  // SELECT id, user_id, name, text, created_at, updated_at from System_Presets WHERE user_id = ?1 ORDER BY name ASC
  const { id, user_id, name, text, created_at, updated_at } = System_Presets;
  const ps = db
    .select({ id, user_id, name, text, created_at, updated_at })
    .from(System_Presets)
    .where(eq(System_Presets.user_id, sql.placeholder('user_id')))
    .orderBy(asc(System_Presets.name))
    .prepare();
  const data = ps.all({ user_id: user.id });
  return c.json(data);
});

systemPresets.post('/', async (c) => {
  // INSERT INTO System_Presets (user_id, name, text) VALUES (?1, ?2, ?3)
  const preset: SystemPresetInsert = await c.req.json();

  // validate with zod
  const { name, text } = preset;
  if (!name) throw new Error('Missing name value');
  if (!text) throw new Error('Missing text value');

  const ps = db.insert(System_Presets).values(preset).prepare();
  const info = ps.run();
  return c.json({ info }, 201);
});

systemPresets.get('/:id', async (c) => {
  // SELECT * from System_Presets WHERE id = ?1
  const ps = db
    .select()
    .from(System_Presets)
    .where(eq(System_Presets.id, parseInt(c.req.param('id'))))
    .prepare();
  const data = ps.get();
  return c.json(data);
});

systemPresets.put('/:id', async (c) => {
  // UPDATE System_Presets SET updated_at = CURRENT_TIMESTAMP, name = ?1, text = ?2 WHERE id = ?3
  const preset: SystemPresetInsert = await c.req.json();

  // validate with zod
  const { name, text } = preset;
  if (!name) throw new Error('Missing name value');
  if (!text) throw new Error('Missing text value');

  const ps = db
    .update(System_Presets)
    .set(preset)
    .where(eq(System_Presets.id, parseInt(c.req.param('id'))))
    .prepare();
  const info = ps.run();
  return c.json({ info });
});

systemPresets.delete('/:id', async (c) => {
  // DELETE FROM System_Presets WHERE id = ?1
  const ps = db
    .delete(System_Presets)
    .where(eq(System_Presets.id, parseInt(c.req.param('id'))))
    .prepare();
  const info = ps.run();
  return c.json({ info }, 200);
});

export default systemPresets;
