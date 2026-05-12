import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { assertAdminSession } from './utils';

export const get = query({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    const setting = await ctx.db
      .query('settings')
      .withIndex('by_key', (q) => q.eq('key', args.key))
      .unique();
    return setting?.value;
  },
});

export const update = mutation({
  args: {
    key: v.string(),
    value: v.any(),
    adminSessionToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await assertAdminSession(ctx, args.adminSessionToken);

    const existing = await ctx.db
      .query('settings')
      .withIndex('by_key', (q) => q.eq('key', args.key))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { value: args.value });
    } else {
      await ctx.db.insert('settings', { key: args.key, value: args.value });
    }
  },
});
