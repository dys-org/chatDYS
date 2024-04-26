import { Hono } from 'hono';
import { db } from '../drizzle/db';
import { desc, eq, sql } from 'drizzle-orm';
import { Conversations, type ConversationInsert } from '../drizzle/schema';

const app = new Hono();

app.get('/', async (c) => {
  // SELECT id, sub, title, model, created_at, updated_at from Conversations WHERE sub = ?1 ORDER BY created_at DESC
  const { id, sub, title, model, created_at, updated_at } = Conversations;
  const ps = db
    .select({ id, sub, title, model, created_at, updated_at })
    .from(Conversations)
    .where(eq(Conversations.sub, sql.placeholder('sub')))
    .orderBy(desc(Conversations.created_at))
    .prepare();
  const data = ps.all({ sub: 'github|26875701' }); // TODO get sub from auth
  return c.json(data);
});

app.post('/', async (c) => {
  // INSERT INTO Conversations (sub, model, temperature, max_tokens, system_message, messages, title) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
  const convo: ConversationInsert = await c.req.json();
  const ps = db.insert(Conversations).values(convo).prepare();
  const info = ps.run();
  c.status(201); // TODO what is status if i don't set it?
  return c.json({ info });
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
  c.status(204);
  return c.json({ info });
});

export default app;
