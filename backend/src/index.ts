import 'dotenv/config';

import { serve } from '@hono/node-server';
import { OAuth2RequestError, generateState } from 'arctic';
import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import { csrf } from 'hono/csrf';
import { HTTPException } from 'hono/http-exception';
import { Session, User, generateIdFromEntropySize } from 'lucia';
import OpenAI from 'openai';

import { github, lucia } from './auth';
import { db } from './drizzle/db';
import { Users } from './drizzle/schema';
import chat from './routes/chat';
import conversations from './routes/conversations';
import systemPresets from './routes/system-presets';
import tokenize from './routes/tokenize';
import users from './routes/users';
import { GithubUser } from './types';

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
    return c.json({ status, message, stack }, { status: status ?? 500 });
  }
  return c.json({ message: err.message, stack: err.stack }, { status: 500 });
});

const auth = new Hono();

auth.get('/login/github', async (c) => {
  const state = generateState();
  const url = await github.createAuthorizationURL(state);
  setCookie(c, 'github_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'PRODUCTION', // set `Secure` flag in HTTPS
    maxAge: 60 * 10, // 10 minutes
    path: '/',
  });
  return c.body(null, 302, { Location: url.toString() });
});

auth.get('/login/github/callback', async (c) => {
  const stateCookie = getCookie(c, 'github_oauth_state');

  const url = new URL(c.req.url);
  const state = url.searchParams.get('state');
  const code = url.searchParams.get('code');

  if (!stateCookie || !state || !code || stateCookie !== state) {
    throw new HTTPException(400);
  }

  try {
    const tokens = await github.validateAuthorizationCode(code);
    const githubUserResponse = await fetch('https://api.github.com/user', {
      headers: { Authorization: 'Bearer ' + tokens.accessToken },
    });
    const githubUserResult: GithubUser = await githubUserResponse.json();

    const existingUser = db
      .select()
      .from(Users)
      .where(eq(Users.github_id, githubUserResult.id))
      .prepare()
      .get();

    if (existingUser) {
      const session = await lucia.createSession(existingUser.id, {});
      const sessionCookie = lucia.createSessionCookie(session.id);
      return c.body(null, 302, { Location: '/', 'Set-Cookie': sessionCookie.serialize() });
    }
    const userId = generateIdFromEntropySize(10);
    db.insert(Users)
      .values({
        id: userId,
        username: githubUserResult.login,
        github_id: githubUserResult.id,
        email: githubUserResult.email,
        name: githubUserResult.name,
      })
      .prepare()
      .run();
    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    return c.body(null, 302, { Location: '/', 'Set-Cookie': sessionCookie.serialize() });
  } catch (err) {
    console.log(err);
    if (err instanceof OAuth2RequestError) {
      // bad verification code, invalid credentials, etc
      throw new HTTPException(400, err);
    }
    throw err;
  }
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
