import 'dotenv/config';

import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { getCookie } from 'hono/cookie';
import { csrf } from 'hono/csrf';
import { HTTPException } from 'hono/http-exception';
import type { StatusCode } from 'hono/utils/http-status';
import type { Session, User } from 'lucia';
import OpenAI from 'openai';

import { lucia } from './lucia.js';
import auth from './routes/auth.js';
import chat from './routes/chat.js';
import claude from './routes/claude.js';
import conversations from './routes/conversations.js';
import systemPresets from './routes/systemPresets.js';
import tokenize from './routes/tokenize.js';
import users from './routes/users.js';

const app = new Hono<{
  Variables: {
    user: User | null;
    session: Session | null;
  };
}>()
  .use(csrf())
  .use('*', async (c, next) => {
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
  })
  .notFound((c) => c.json(`Not Found - ${c.req.url}`, 404))
  .onError((err, c) => {
    console.log(err);
    if (err instanceof OpenAI.APIError) {
      const { status, message } = err;
      return c.text(message, (status as StatusCode) ?? 500);
    }
    if (err instanceof HTTPException) {
      console.log(err);
      const { status, message } = err;
      return c.text(message, status);
    }
    return c.text(err.message, 500);
  });

const api = new Hono()
  .route('/chat', chat)
  .route('/claude', claude)
  .route('/conversations', conversations)
  .route('/systemPresets', systemPresets)
  .route('/tokenize', tokenize)
  .route('/users', users);

export const routes = app.route('/auth', auth).route('/api', api);

// Serve static files from the 'dist' directory
app.use('/*', serveStatic({ root: './dist/client' }));

// Catch-all route to serve index.html for any unmatched routes
app.use('*', serveStatic({ path: './dist/client/index.html' }));
// alternative way to write the above
// app.use('*', serveStatic({ root: './dist/client', rewriteRequestPath: () => '/index.html' }));

const port = 6969;
console.log(`Server is running on port ${port}`);

serve({ fetch: app.fetch, port });

export default app;
export type AppType = typeof routes;
