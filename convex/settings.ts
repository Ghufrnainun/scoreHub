import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

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

import { isGlobalAdminPin } from './utils';

export const update = mutation({
  args: { key: v.string(), value: v.any(), adminPin: v.string() },
  handler: async (ctx, args) => {
    if (!isGlobalAdminPin(args.adminPin)) {
      throw new Error('Unauthorized: Invalid Admin PIN');
    }

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
