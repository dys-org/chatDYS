import { sql } from 'drizzle-orm';
import { integer, numeric, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

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

export type UsersInsert = typeof Users.$inferInsert;
export const insertUsersSchema = createInsertSchema(Users);
export const selectUsersSchema = createSelectSchema(Users);

export const Sessions = sqliteTable('Session', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => Users.id),
  expiresAt: integer('expires_at').notNull(),
});

export type SessionsInsert = typeof Sessions.$inferInsert;

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

export type ConversationsInsert = typeof Conversations.$inferInsert;
export const insertConversationsSchema = createInsertSchema(Conversations, {
  user_id: z.string().optional(),
});
export const selectConversationsSchema = createSelectSchema(Conversations);

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

export type SystemPresetsInsert = typeof System_Presets.$inferInsert;
export const insertSystemPresetsSchema = createInsertSchema(System_Presets, {
  user_id: (schema) => schema.user_id.optional(),
});
export const selectSystemPresetsSchema = createSelectSchema(System_Presets);
