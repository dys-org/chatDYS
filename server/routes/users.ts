import { eq } from 'drizzle-orm';
import { Hono } from 'hono';

import { db } from '../drizzle/db.js';
import type { Session, User } from '../drizzle/schema.js';
import { Users } from '../drizzle/schema.js';

const users = new Hono<{
  Variables: {
    user: User | null;
    session: Session | null;
  };
}>()
  .get('/', async (c) => {
    // TODO restrict access
    const ps = db.select().from(Users).prepare();
    const data = ps.all();
    return c.json(data);
  })
  .get('/current', async (c) => {
    const user = c.get('user');
    if (!user) return c.text('User is not logged in.', 401);

    const ps = db.select().from(Users).where(eq(Users.id, user.id)).prepare();
    const data = ps.get();
    if (data === undefined) return c.text('User not found.', 404);

    return c.json(data);
  });

export default users;
