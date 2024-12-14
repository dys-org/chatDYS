import { sha256 } from '@oslojs/crypto/sha2';
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from '@oslojs/encoding';
import { eq } from 'drizzle-orm';

import { db } from './db.js';
import { type Session, Sessions, type User, Users } from './schema.js';

export const SESSION_COOKIE_NAME = 'auth_session';

export function generateSessionToken() {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  const token = encodeBase32LowerCaseNoPadding(bytes);
  return token;
}

export async function createSession(token: string, userId: string): Promise<Session> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const session: Session = {
    id: sessionId,
    userId,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
  };
  await db.insert(Sessions).values(session);
  return session;
}

export async function validateSessionToken(token: string): Promise<SessionValidationResult> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const result = await db
    .select({ user: Users, session: Sessions })
    .from(Sessions)
    .innerJoin(Users, eq(Sessions.userId, Users.id))
    .where(eq(Sessions.id, sessionId));
  if (result.length < 1) {
    return { session: null, user: null };
  }
  const { user, session } = result[0];
  if (Date.now() >= session.expiresAt.getTime()) {
    await db.delete(Sessions).where(eq(Sessions.id, session.id));
    return { session: null, user: null };
  }
  if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
    session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
    await db
      .update(Sessions)
      .set({
        expiresAt: session.expiresAt,
      })
      .where(eq(Sessions.id, session.id));
  }
  return { session, user };
}

export async function invalidateSession(sessionId: string) {
  await db.delete(Sessions).where(eq(Sessions.id, sessionId));
}

export function createSessionCookie(token: string, session: Session) {
  return (
    `auth_session=${token}; HttpOnly; SameSite=Lax; Expires=${session.expiresAt.toUTCString()}; Path=/;` +
    (process.env.NODE_ENV === 'PRODUCTION' ? ' Secure;' : '')
  );
}

export function createBlankSessionCookie() {
  return (
    'auth_session=; HttpOnly; SameSite=Lax; Max-Age=0; Path=/;' +
    (process.env.NODE_ENV === 'PRODUCTION' ? ' Secure;' : '')
  );
}

export function generateIdFromEntropySize(size: number) {
  const buffer = crypto.getRandomValues(new Uint8Array(size));
  return encodeBase32LowerCaseNoPadding(buffer);
}

export type SessionValidationResult =
  | { session: Session; user: User }
  | { session: null; user: null };
