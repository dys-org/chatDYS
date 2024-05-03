import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { Session, User } from 'lucia';

import { db } from '../drizzle/db';
import { type UserInsert, Users } from '../drizzle/schema';

const app = new Hono<{ Variables: { user: User | null; session: Session | null } }>();

app.get('/', async (c) => {
  // SELECT * from Users
  const ps = db.select().from(Users).prepare();
  const data = ps.all();
  return c.json(data);
});

app.post('/', async (c) => {
  // INSERT INTO Users (id, name, email) VALUES (?1, ?2, ?3)
  const user: UserInsert = await c.req.json();

  // TODO validate with zod
  const { name, email } = user;
  if (!name) throw new Error('Missing name value for new user');
  if (!email) throw new Error('Missing email value for new user');

  const ps = db.insert(Users).values(user).prepare();
  const info = ps.run();
  return c.json({ info }, 201);
});

app.get('/current', async (c) => {
  const user = c.get('user');
  if (!user) throw new HTTPException(401, { message: 'User not found in request authorization.' });
  // SELECT * from Users WHERE id = ?1
  const ps = db.select().from(Users).where(eq(Users.id, user.id)).prepare();
  const data = ps.get();
  // check if data is empty object
  if (data === undefined) throw new HTTPException(404, { message: 'User not found' });
  return c.json(data);
});

app.get('/:id', async (c) => {
  // SELECT * from Users WHERE id = ?1
  const ps = db
    .select()
    .from(Users)
    .where(eq(Users.id, c.req.param('id')))
    .prepare();
  const data = ps.get();
  return c.json(data);
});

export default app;
