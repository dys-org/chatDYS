import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import OpenAI from 'openai';
// import { cors } from 'hono/cors';

import chat from './routes/chat';
import conversations from './routes/conversations';
import systemPresets from './routes/system-presets';
import tokenize from './routes/tokenize';
import users from './routes/users';
import { HTTPException } from 'hono/http-exception';
import { jwt, sign } from 'hono/jwt';
import dotenv from 'dotenv';
import { deleteCookie, setCookie } from 'hono/cookie';

dotenv.config({ path: ['../.env.local', '../.env'] });

const app = new Hono();

// app.use(cors());

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

const fakeUsers = [
  { id: 1, username: 'test', password: 'test', firstName: 'Test', lastName: 'User' },
];

const publicApi = new Hono();

publicApi.post('/authenticate', async (c) => {
  const { username, password }: { username: string; password: string } = await c.req.json();
  const user = fakeUsers.find((u) => u.username === username && u.password === password);

  if (!user) throw 'Username or password is incorrect';

  const token = await sign(
    {
      sub: user.id,
      exp: Math.floor(Date.now() / 1000) + 60 * 60, // expires in 1 hour,
    },
    process.env.AUTH_SECRET,
  );

  setCookie(c, 'auth_token', token, {
    httpOnly: true,
    sameSite: 'Strict',
    expires: new Date(Date.now() + 86400e3), // expires in 24 hours
  });

  // remove password from user object
  const { password: userPassword, ...userWithoutPassword } = user;

  return c.json({
    ...userWithoutPassword,
    token,
  });
});

publicApi.get('/logout', async (c) => {
  deleteCookie(c, 'auth_token');
  return c.json({ message: 'User logged out.' });
});

// TODO volidate that resource belongs to user
// for all mutations

const authApi = new Hono();

authApi.use('/*', (c, next) => {
  const jwtMiddleware = jwt({
    secret: process.env.AUTH_SECRET,
    cookie: 'auth_token',
  });
  return jwtMiddleware(c, next);
});

authApi.route('/chat', chat);

authApi.route('/tokenize', tokenize);

authApi.route('/conversations', conversations);

authApi.route('/system-presets', systemPresets);

authApi.route('/users', users);

app.route('/api', publicApi);
app.route('/api', authApi);

const port = 6969;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});

export default app;
