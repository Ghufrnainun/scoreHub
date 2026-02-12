import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import type { Id } from './_generated/dataModel';

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

export const resolveForDisplay = query({
  args: { assetId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (!args.assetId) return null;

    const asset = await ctx.db.get(args.assetId as Id<'media_assets'>);
    if (!asset) return null;

    let resolvedUrl = asset.url;
    if (asset.storageId) {
      const storageUrl = await ctx.storage.getUrl(asset.storageId);
      if (storageUrl) {
        resolvedUrl = storageUrl;
      }
    }

    return {
      _id: asset._id,
      name: asset.name,
      type: asset.type,
      url: resolvedUrl,
      createdAt: asset.createdAt,
    };
  },
});
