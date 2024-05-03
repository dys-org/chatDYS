import { desc, eq, sql } from 'drizzle-orm';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { Session, User } from 'lucia';

import { db } from '../drizzle/db';
import { type ConversationInsert, Conversations } from '../drizzle/schema';

const app = new Hono<{ Variables: { user: User | null; session: Session | null } }>();

app.get('/', async (c) => {
  const user = c.get('user');
  if (!user) throw new HTTPException(401, { message: 'User not found in request authorization.' });
  // SELECT id, user_id, title, model, created_at, updated_at from Conversations WHERE user_id = ?1 ORDER BY created_at DESC
  const { id, user_id, title, model, created_at, updated_at } = Conversations;
  const ps = db
    .select({ id, user_id, title, model, created_at, updated_at })
    .from(Conversations)
    .where(eq(Conversations.user_id, sql.placeholder('user_id')))
    .orderBy(desc(Conversations.created_at))
    .prepare();
  const data = ps.all({ user_id: user.id });
  return c.json(data);
});

app.post('/', async (c) => {
  // INSERT INTO Conversations (user_id, model, temperature, max_tokens, system_message, messages, title) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
  const convo: ConversationInsert = await c.req.json();

  // TODO validate with zod
  const { model, temperature, max_tokens, system_message, messages, title } = convo;
  if (!model) throw new Error('Missing model value');
  if (!temperature === undefined) throw new Error('Missing temperature value');
  if (!max_tokens === undefined) throw new Error('Missing max_tokens value');
  if (!system_message) throw new Error('Missing system_message value');
  if (!messages) throw new Error('Missing messages value');
  if (!title) throw new Error('Missing title value');

  const ps = db.insert(Conversations).values(convo).prepare();
  const info = ps.run();
  return c.json({ info }, 201);
});

app.get('/:id', async (c) => {
  // SELECT * from Conversations WHERE id = ?1
  const ps = db
    .select()
    .from(Conversations)
    .where(eq(Conversations.id, parseInt(c.req.param('id'))))
    .prepare();
  const data = ps.get();
  return c.json(data);
});

app.put('/:id', async (c) => {
  // UPDATE Conversations SET updated_at = CURRENT_TIMESTAMP, model = ?1, temperature = ?2, max_tokens = ?3, system_message = ?4, messages = ?5 WHERE id = ?6
  const convo: ConversationInsert = await c.req.json();

  // TODO validate with zod
  const { model, temperature, max_tokens, system_message, messages } = convo;
  if (!model) throw new Error('Missing model value');
  if (!temperature === undefined) throw new Error('Missing temperature value');
  if (!max_tokens === undefined) throw new Error('Missing max_tokens value');
  if (!system_message) throw new Error('Missing system_message value');
  if (!messages) throw new Error('Missing messages value');

  const ps = db
    .update(Conversations)
    .set(convo)
    .where(eq(Conversations.id, parseInt(c.req.param('id'))))
    .prepare();
  const info = ps.run();
  // c.status(200);
  return c.json({ info });
});

app.patch('/:id', async (c) => {
  // UPDATE Conversations SET updated_at = CURRENT_TIMESTAMP, messages = ?1 WHERE id = ?2
  const messages: ConversationInsert['messages'] = await c.req.text();

  // TODO validate with zod
  if (!messages) throw new Error('Missing messages value');

  const ps = db
    .update(Conversations)
    .set({ messages })
    .where(eq(Conversations.id, parseInt(c.req.param('id'))))
    .prepare();
  const info = ps.run();
  // c.status(200);
  return c.json({ info });
});

app.delete('/:id', async (c) => {
  // DELETE FROM Conversations WHERE id = ?1
  const ps = db
    .delete(Conversations)
    .where(eq(Conversations.id, parseInt(c.req.param('id'))))
    .prepare();
  const info = ps.run();
  return c.json({ info }, 204);
});

export default app;
