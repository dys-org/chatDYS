import { zValidator } from '@hono/zod-validator';
import { asc, eq, sql } from 'drizzle-orm';
import { Hono } from 'hono';
import type { Session, User } from 'lucia';

import { db } from '../drizzle/db.js';
import { System_Presets, insertSystemPresetsSchema } from '../drizzle/schema.js';
import { userCanEdit } from '../utils.js';

const systemPresets = new Hono<{
  Variables: {
    user: User | null;
    session: Session | null;
  };
}>()
  .get('/', async (c) => {
    const user = c.get('user');
    if (!user) return c.text('User is not logged in.', 401);

    const { id, user_id, name, text, created_at, updated_at } = System_Presets;
    const ps = db
      .select({ id, user_id, name, text, created_at, updated_at })
      .from(System_Presets)
      .where(eq(System_Presets.user_id, sql.placeholder('user_id')))
      .orderBy(asc(System_Presets.name))
      .prepare();
    const data = ps.all({ user_id: user.id });
    return c.json(data);
  })
  .post(
    '/',
    zValidator('json', insertSystemPresetsSchema, (result, c) => {
      if (!result.success) c.text(result.error.message, 400);
    }),
    async (c) => {
      const user = c.get('user');
      if (!user) return c.text('User is not logged in.', 401);

      const preset = c.req.valid('json');
      const res = await db
        .insert(System_Presets)
        .values({ ...preset, user_id: user.id })
        .returning();
      return c.json(res[0], 201);
    },
  )
  .put(
    '/:id',
    zValidator('json', insertSystemPresetsSchema, (result, c) => {
      if (!result.success) c.text(result.error.message, 400);
    }),
    async (c) => {
      const user = c.get('user');
      if (!user) return c.text('User is not logged in.', 401);

      if (!userCanEdit(user.id, parseInt(c.req.param('id')), System_Presets)) {
        return c.text('User cannot edit this conversation.', 403);
      }

      const preset = c.req.valid('json');
      const res = await db
        .update(System_Presets)
        .set({ ...preset, user_id: user.id })
        .where(eq(System_Presets.id, parseInt(c.req.param('id'))))
        .returning();

      return c.json(res[0]);
    },
  )
  .delete('/:id', async (c) => {
    const user = c.get('user');
    if (!user) return c.text('User is not logged in.', 401);

    if (!userCanEdit(user.id, parseInt(c.req.param('id')), System_Presets)) {
      return c.text('User cannot edit this conversation.', 403);
    }

    const ps = db
      .delete(System_Presets)
      .where(eq(System_Presets.id, parseInt(c.req.param('id'))))
      .prepare();
    const info = ps.run();
    return c.json(info);
  });

export default systemPresets;
