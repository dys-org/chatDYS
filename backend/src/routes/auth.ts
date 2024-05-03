import { OAuth2RequestError, generateState } from 'arctic';
import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { getCookie, setCookie } from 'hono/cookie';
import { HTTPException } from 'hono/http-exception';
import { generateIdFromEntropySize } from 'lucia';

import { db } from '../drizzle/db';
import { Users } from '../drizzle/schema';
import { github, lucia } from '../lucia';
import { GithubUser } from '../types';

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
  } catch (err) {
    console.log(err);
    if (err instanceof OAuth2RequestError) {
      // bad verification code, invalid credentials, etc
      throw new HTTPException(400, err);
    }
    throw err;
  }
});

auth.get('/logout', async (c) => {
  const sessionId = getCookie(c, lucia.sessionCookieName);
  // if (sessionId === undefined) throw new HTTPException(403);
  await lucia.invalidateSession(sessionId ?? ''); // succeeds even if session ID is invalid
  return c.body(null, 204);
});

export default auth;
