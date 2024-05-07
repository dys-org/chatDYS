import { sql } from 'drizzle-orm';
import { integer, numeric, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const Users = sqliteTable('Users', {
  id: text('id').primaryKey(),
  username: text('username').notNull(),
  github_id: integer('github_id').unique().notNull(),
  name: text('name'),
  email: text('email'),
  avatar_url: text('avatar_url'),
  created_at: numeric('created_at').default(sql`(CURRENT_TIMESTAMP)`),
  updated_at: numeric('updated_at').default(sql`(CURRENT_TIMESTAMP)`),
});

export type UserInsert = typeof Users.$inferInsert;

export const Sessions = sqliteTable('Session', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => Users.id),
  expiresAt: integer('expires_at').notNull(),
});

export type SessionInsert = typeof Sessions.$inferInsert;

export const Conversations = sqliteTable('Conversations', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  user_id: text('user_id')
    .notNull()
    .references(() => Users.id),
  model: text('model').notNull(),
  temperature: integer('temperature').notNull(),
  max_tokens: integer('max_tokens').notNull(),
  system_message: text('system_message').notNull(),
  messages: text('messages').notNull(),
  title: text('title').notNull(),
  created_at: numeric('created_at').default(sql`(CURRENT_TIMESTAMP)`),
  updated_at: numeric('updated_at').default(sql`(CURRENT_TIMESTAMP)`),
});

export type ConversationInsert = typeof Conversations.$inferInsert;

export const System_Presets = sqliteTable('System_Presets', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  user_id: text('user_id')
    .notNull()
    .references(() => Users.id),
  name: text('name').notNull(),
  text: text('text').notNull(),
  created_at: numeric('created_at').default(sql`(CURRENT_TIMESTAMP)`),
  updated_at: numeric('updated_at').default(sql`(CURRENT_TIMESTAMP)`),
});

export type SystemPresetInsert = typeof System_Presets.$inferInsert;
