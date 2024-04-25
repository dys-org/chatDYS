import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { basicAuth } from 'hono/basic-auth';
import OpenAI from 'openai';
// import { cors } from 'hono/cors';
// import { prettyJSON } from 'hono/pretty-json';

import chat from './chat';
import conversations from './conversations';
import tokenize from './tokenize';
import users from './users';
import { HTTPException } from 'hono/http-exception';
// import { HTTPException } from 'hono/http-exception';

const app = new Hono();

app.get('/', (c) => c.text('DYS API'));

app.use(basicAuth({ username: 'dys', password: 'hello321' }));
// app.use(cors());
// app.use(prettyJSON());

app.notFound((c) => c.json({ message: `Not Found - ${c.req.url}`, ok: false }, 404));

app.onError((err, c) => {
  if (err instanceof OpenAI.APIError) {
    const { status, message, code, type } = err;
    return c.json({ status, message, code, type }, { status: status ?? 500 });
  }
  if (err instanceof HTTPException) {
    const { status, message, stack } = err;
    return c.json({ status, message, stack }, { status: status ?? 500 });
  }
  return c.text('Server Error', 500);
});

const api = new Hono();
api.route('/chat', chat);

api.route('/tokenize', tokenize);

api.route('/conversations', conversations);

api.route('/users', users);

app.route('/api', api);

const port = 6969;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});

export default app;
