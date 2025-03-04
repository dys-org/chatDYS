import { zValidator } from '@hono/zod-validator';
import { desc, eq, sql } from 'drizzle-orm';
import { Hono } from 'hono';

import { db } from '../drizzle/db.js';
import { Conversations, insertConversationsSchema } from '../drizzle/schema.js';
import type { Session, User } from '../drizzle/schema.js';
import { formatZodError, userCanEdit } from '../utils.js';

const conversations = new Hono<{
  Variables: {
    user: User | null;
    session: Session | null;
  };
}>()
  .get('/', async (c) => {
    const user = c.get('user');
    if (!user) return c.text('User is not logged in.', 401);

    const { id, user_id, title, model, created_at, updated_at } = Conversations;
    const ps = db
      .select({ id, user_id, title, model, created_at, updated_at })
      .from(Conversations)
      .where(eq(Conversations.user_id, sql.placeholder('userId')))
      .orderBy(desc(Conversations.created_at))
      .prepare();
    const data = ps.all({ userId: user.id });
    return c.json(data);
  })
  .post(
    '/',
    zValidator('json', insertConversationsSchema, (result, c) => {
      if (!result.success) {
        console.log(result.error);
        return c.text(formatZodError(result.error), 400);
      }
    }),
    async (c) => {
      const user = c.get('user');
      if (!user) return c.text('User is not logged in.', 401);

      const convo = c.req.valid('json');

      const ps = db
        .insert(Conversations)
        .values({ ...convo, user_id: user.id })
        .prepare();
      const info = ps.run();
      return c.json(info, 201);
    },
  )
  .get('/:id', async (c) => {
    const ps = db
      .select()
      .from(Conversations)
      .where(eq(Conversations.id, parseInt(c.req.param('id'))))
      .prepare();
    const data = ps.get();
    if (data === undefined) return c.text('Conversation not found.', 404);

    return c.json(data);
  })
  .patch(
    '/:id',
    zValidator('json', insertConversationsSchema.partial(), (result, c) => {
      if (!result.success) {
        console.log(result.error);
        return c.text(formatZodError(result.error), 400);
      }
    }),
    async (c) => {
      const user = c.get('user');
      if (!user) return c.text('User is not logged in.', 401);

      if (!userCanEdit(user.id, parseInt(c.req.param('id')), Conversations)) {
        return c.text('User cannot edit this conversation.', 403);
      }

      const convo = c.req.valid('json');
      const ps = db
        .update(Conversations)
        .set(convo)
        .where(eq(Conversations.id, parseInt(c.req.param('id'))))
        .prepare();
      const info = ps.run();
      return c.json(info);
    },
  )
  .delete('/:id', async (c) => {
    const user = c.get('user');
    if (!user) return c.text('User is not logged in.', 401);

    if (!userCanEdit(user.id, parseInt(c.req.param('id')), Conversations)) {
      return c.text('User cannot edit this conversation.', 403);
    }

    const ps = db
      .delete(Conversations)
      .where(eq(Conversations.id, parseInt(c.req.param('id'))))
      .prepare();
    const info = ps.run();
    return c.json(info);
  });

export default conversations;
