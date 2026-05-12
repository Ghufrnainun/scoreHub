import { ConvexError } from 'convex/values';
import type { MatchRole } from './sports/types';

const encoder = new TextEncoder();
export const ADMIN_SESSION_TTL_MS = 1000 * 60 * 60 * 8;

const bytesToHex = (bytes: Uint8Array): string =>
  Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');

export async function hashSecret(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(value));
  return bytesToHex(new Uint8Array(digest));
}

export function generateToken(bytes = 4): string {
  const buffer = new Uint8Array(bytes);
  crypto.getRandomValues(buffer);
  return bytesToHex(buffer).toUpperCase();
}


export async function assertAdminSession(
  ctx: any,
  adminSessionToken?: string,
): Promise<void> {
  if (!adminSessionToken) {
    throw new ConvexError('Admin session required');
  }

  const tokenHash = await hashSecret(adminSessionToken);
  const session = await ctx.db
    .query('admin_sessions')
    .withIndex('by_tokenHash', (q: any) => q.eq('tokenHash', tokenHash))
    .unique();

  if (!session) {
    throw new ConvexError('Invalid admin session');
  }

  if (session.revokedAt) {
    throw new ConvexError('Admin session revoked');
  }

  if (session.expiresAt <= Date.now()) {
    throw new ConvexError('Admin session expired');
  }

  // Queries in Convex are read-only; only touch session metadata when writes are available.
  if (typeof ctx.db.patch === 'function') {
    await ctx.db.patch(session._id, { lastUsedAt: Date.now() });
  }
}

export async function assertAdminAccess(
  ctx: any,
  adminSessionToken?: string,
): Promise<void> {
  if (adminSessionToken) {
    await assertAdminSession(ctx, adminSessionToken);
    return;
  }
  throw new ConvexError('Admin session required');
}

export async function assertRefereeOrAdminAccess(
  ctx: any,
  match: {
    refereePinHash?: string;
    refereeTokenHash?: string;
  },
  role: MatchRole,
  pin?: string,
  token?: string,
  adminSessionToken?: string,
): Promise<void> {
  if (role === 'admin') {
    await assertAdminAccess(ctx, adminSessionToken);
    return;
  }

  if (role !== 'referee') {
    throw new ConvexError('Only referee/admin can perform this action');
  }

  const pinHash = pin ? await hashSecret(pin) : null;
  const pinOk = pinHash
    ? pinHash === match.refereePinHash
    : false;
  const tokenOk =
    token && match.refereeTokenHash
      ? (await hashSecret(token)) === match.refereeTokenHash
      : false;

  if (!pinOk && !tokenOk) {
    throw new ConvexError('Invalid referee credential');
  }
}
