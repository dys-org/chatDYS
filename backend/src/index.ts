import 'dotenv/config';

import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { getCookie } from 'hono/cookie';
import { csrf } from 'hono/csrf';
import { HTTPException } from 'hono/http-exception';
import { Session, User } from 'lucia';
import OpenAI from 'openai';

import { lucia } from './lucia';
import auth from './routes/auth';
import chat from './routes/chat';
import conversations from './routes/conversations';
import systemPresets from './routes/system-presets';
import tokenize from './routes/tokenize';
import users from './routes/users';

const app = new Hono();

app.use(csrf());

app.notFound((c) => c.json({ message: `Not Found - ${c.req.url}`, ok: false }, 404));

app.onError((err, c) => {
  console.log(err);
  if (err instanceof OpenAI.APIError) {
    const { status, message, code, type } = err;
    return c.json({ status, message, code, type }, { status: status ?? 500 });
  }
  if (err instanceof HTTPException) {
    console.log(err);
    const { status, message, stack } = err;
    return c.json({ status, message, stack }, { status });
  }
  return c.json({ message: err.message, stack: err.stack }, { status: 500 });
});

// TODO volidate that resource belongs to user
// for all mutations

const api = new Hono<{ Variables: { user: User | null; session: Session | null } }>();

api.use('*', async (c, next) => {
  const sessionId = getCookie(c, lucia.sessionCookieName) ?? null;
  if (!sessionId) {
    c.set('user', null);
    c.set('session', null);
    // throw new HTTPException(401, { message: 'No authorization included in request.' });
    return next();
  }
  const { user, session } = await lucia.validateSession(sessionId);
  if (session && session.fresh) {
    c.header('Set-Cookie', lucia.createSessionCookie(session.id).serialize(), {
      append: true,
    });
  }
  if (!session) {
    c.header('Set-Cookie', lucia.createBlankSessionCookie().serialize(), {
      append: true,
    });
  }
  c.set('user', user);
  c.set('session', session);
  return next();

  // TODO delete expired sessions on some interval
  // await lucia.deleteExpiredSessions();
});

api.route('/chat', chat);

api.route('/tokenize', tokenize);

api.route('/conversations', conversations);

api.route('/system-presets', systemPresets);

api.route('/users', users);

app.route('/auth', auth);
app.route('/api', api);

const port = 6969;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});

export default app;
