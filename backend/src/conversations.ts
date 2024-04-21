import { Hono } from 'hono';

const app = new Hono();

app.get('/conversations', async (c) => {
  return c.json({ message: 'get convoList' });
});

app.post('/conversations', async (c) => {
  return c.json({ message: 'post new convo' });
});

app.get('/conversations/:id', async (c) => {
  return c.json({ message: 'get a convo' });
});

app.put('/conversations/:id', async (c) => {
  return c.json({ message: 'put a convo' });
});

app.patch('/conversations/:id', async (c) => {
  return c.json({ message: 'patch a convo' });
});

app.delete('/conversations/:id', async (c) => {
  return c.json({ message: 'delete a convo' });
});

export default app;
