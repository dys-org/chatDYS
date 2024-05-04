import { eq } from 'drizzle-orm';
import { TableConfig } from 'drizzle-orm/sqlite-core';
import { SQLiteTableWithColumns } from 'drizzle-orm/sqlite-core';
import { HTTPException } from 'hono/http-exception';

import { db } from './drizzle/db';
import { Users } from './drizzle/schema';

export async function validateOwnership<T extends TableConfig>(
  userId: string,
  presetId: number,
  table: SQLiteTableWithColumns<T>,
) {
  const result = db
    .select({ userId: Users.id })
    .from(Users)
    .where(eq(table.id, presetId))
    .prepare()
    .get();

  if (result?.userId !== userId) {
    throw new HTTPException(403, { message: 'User does not own this resource.' });
  }
}
