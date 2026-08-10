import { query } from './_generated/server';
import { v } from 'convex/values';

export const children = query({
  args: { parentCode: v.optional(v.string()) },
  handler: (ctx, { parentCode }) => {
    if (parentCode !== undefined) {
      return ctx.db
        .query('regions')
        .withIndex('by_parent_name', (q) => q.eq('parentCode', parentCode))
        .collect();
    }
    return ctx.db
      .query('regions')
      .withIndex('by_level_name', (q) => q.eq('level', 'province'))
      .collect();
  },
});

export const byCode = query({
  args: { code: v.string() },
  handler: (ctx, { code }) => ctx.db.query('regions').withIndex('by_code', (q) => q.eq('code', code)).unique(),
});