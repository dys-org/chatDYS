import { eq } from 'drizzle-orm';
import type { TableConfig } from 'drizzle-orm/sqlite-core';
import type { SQLiteTableWithColumns } from 'drizzle-orm/sqlite-core';
import type { ZodError } from 'zod';

import { db } from './drizzle/db.js';

export function userCanEdit<T extends TableConfig>(
  userId: string,
  queryId: number,
  table: SQLiteTableWithColumns<T>,
) {
  const result = db
    .select({ userId: table.user_id })
    .from(table)
    .where(eq(table.id, queryId))
    .prepare()
    .get();

  return result?.userId === userId;
}

export function formatZodError(error: ZodError) {
  const { issues } = error;
  const currentIssue = issues[0];
  const { path, message } = currentIssue;
  return `ZodError: ${path.join('.')} ${message}`;
}
