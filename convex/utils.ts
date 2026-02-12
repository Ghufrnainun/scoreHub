import { ConvexError } from 'convex/values';
import type { MatchRole } from './sports/types';

const encoder = new TextEncoder();

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

export function isGlobalAdminPin(pin?: string): boolean {
  const globalPin = process.env.ADMIN_PIN;
  return Boolean(globalPin && pin && pin === globalPin);
}

export async function assertAdminAccess(
  match: { adminPinHash: string },
  pin?: string,
): Promise<void> {
  if (isGlobalAdminPin(pin)) return;
  if (!pin) {
    throw new ConvexError('PIN required');
  }
  const pinHash = await hashSecret(pin);
  if (pinHash !== match.adminPinHash) {
    throw new ConvexError('Invalid PIN');
  }
}

export async function assertRefereeOrAdminAccess(
  match: {
    adminPinHash: string;
    refereePinHash?: string;
    refereeTokenHash?: string;
  },
  role: MatchRole,
  pin?: string,
  token?: string,
): Promise<void> {
  if (role === 'admin') {
    await assertAdminAccess(match, pin);
    return;
  }

  if (role !== 'referee') {
    throw new ConvexError('Only referee/admin can perform this action');
  }

  if (isGlobalAdminPin(pin)) return;

  const pinHash = pin ? await hashSecret(pin) : null;
  const pinOk = pinHash
    ? pinHash === (match.refereePinHash || match.adminPinHash)
    : false;
  const tokenOk =
    token && match.refereeTokenHash
      ? (await hashSecret(token)) === match.refereeTokenHash
      : false;

  if (!pinOk && !tokenOk) {
    throw new ConvexError('Invalid referee credential');
  }
}
