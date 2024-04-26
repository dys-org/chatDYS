import type { Config } from 'drizzle-kit';

export default {
  schema: './drizzle/schema.ts',
  out: './drizzle',
  driver: 'better-sqlite',
  dbCredentials: {
    url: './db-data/chat-dys.db',
  },
  introspect: { casing: 'preserve' },
} satisfies Config;
