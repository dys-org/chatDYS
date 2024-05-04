import { zValidator } from '@hono/zod-validator';
import { asc, eq, sql } from 'drizzle-orm';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { Session, User } from 'lucia';
import { z } from 'zod';

import { db } from '../drizzle/db';
import { System_Presets } from '../drizzle/schema';
import { validateOwnership } from '../utils';

const presetSchema = z.object({
  name: z.string(),
  text: z.string(),
});

const systemPresets = new Hono<{
  Variables: {
    user: User | null;
    session: Session | null;
  };
}>()
  .get('/', async (c) => {
    const user = c.get('user');
    if (!user) {
      throw new HTTPException(401, { message: 'User not found in request authorization.' });
    }
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
    zValidator('json', presetSchema, (result) => {
      if (!result.success) {
        throw new HTTPException(400, { message: result.error.message });
      }
    }),
    async (c) => {
      const user = c.get('user');
      if (!user) {
        throw new HTTPException(401, { message: 'User not found in request authorization.' });
      }
      const preset = c.req.valid('json');
      const ps = db
        .insert(System_Presets)
        .values({ ...preset, user_id: user.id })
        .prepare();
      const info = ps.run();
      return c.json({ info }, 201);
    },
  )
  .put(
    '/:id',
    zValidator('json', presetSchema, (result) => {
      if (!result.success) {
        throw new HTTPException(400, { message: result.error.message });
      }
    }),
    async (c) => {
      const user = c.get('user');
      if (!user) {
        throw new HTTPException(401, { message: 'User not found in request authorization.' });
      }
      await validateOwnership(user.id, parseInt(c.req.param('id')), System_Presets);

      const preset = c.req.valid('json');
      const ps = db
        .update(System_Presets)
        .set({ ...preset, user_id: user.id })
        .where(eq(System_Presets.id, parseInt(c.req.param('id'))))
        .prepare();
      const info = ps.run();
      return c.json({ info });
    },
  )
  .delete('/:id', async (c) => {
    const user = c.get('user');
    if (!user) {
      throw new HTTPException(401, { message: 'User not found in request authorization.' });
    }
    await validateOwnership(user.id, parseInt(c.req.param('id')), System_Presets);

    const ps = db
      .delete(System_Presets)
      .where(eq(System_Presets.id, parseInt(c.req.param('id'))))
      .prepare();
    const info = ps.run();
    return c.json({ info }, 200);
  });

export default systemPresets;
