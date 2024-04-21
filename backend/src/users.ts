import { Hono } from 'hono';

const app = new Hono();

app.get('/users', async (c) => {
  return c.json({ message: 'get userList' });
});

app.post('/users', async (c) => {
  return c.json({ message: 'post new user' });
});

app.get('/user/info', async (c) => {
  return c.json({ message: "get current user's info" });
});

export default app;
