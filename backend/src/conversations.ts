import { Hono } from 'hono';
import { db } from '../drizzle/db';
import { desc, eq, sql } from 'drizzle-orm';
import { conversations, type ConversationInsert } from '../drizzle/schema';

const app = new Hono();

app.get('/conversations', async (c) => {
  // SELECT id, sub, title, model, created_at, updated_at from Conversations WHERE sub = ?1 ORDER BY created_at DESC
  const { id, sub, title, model, created_at, updated_at } = conversations;
  const ps = db
    .select({ id, sub, title, model, created_at, updated_at })
    .from(conversations)
    .where(eq(conversations.sub, sql.placeholder('sub')))
    .orderBy(desc(conversations.created_at))
    .prepare();
  // Query syntax
  // const data = await db.query.conversations.findMany({
  //   columns: { id: true, sub: true, title: true, model: true, created_at: true, updated_at: true },
  //   where: eq(conversations.sub, 'github|26875701'),
  //   orderBy: desc(conversations.created_at),
  // });
  const data = ps.all({ sub: 'github|26875701' });
  return c.json(data);
});

app.post('/conversations', async (c) => {
  // INSERT INTO Conversations (sub, model, temperature, max_tokens, system_message, messages, title) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
  const convo: ConversationInsert = await c.req.json();
  const ps = db.insert(conversations).values(convo).prepare();
  const info = ps.run();
  c.status(201); // TODO what is status if i don't set it?
  return c.json({ info });
});

app.get('/conversations/:id', async (c) => {
  // SELECT * from Conversations WHERE id = ?1
  const ps = db
    .select()
    .from(conversations)
    .where(eq(conversations.id, parseInt(c.req.param('id'))))
    .prepare();
  const data = ps.get();
  return c.json(data);
});

app.put('/conversations/:id', async (c) => {
  // UPDATE Conversations SET updated_at = CURRENT_TIMESTAMP, model = ?1, temperature = ?2, max_tokens = ?3, system_message = ?4, messages = ?5 WHERE id = ?6
  const convo: ConversationInsert = await c.req.json();
  const ps = db
    .update(conversations)
    .set(convo)
    .where(eq(conversations.id, parseInt(c.req.param('id'))))
    .prepare();
  const info = ps.run();
  // c.status(200);
  return c.json({ info });
});

app.patch('/conversations/:id', async (c) => {
  // UPDATE Conversations SET updated_at = CURRENT_TIMESTAMP, messages = ?1 WHERE id = ?2
  const messages: ConversationInsert['messages'] = await c.req.text();
  const ps = db
    .update(conversations)
    .set({ messages })
    .where(eq(conversations.id, parseInt(c.req.param('id'))))
    .prepare();
  const info = ps.run();
  // c.status(200);
  return c.json({ info });
});

app.delete('/conversations/:id', async (c) => {
  // DELETE FROM Conversations WHERE id = ?1
  const ps = db
    .delete(conversations)
    .where(eq(conversations.id, parseInt(c.req.param('id'))))
    .prepare();
  const info = ps.run();
  c.status(204);
  return c.json({ info });
});

export default app;
