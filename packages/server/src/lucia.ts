import { DrizzleSQLiteAdapter } from '@lucia-auth/adapter-drizzle';
import { GitHub } from 'arctic';
import { Lucia, TimeSpan } from 'lucia';

import { db } from './drizzle/db.js';
import type { UsersInsert } from './drizzle/schema.js';
import { Sessions, Users } from './drizzle/schema.js';

const adapter = new DrizzleSQLiteAdapter(db, Sessions, Users);

export const lucia = new Lucia(adapter, {
  sessionExpiresIn: new TimeSpan(1, 'd'),
  sessionCookie: {
    attributes: {
      secure: process.env.NODE_ENV === 'PRODUCTION',
    },
  },
  getUserAttributes: (attributes) => {
    return {
      githubId: attributes.github_id,
      username: attributes.username,
    };
  },
});

export const github = new GitHub(process.env.GITHUB_CLIENT_ID!, process.env.GITHUB_CLIENT_SECRET!);

declare module 'lucia' {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: Pick<UsersInsert, 'username' | 'github_id'>;
  }
}

// TODO delete expired sessions on some interval
// await lucia.deleteExpiredSessions();
