import { migrate } from 'drizzle-orm/better-sqlite3/migrator';

import { db, sqlite } from './db.js';

// This will run migrations on the database, skipping the ones already applied
migrate(db, { migrationsFolder: 'drizzle/migrations' });
sqlite.close();
