import {
  sqliteTable,
  AnySQLiteColumn,
  index,
  integer,
  text,
  numeric,
  foreignKey,
} from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const users = sqliteTable(
  'Users',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    sub: text('sub').notNull(),
    email: text('email').notNull(),
    name: text('name'),
    created_at: numeric('created_at').default(sql`(CURRENT_TIMESTAMP)`),
    updated_at: numeric('updated_at').default(sql`(CURRENT_TIMESTAMP)`),
  },
  (table) => {
    return {
      idx_users_sub: index('idx_users_sub').on(table.sub),
    };
  },
);

export type UserInsert = typeof users.$inferInsert;

export const conversations = sqliteTable('Conversations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sub: text('sub')
    .notNull()
    .references(() => users.sub),
  model: text('model').notNull(),
  temperature: integer('temperature').notNull(),
  max_tokens: integer('max_tokens').notNull(),
  system_message: text('system_message').notNull(),
  messages: text('messages').notNull(),
  title: text('title').notNull(),
  created_at: numeric('created_at').default(sql`(CURRENT_TIMESTAMP)`),
  updated_at: numeric('updated_at').default(sql`(CURRENT_TIMESTAMP)`),
});

export type ConversationInsert = typeof conversations.$inferInsert;

export const systemPresets = sqliteTable('System_Presets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sub: text('sub')
    .notNull()
    .references(() => users.sub),
  name: text('name').notNull(),
  text: text('text').notNull(),
  created_at: numeric('created_at').default(sql`(CURRENT_TIMESTAMP)`),
  updated_at: numeric('updated_at').default(sql`(CURRENT_TIMESTAMP)`),
});

export type SystemPresetInsert = typeof systemPresets.$inferInsert;
