import { Hono } from 'hono';
import { db } from '../../drizzle/db';
import { Users, type UserInsert } from '../../drizzle/schema';
import { HTTPException } from 'hono/http-exception';
import { eq } from 'drizzle-orm';

const app = new Hono();

app.get('/', async (c) => {
  // SELECT * from Users
  const ps = db.select().from(Users).prepare();
  const data = ps.all();
  return c.json(data);
});

app.post('/', async (c) => {
  // INSERT INTO Users (sub, name, email) VALUES (?1, ?2, ?3)
  const user: UserInsert = await c.req.json();

  // TODO validate with zod
  const { name, email } = user;
  if (!name) throw new Error('Missing name value for new user');
  if (!email) throw new Error('Missing email value for new user');

  const ps = db.insert(Users).values(user).prepare();
  const info = ps.run();
  c.status(201);
  return c.json({ info });
});

app.get('/current', async (c) => {
  // SELECT * from Users WHERE sub = ?1
  // TODO get sub from auth
  const ps = db.select().from(Users).where(eq(Users.sub, 'github|26875701')).prepare();
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
    .where(eq(Users.id, parseInt(c.req.param('id'))))
    .prepare();
  const data = ps.get();
  return c.json(data);
});

export default app;
