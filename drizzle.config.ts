import type { Config } from 'drizzle-kit';

export default {
  schema: './server/drizzle/schema.ts',
  out: './server/drizzle',
  driver: 'better-sqlite',
  dbCredentials: {
    url: './db-data/chat-dys.db',
  },
  introspect: { casing: 'preserve' },
} satisfies Config;
