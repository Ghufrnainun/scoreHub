import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('media_assets').order('desc').collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    url: v.string(), // fallback or public URL
    type: v.union(v.literal('image'), v.literal('video')),
    storageId: v.optional(v.id('_storage')),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('media_assets', {
      name: args.name,
      url: args.url,
      type: args.type,
      storageId: args.storageId,
      createdAt: Date.now(),
    });
  },
});

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const remove = mutation({
  args: { id: v.id('media_assets') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const get = query({
  args: { id: v.optional(v.id('media_assets')) },
  handler: async (ctx, args) => {
    if (!args.id) return null;
    return await ctx.db.get(args.id);
  },
});
