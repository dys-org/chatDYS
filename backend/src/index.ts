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

const app = new Hono();

app.get('/', (c) => c.text('DYS API'));

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

const api = new Hono();
api.route('/chat', chat);

api.route('/tokenize', tokenize);

api.route('/conversations', conversations);

api.route('/system-presets', systemPresets);

api.route('/users', users);

app.route('/api', api);

const port = 6969;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});

export default app;
