import 'dotenv/config';

import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { getCookie } from 'hono/cookie';
import { csrf } from 'hono/csrf';
import { HTTPException } from 'hono/http-exception';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { APICallError } from 'ai';

import { type Session, type User } from './drizzle/schema.js';
import {
  SESSION_COOKIE_NAME,
  createBlankSessionCookie,
  createSessionCookie,
  validateSessionToken,
} from './drizzle/session.js';
import auth from './routes/auth.js';
import chat from './routes/chat.js';
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
  .use(csrf({ origin: process.env.CSRF_ORIGIN }))
  .use('*', async (c, next) => {
    const token = getCookie(c, SESSION_COOKIE_NAME) ?? null;
    if (!token) {
      c.set('user', null);
      c.set('session', null);
      // throw new HTTPException(401, { message: 'No authorization included in request.' });
      return next();
    }
    const { user, session } = await validateSessionToken(token);
    if (session) {
      c.header('Set-Cookie', createSessionCookie(token, session), {
        append: true,
      });
    }
    if (!session) {
      c.header('Set-Cookie', createBlankSessionCookie(), {
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
    if (APICallError.isInstance(err)) {
      const { statusCode, message } = err;
      return c.text(message, (statusCode as ContentfulStatusCode) ?? 500);
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
  .route('/conversations', conversations)
  .route('/systemPresets', systemPresets)
  .route('/tokenize', tokenize)
  .route('/users', users);

export const routes = app.route('/auth', auth).route('/api', api);

// Serve static files from the 'dist' directory
app.use('/*', serveStatic({ root: './dist/client' }));
// Catch-all route to serve index.html for any unmatched routes
app.use('*', serveStatic({ path: './dist/client/index.html' })); // app.use('*', serveStatic({ root: './dist/client', rewriteRequestPath: () => '/index.html' }));

const port = 6969;

serve({ fetch: app.fetch, port });

console.log(`Server is running on port ${port}`);

export default app;
export type AppType = typeof routes;
