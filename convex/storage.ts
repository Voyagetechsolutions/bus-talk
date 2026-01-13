import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Generate upload URL for file storage
export const generateUploadUrl = mutation({
    handler: async (ctx) => {
        return await ctx.storage.generateUploadUrl();
    },
});

// Get file URL from storage ID (query for reading)
export const getFileUrl = query({
    args: { storageId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.storage.getUrl(args.storageId as any);
    },
});

// Get multiple file URLs
export const getFileUrls = query({
    args: { storageIds: v.array(v.string()) },
    handler: async (ctx, args) => {
        const urls = await Promise.all(
            args.storageIds.map(async (id) => {
                const url = await ctx.storage.getUrl(id as any);
                return { storageId: id, url };
            })
        );
        return urls;
    },
});
