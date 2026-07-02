import { mutation, query } from './_generated/server';
import { v, ConvexError } from 'convex/values';
import {
  assertMasterAdminSession,
  getAdminSession,
  hashSecret,
} from './utils';

// Helper to generate a random 6-digit PIN
function generateRandomPin(): string {
  const digits = '0123456789';
  let pin = '';
  for (let i = 0; i < 6; i++) {
    pin += digits[Math.floor(Math.random() * 10)];
  }
  return pin;
}

export const getSessionInfo = query({
  args: { adminSessionToken: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (!args.adminSessionToken) return null;
    try {
      const session = await getAdminSession(ctx, args.adminSessionToken);
      return {
        isTemporary: !!session.isTemporary,
        label: session.label || 'Master PIN',
        expiresAt: session.expiresAt,
      };
    } catch {
      return null;
    }
  },
});

export const changeMasterPin = mutation({
  args: {
    oldPin: v.string(),
    newPin: v.string(),
    adminSessionToken: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Ensure master admin privileges
    await assertMasterAdminSession(ctx, args.adminSessionToken);

    // 2. Validate new PIN format (e.g. numeric, at least 4 digits, max 10)
    if (!/^\d{4,10}$/.test(args.newPin)) {
      throw new ConvexError('PIN baru harus berupa 4-10 digit angka.');
    }

    // 3. Verify old PIN matches current PIN
    const existingCred = await ctx.db
      .query('admin_credentials')
      .withIndex('by_key', (q) => q.eq('key', 'master_pin'))
      .unique();

    let isOldPinValid = false;
    if (existingCred) {
      const oldPinHash = await hashSecret(args.oldPin);
      isOldPinValid = oldPinHash === existingCred.pinHash;
    } else {
      // Fallback if no PIN saved in database yet
      const fallbackPin = process.env.ADMIN_PASSWORD || '';
      isOldPinValid = args.oldPin === fallbackPin;
    }

    if (!isOldPinValid) {
      throw new ConvexError('PIN lama yang dimasukkan salah.');
    }

    // 4. Update to new PIN
    const newPinHash = await hashSecret(args.newPin);
    const now = Date.now();

    if (existingCred) {
      await ctx.db.patch(existingCred._id, {
        pinHash: newPinHash,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert('admin_credentials', {
        key: 'master_pin',
        pinHash: newPinHash,
        updatedAt: now,
      });
    }

    return { success: true };
  },
});

export const generateTempCode = mutation({
  args: {
    label: v.string(),
    durationHours: v.number(),
    maxUses: v.optional(v.number()),
    adminSessionToken: v.string(),
  },
  handler: async (ctx, args) => {
    await assertMasterAdminSession(ctx, args.adminSessionToken);

    if (!args.label.trim()) {
      throw new ConvexError('Label tidak boleh kosong.');
    }

    if (args.durationHours <= 0 || args.durationHours > 24 * 30) {
      throw new ConvexError('Durasi tidak valid (1 jam sampai 30 hari).');
    }

    const rawCode = generateRandomPin();
    const codeHash = await hashSecret(rawCode);
    const now = Date.now();
    const expiresAt = now + args.durationHours * 60 * 60 * 1000;

    await ctx.db.insert('temp_access_codes', {
      codeHash,
      label: args.label.trim(),
      expiresAt,
      maxUses: args.maxUses,
      usedCount: 0,
      createdAt: now,
    });

    return { code: rawCode, expiresAt };
  },
});

export const listTempCodes = query({
  args: { adminSessionToken: v.string() },
  handler: async (ctx, args) => {
    await assertMasterAdminSession(ctx, args.adminSessionToken);

    const codes = await ctx.db.query('temp_access_codes').collect();

    // Sort by createdAt descending
    return codes
      .map((c) => ({
        _id: c._id,
        label: c.label,
        expiresAt: c.expiresAt,
        maxUses: c.maxUses,
        usedCount: c.usedCount,
        createdAt: c.createdAt,
        isExpired: c.expiresAt <= Date.now() || (c.maxUses !== undefined && c.usedCount >= c.maxUses),
      }))
      .sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const revokeTempCode = mutation({
  args: {
    codeId: v.id('temp_access_codes'),
    adminSessionToken: v.string(),
  },
  handler: async (ctx, args) => {
    await assertMasterAdminSession(ctx, args.adminSessionToken);

    const code = await ctx.db.get(args.codeId);
    if (!code) {
      throw new ConvexError('Kode akses tidak ditemukan.');
    }

    // Set expiresAt to 0 to revoke it instantly
    await ctx.db.patch(args.codeId, {
      expiresAt: 0,
    });

    return { success: true };
  },
});
