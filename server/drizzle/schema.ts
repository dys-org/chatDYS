import { sql } from 'drizzle-orm';
import { integer, numeric, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

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

export type User = typeof Users.$inferSelect;

export const insertUsersSchema = createInsertSchema(Users).omit({
  created_at: true,
  updated_at: true,
});
export const selectUsersSchema = createSelectSchema(Users);

export const Sessions = sqliteTable('Session', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => Users.id),
  // expiresAt: integer('expires_at').notNull(),
  expiresAt: integer('expires_at', {
    mode: 'timestamp',
  }).notNull(),
});

export type Session = typeof Sessions.$inferSelect;

export const Conversations = sqliteTable('Conversations', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  user_id: text('user_id')
    .notNull()
    .references(() => Users.id),
  provider: text('provider').default('openai').notNull(),
  model: text('model').notNull(),
  temperature: integer('temperature').notNull(),
  max_tokens: integer('max_tokens').notNull(),
  system_message: text('system_message').notNull(),
  messages: text('messages').notNull(),
  title: text('title').notNull(),
  created_at: numeric('created_at').default(sql`(CURRENT_TIMESTAMP)`),
  updated_at: numeric('updated_at').default(sql`(CURRENT_TIMESTAMP)`),
});

export type Conversation = typeof Conversations.$inferSelect;
export const insertConversationsSchema = createInsertSchema(Conversations).omit({
  user_id: true,
  created_at: true,
  updated_at: true,
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

export type SystemPreset = typeof System_Presets.$inferSelect;
export const insertSystemPresetsSchema = createInsertSchema(System_Presets).omit({
  user_id: true,
  created_at: true,
  updated_at: true,
});
export const selectSystemPresetsSchema = createSelectSchema(System_Presets);
