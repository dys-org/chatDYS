import { GitHub, OAuth2RequestError, generateState } from 'arctic';
import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { getCookie, setCookie } from 'hono/cookie';

import { db } from '../drizzle/db.js';
import { Users } from '../drizzle/schema.js';
import {
  SESSION_COOKIE_NAME,
  createSession,
  createSessionCookie,
  generateIdFromEntropySize,
  generateSessionToken,
  invalidateSession,
} from '../drizzle/session.js';
import type { GithubUser } from '../types.js';

export const github = new GitHub(
  process.env.GITHUB_CLIENT_ID!,
  process.env.GITHUB_CLIENT_SECRET!,
  null,
);

const auth = new Hono()
  .get('/login/github', async (c) => {
    const state = generateState();
    const url = await github.createAuthorizationURL(state, []);
    setCookie(c, 'github_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'PRODUCTION', // set `Secure` flag in HTTPS
      maxAge: 60 * 10, // 10 minutes
      path: '/',
    });
    return c.body(null, 302, { Location: url.toString() });
  })
  .get('/login/github/callback', async (c) => {
    const stateCookie = getCookie(c, 'github_oauth_state');

    const url = new URL(c.req.url);
    const state = url.searchParams.get('state');
    const code = url.searchParams.get('code');

    if (!stateCookie || !state || !code || stateCookie !== state) {
      return c.json({ message: "States don't match" }, 400);
    }
    const token = generateSessionToken();

    try {
      const tokens = await github.validateAuthorizationCode(code);
      const githubUserResponse = await fetch('https://api.github.com/user', {
        headers: { Authorization: 'Bearer ' + tokens.accessToken() },
      });
      const githubUserResult: GithubUser = await githubUserResponse.json();

      const existingUser = db
        .select()
        .from(Users)
        .where(eq(Users.github_id, githubUserResult.id))
        .prepare()
        .get();

      if (existingUser) {
        const session = await createSession(token, existingUser.id);
        const sessionCookie = createSessionCookie(token, session);
        return c.body(null, 302, { Location: '/chat', 'Set-Cookie': sessionCookie });
      }

      const userId = generateIdFromEntropySize(10);
      db.insert(Users)
        .values({
          id: userId,
          username: githubUserResult.login,
          github_id: githubUserResult.id,
          email: githubUserResult.email,
          name: githubUserResult.name,
          avatar_url: githubUserResult.avatar_url,
        })
        .prepare()
        .run();
      const session = await createSession(token, userId);
      const sessionCookie = createSessionCookie(token, session);
      return c.body(null, 302, { Location: '/chat', 'Set-Cookie': sessionCookie });
    } catch (err) {
      console.log(err);
      if (err instanceof OAuth2RequestError) {
        // bad verification code, invalid credentials, etc
        return c.text(err.description || 'OAuth2RequestError', 400);
      }
      return c.body(null, 500);
    }
  })
  .get('/logout', async (c) => {
    const sessionId = getCookie(c, SESSION_COOKIE_NAME);
    await invalidateSession(sessionId ?? ''); // succeeds even if session ID is invalid
    return c.body(null, 204);
  });

export default auth;
