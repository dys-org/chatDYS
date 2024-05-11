import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { Session, User } from 'lucia';

import { db } from '../drizzle/db';
import { Users } from '../drizzle/schema';

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
    if (!user) return c.json({ message: 'User is null.' }, 401);

    const ps = db.select().from(Users).where(eq(Users.id, user.id)).prepare();
    const data = ps.get();
    if (data === undefined) return c.json({ message: 'User not found.' }, 404);

    return c.json(data);
  });
// .get('/:id', async (c) => {
//   const ps = db
//     .select()
//     .from(Users)
//     .where(eq(Users.id, c.req.param('id')))
//     .prepare();
//   const data = ps.get();
//   if (data === undefined) return c.json({ message: 'User not found.' }, 404);

//   return c.json(data);
// });

export default users;