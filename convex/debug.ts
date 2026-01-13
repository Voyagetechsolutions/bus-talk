import { query } from "./_generated/server";

// Debug query to check what's in the posts table
export const debugPosts = query({
    handler: async (ctx) => {
        const posts = await ctx.db.query("posts").order("desc").take(5);
        return posts.map(post => ({
            id: post._id,
            title: post.title,
            mediaCount: post.media.length,
            media: post.media,
        }));
    },
});

// Check if storage has any files
export const checkStorage = query({
    handler: async (ctx) => {
        // This will help verify if files are being uploaded
        return { message: "Storage query works" };
    },
});
