import { migrate } from 'drizzle-orm/better-sqlite3/migrator';

import { db, sqlite } from './db';

// This will run migrations on the database, skipping the ones already applied
migrate(db, { migrationsFolder: 'src/drizzle' });
sqlite.close();
