import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
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
    // SELECT * from Users
    const ps = db.select().from(Users).prepare();
    const data = ps.all();
    return c.json(data);
  })
  .get('/current', async (c) => {
    const user = c.get('user');
    if (!user)
      throw new HTTPException(401, { message: 'User not found in request authorization.' });
    // SELECT * from Users WHERE id = ?1
    const ps = db.select().from(Users).where(eq(Users.id, user.id)).prepare();
    const data = ps.get();
    // check if data is empty object
    if (data === undefined) throw new HTTPException(404, { message: 'User not found' });
    return c.json(data);
  });

// .get('/:id', async (c) => {
//   // SELECT * from Users WHERE id = ?1
//   const ps = db
//     .select()
//     .from(Users)
//     .where(eq(Users.id, c.req.param('id')))
//     .prepare();
//   const data = ps.get();
//   return c.json(data);
// });

export default users;
