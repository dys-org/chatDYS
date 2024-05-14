import type { Config } from 'drizzle-kit';

export default {
  schema: './src/drizzle/schema.ts',
  out: './src/drizzle/migrations',
  driver: 'better-sqlite',
  dbCredentials: {
    url: './db-data/chat-dys.db',
  },
  introspect: { casing: 'preserve' },
} satisfies Config;
