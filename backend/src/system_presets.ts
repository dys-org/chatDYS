import { Hono } from 'hono';

// TODO type will come from drizzle
interface SystemPreset {
  id: number;
  sub?: string;
  name: string;
  text: string;
  created_at?: string;
  updated_at?: string;
}

const app = new Hono();

app.get('/system_presets', async (c) => {
  return c.json({ message: 'get presetList' });
});

app.post('/system_presets', async (c) => {
  return c.json({ message: 'post new preset' });
});

app.get('/system_presets/:id', async (c) => {
  return c.json({ message: 'get a preset' });
});

app.put('/system_presets/:id', async (c) => {
  return c.json({ message: 'put a preset' });
});

app.delete('/system_presets/:id', async (c) => {
  return c.json({ message: 'delete a preset' });
});

export default app;
