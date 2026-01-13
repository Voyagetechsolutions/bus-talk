import { query } from "./_generated/server";
import { v } from "convex/values";

// Helper function to resolve media URLs from storage IDs
async function resolveMediaUrls(ctx: any, media: any[]) {
  return Promise.all(
    media.map(async (item) => {
      // If we have a storage_id, get the actual URL from Convex storage
      if (item.storage_id) {
        try {
          const url = await ctx.storage.getUrl(item.storage_id);
          return { ...item, url: url || item.url };
        } catch {
          return item;
        }
      }
      return item;
    })
  );
}

// Get paginated feed posts (for infinite scroll)
export const getPostsFeed = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;

    let postsQuery = ctx.db
      .query("posts")
      .withIndex("by_created")
      .order("desc");

    if (args.cursor) {
      postsQuery = postsQuery.filter((q) =>
        q.lt(q.field("created_at"), args.cursor!)
      );
    }

    const posts = await postsQuery.take(limit + 1);
    const hasMore = posts.length > limit;
    const feedPosts = hasMore ? posts.slice(0, limit) : posts;

    // Resolve storage URLs for all media
    const enrichedPosts = await Promise.all(
      feedPosts.map(async (post) => {
        const resolvedMedia = await resolveMediaUrls(ctx, post.media);
        return { ...post, media: resolvedMedia };
      })
    );

    return {
      posts: enrichedPosts,
      nextCursor: hasMore ? feedPosts[feedPosts.length - 1].created_at : null,
      hasMore,
    };
  },
});

// Get single post with details
export const getPost = query({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) return null;

    // Resolve storage URLs for media
    const resolvedMedia = await resolveMediaUrls(ctx, post.media);
    return { ...post, media: resolvedMedia };
  },
});

// Get comments for a post (top-level only)
export const getComments = query({
  args: {
    postId: v.optional(v.id("posts")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    if (!args.postId) return [];

    const limit = args.limit ?? 20;

    const comments = await ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("post_id", args.postId!))
      .filter((q) => q.eq(q.field("parent_id"), undefined))
      .order("desc")
      .take(limit);

    return comments;
  },
});

// Get replies for a comment
export const getReplies = query({
  args: {
    commentId: v.id("comments"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;

    const replies = await ctx.db
      .query("comments")
      .withIndex("by_parent", (q) => q.eq("parent_id", args.commentId))
      .order("asc")
      .take(limit);

    return replies;
  },
});

// Check if user has liked a post
export const hasLikedPost = query({
  args: {
    postId: v.id("posts"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const like = await ctx.db
      .query("likes")
      .withIndex("by_user_post", (q) =>
        q.eq("user_id", args.userId).eq("post_id", args.postId)
      )
      .first();

    return !!like;
  },
});

// Check if user has liked a comment
export const hasLikedComment = query({
  args: {
    commentId: v.id("comments"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const like = await ctx.db
      .query("comment_likes")
      .withIndex("by_user_comment", (q) =>
        q.eq("user_id", args.userId).eq("comment_id", args.commentId)
      )
      .first();

    return !!like;
  },
});

// Get buses with pagination
export const getBuses = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const buses = await ctx.db
      .query("buses")
      .order("desc")
      .take(args.limit ?? 20);

    const enriched = await Promise.all(
      buses.map(async (bus) => {
        const company = await ctx.db.get(bus.company_id);
        return { ...bus, company };
      })
    );

    return enriched;
  },
});

// Get companies
export const getCompanies = query({
  handler: async (ctx) => {
    return await ctx.db.query("companies").order("desc").collect();
  },
});

// Get drivers
export const getDrivers = query({
  handler: async (ctx) => {
    const drivers = await ctx.db.query("drivers").collect();

    const enriched = await Promise.all(
      drivers.map(async (driver) => {
        const company = await ctx.db.get(driver.company_id);
        return { ...driver, company };
      })
    );

    return enriched;
  },
});

// Get user by email
export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

// Get top rated buses for voting
export const getTopBuses = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const buses = await ctx.db
      .query("buses")
      .order("desc")
      .take(args.limit ?? 5);

    const enriched = await Promise.all(
      buses.map(async (bus) => {
        const company = await ctx.db.get(bus.company_id);
        return { ...bus, company };
      })
    );

    return enriched.sort((a, b) => (b.rating_avg || 0) - (a.rating_avg || 0));
  },
});

// Check if user is following another user
export const isFollowing = query({
  args: {
    follower_id: v.string(),
    following_id: v.string(),
  },
  handler: async (ctx, args) => {
    const follow = await ctx.db
      .query("follows")
      .withIndex("by_pair", (q) =>
        q.eq("follower_id", args.follower_id).eq("following_id", args.following_id)
      )
      .first();

    return !!follow;
  },
});

// Get follower count for a user
export const getFollowerCount = query({
  args: { user_id: v.string() },
  handler: async (ctx, args) => {
    const followers = await ctx.db
      .query("follows")
      .withIndex("by_following", (q) => q.eq("following_id", args.user_id))
      .collect();

    return followers.length;
  },
});

// Get following count for a user
export const getFollowingCount = query({
  args: { user_id: v.string() },
  handler: async (ctx, args) => {
    const following = await ctx.db
      .query("follows")
      .withIndex("by_follower", (q) => q.eq("follower_id", args.user_id))
      .collect();

    return following.length;
  },
});