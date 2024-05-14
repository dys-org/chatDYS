import { OAuth2RequestError, generateState } from 'arctic';
import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { getCookie, setCookie } from 'hono/cookie';
import { generateIdFromEntropySize } from 'lucia';

import { db } from '../drizzle/db.js';
import { Users } from '../drizzle/schema.js';
import { github, lucia } from '../lucia.js';
import { GithubUser } from '../types.js';

const auth = new Hono()
  .get('/login/github', async (c) => {
    const state = generateState();
    const url = await github.createAuthorizationURL(state);
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
        return c.body(null, 302, { Location: '/chat', 'Set-Cookie': sessionCookie.serialize() });
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
      const session = await lucia.createSession(userId, {});
      const sessionCookie = lucia.createSessionCookie(session.id);
      return c.body(null, 302, { Location: '/chat', 'Set-Cookie': sessionCookie.serialize() });
    } catch (err: any) {
      console.log(err);
      if (err instanceof OAuth2RequestError) {
        // bad verification code, invalid credentials, etc
        return c.json(err, 400);
      }
      return c.json(err, 500);
    }
  })
  .get('/logout', async (c) => {
    const sessionId = getCookie(c, lucia.sessionCookieName);
    await lucia.invalidateSession(sessionId ?? ''); // succeeds even if session ID is invalid
    return c.body(null, 204);
  });

export default auth;
