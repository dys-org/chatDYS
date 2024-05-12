import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';

import * as schema from './schema.js';

export const sqlite = new Database('./db-data/chat-dys.db');
export const db = drizzle(sqlite, { schema });
