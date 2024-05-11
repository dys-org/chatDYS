import { eq } from 'drizzle-orm';
import { TableConfig } from 'drizzle-orm/sqlite-core';
import { SQLiteTableWithColumns } from 'drizzle-orm/sqlite-core';

import { db } from './drizzle/db';

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
