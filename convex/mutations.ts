import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Create a new post (with video support)
export const createPost = mutation({
  args: {
    user_id: v.string(),
    type: v.union(v.literal("news"), v.literal("sighting")),
    title: v.string(),
    content: v.string(),
    media: v.array(v.object({
      url: v.string(),
      type: v.union(v.literal("image"), v.literal("video")),
      storage_id: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("posts", {
      ...args,
      status: "active",
      likes_count: 0,
      boosts_count: 0,
      comments_count: 0,
      created_at: Date.now(),
    });
  },
});

// Like/unlike a post
export const likePost = mutation({
  args: {
    post_id: v.id("posts"),
    user_id: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("likes")
      .withIndex("by_user_post", (q) =>
        q.eq("user_id", args.user_id).eq("post_id", args.post_id)
      )
      .first();

    const post = await ctx.db.get(args.post_id);
    if (!post) throw new Error("Post not found");

    if (existing) {
      await ctx.db.delete(existing._id);
      await ctx.db.patch(args.post_id, {
        likes_count: Math.max(0, post.likes_count - 1),
      });
      return { liked: false, likes_count: Math.max(0, post.likes_count - 1) };
    } else {
      await ctx.db.insert("likes", args);
      await ctx.db.patch(args.post_id, {
        likes_count: post.likes_count + 1,
      });
      return { liked: true, likes_count: post.likes_count + 1 };
    }
  },
});

// Boost a post
export const boostPost = mutation({
  args: {
    post_id: v.id("posts"),
    user_id: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("boosts")
      .withIndex("by_user_post", (q) =>
        q.eq("user_id", args.user_id).eq("post_id", args.post_id)
      )
      .first();

    const post = await ctx.db.get(args.post_id);
    if (!post) throw new Error("Post not found");

    if (existing) {
      await ctx.db.delete(existing._id);
      await ctx.db.patch(args.post_id, {
        boosts_count: Math.max(0, post.boosts_count - 1),
      });
      return { boosted: false };
    } else {
      await ctx.db.insert("boosts", args);
      await ctx.db.patch(args.post_id, {
        boosts_count: post.boosts_count + 1,
      });
      return { boosted: true };
    }
  },
});

// Create a comment
export const createComment = mutation({
  args: {
    post_id: v.id("posts"),
    user_id: v.string(),
    content: v.string(),
    parent_id: v.optional(v.id("comments")),
  },
  handler: async (ctx, args) => {
    const commentId = await ctx.db.insert("comments", {
      post_id: args.post_id,
      user_id: args.user_id,
      content: args.content,
      parent_id: args.parent_id,
      likes_count: 0,
      replies_count: 0,
      created_at: Date.now(),
    });

    // Update post comment count
    const post = await ctx.db.get(args.post_id);
    if (post) {
      await ctx.db.patch(args.post_id, {
        comments_count: post.comments_count + 1,
      });
    }

    // If this is a reply, update parent's reply count
    if (args.parent_id) {
      const parent = await ctx.db.get(args.parent_id);
      if (parent) {
        await ctx.db.patch(args.parent_id, {
          replies_count: parent.replies_count + 1,
        });
      }
    }

    return commentId;
  },
});

// Like/unlike a comment
export const likeComment = mutation({
  args: {
    comment_id: v.id("comments"),
    user_id: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("comment_likes")
      .withIndex("by_user_comment", (q) =>
        q.eq("user_id", args.user_id).eq("comment_id", args.comment_id)
      )
      .first();

    const comment = await ctx.db.get(args.comment_id);
    if (!comment) throw new Error("Comment not found");

    if (existing) {
      await ctx.db.delete(existing._id);
      await ctx.db.patch(args.comment_id, {
        likes_count: Math.max(0, comment.likes_count - 1),
      });
      return { liked: false };
    } else {
      await ctx.db.insert("comment_likes", args);
      await ctx.db.patch(args.comment_id, {
        likes_count: comment.likes_count + 1,
      });
      return { liked: true };
    }
  },
});

// Delete a comment
export const deleteComment = mutation({
  args: {
    comment_id: v.id("comments"),
    user_id: v.string(),
  },
  handler: async (ctx, args) => {
    const comment = await ctx.db.get(args.comment_id);
    if (!comment) throw new Error("Comment not found");
    if (comment.user_id !== args.user_id) throw new Error("Not authorized");

    // Delete all replies
    const replies = await ctx.db
      .query("comments")
      .withIndex("by_parent", (q) => q.eq("parent_id", args.comment_id))
      .collect();

    for (const reply of replies) {
      await ctx.db.delete(reply._id);
    }

    // Update post comment count
    const post = await ctx.db.get(comment.post_id);
    if (post) {
      await ctx.db.patch(comment.post_id, {
        comments_count: Math.max(0, post.comments_count - 1 - replies.length),
      });
    }

    // If this was a reply, update parent's reply count
    if (comment.parent_id) {
      const parent = await ctx.db.get(comment.parent_id);
      if (parent) {
        await ctx.db.patch(comment.parent_id, {
          replies_count: Math.max(0, parent.replies_count - 1),
        });
      }
    }

    await ctx.db.delete(args.comment_id);
    return { success: true };
  },
});

// Create user
export const createUser = mutation({
  args: {
    username: v.string(),
    email: v.string(),
    profile_pic: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user exists
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existing) return existing._id;

    return await ctx.db.insert("users", {
      ...args,
      role: "user",
      spotter_status: false,
      badges: [],
      created_at: Date.now(),
    });
  },
});

// Create company
export const createCompany = mutation({
  args: {
    name: v.string(),
    logo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("companies", {
      ...args,
      rating_avg: 0,
      buses_count: 0,
      routes_count: 0,
    });
  },
});

// Create bus
export const createBus = mutation({
  args: {
    company_id: v.id("companies"),
    fleet_number: v.string(),
    route: v.string(),
    type: v.optional(v.string()),
    year: v.optional(v.number()),
    photos: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const busId = await ctx.db.insert("buses", {
      ...args,
      rating_avg: 0,
    });

    // Update company bus count
    const company = await ctx.db.get(args.company_id);
    if (company) {
      await ctx.db.patch(args.company_id, {
        buses_count: company.buses_count + 1,
      });
    }

    return busId;
  },
});

// Create driver
export const createDriver = mutation({
  args: {
    name: v.string(),
    company_id: v.id("companies"),
    routes: v.array(v.string()),
    experience_years: v.number(),
    photo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("drivers", {
      ...args,
      rating_avg: 0,
    });
  },
});

// Moderate a post (block/unblock)
export const setPostStatus = mutation({
  args: {
    post_id: v.id("posts"),
    status: v.union(v.literal("active"), v.literal("blocked")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.post_id, { status: args.status });
    return { success: true };
  },
});

// Create rating
export const createRating = mutation({
  args: {
    user_id: v.string(),
    bus_id: v.id("buses"),
    driver_id: v.optional(v.id("drivers")),
    trip_date: v.string(),
    punctuality: v.number(),
    cleanliness: v.number(),
    comfort: v.number(),
    behavior: v.number(),
    comment: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const ratingId = await ctx.db.insert("ratings", {
      ...args,
      created_at: Date.now(),
    });

    // Update bus average rating
    const ratings = await ctx.db
      .query("ratings")
      .withIndex("by_bus", (q) => q.eq("bus_id", args.bus_id))
      .collect();

    const avgRating = ratings.reduce((sum, r) => {
      return sum + (r.punctuality + r.cleanliness + r.comfort + r.behavior) / 4;
    }, 0) / ratings.length;

    await ctx.db.patch(args.bus_id, { rating_avg: avgRating });

    return ratingId;
  },
});

// Apply to become spotter
export const applyForSpotter = mutation({
  args: {
    user_id: v.string(),
    reason: v.string(),
    experience: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("spotter_applications", {
      ...args,
      status: "pending",
      created_at: Date.now(),
    });
  },
});

// Approve/reject spotter application (admin only)
export const handleSpotterApplication = mutation({
  args: {
    application_id: v.id("spotter_applications"),
    admin_id: v.string(),
    action: v.union(v.literal("approve"), v.literal("reject")),
  },
  handler: async (ctx, args) => {
    const application = await ctx.db.get(args.application_id);
    if (!application) throw new Error("Application not found");

    await ctx.db.patch(args.application_id, {
      status: args.action === "approve" ? "approved" : "rejected",
      reviewed_by: args.admin_id,
      reviewed_at: Date.now(),
    });

    // Note: Can't update Supabase user from here - would need to handle differently
    return { success: true };
  },
});

// Delete company
export const deleteCompany = mutation({
  args: { id: v.id("companies") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return { success: true };
  },
});

// Delete driver
export const deleteDriver = mutation({
  args: { id: v.id("drivers") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return { success: true };
  },
});

// Delete bus
export const deleteBus = mutation({
  args: { id: v.id("buses") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return { success: true };
  },
});

// Create route
export const createRoute = mutation({
  args: {
    origin: v.string(),
    destination: v.string(),
    distance: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("routes", args);
  },
});

// Delete route
export const deleteRoute = mutation({
  args: { id: v.id("routes") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return { success: true };
  },
});

// Follow a user
export const followUser = mutation({
  args: {
    follower_id: v.string(),
    following_id: v.string(),
  },
  handler: async (ctx, args) => {
    // Can't follow yourself
    if (args.follower_id === args.following_id) {
      throw new Error("Cannot follow yourself");
    }

    // Check if already following
    const existing = await ctx.db
      .query("follows")
      .withIndex("by_pair", (q) =>
        q.eq("follower_id", args.follower_id).eq("following_id", args.following_id)
      )
      .first();

    if (existing) {
      return { already_following: true };
    }

    await ctx.db.insert("follows", {
      follower_id: args.follower_id,
      following_id: args.following_id,
      created_at: Date.now(),
    });

    return { success: true };
  },
});

// Unfollow a user
export const unfollowUser = mutation({
  args: {
    follower_id: v.string(),
    following_id: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("follows")
      .withIndex("by_pair", (q) =>
        q.eq("follower_id", args.follower_id).eq("following_id", args.following_id)
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { success: true };
    }

    return { not_following: true };
  },
});

// Toggle follow (convenience method)
export const toggleFollow = mutation({
  args: {
    follower_id: v.string(),
    following_id: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.follower_id === args.following_id) {
      throw new Error("Cannot follow yourself");
    }

    const existing = await ctx.db
      .query("follows")
      .withIndex("by_pair", (q) =>
        q.eq("follower_id", args.follower_id).eq("following_id", args.following_id)
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { following: false };
    } else {
      await ctx.db.insert("follows", {
        follower_id: args.follower_id,
        following_id: args.following_id,
        created_at: Date.now(),
      });
      return { following: true };
    }
  },
});

// ============== COMMUNITY MUTATIONS (Coach Talk) ==============

// Create a new community
export const createCommunity = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    icon: v.optional(v.string()),
    created_by: v.string(),
  },
  handler: async (ctx, args) => {
    let slug = args.slug;
    let suffix = 1;
    while (
      await ctx.db
        .query("communities")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .first()
    ) {
      slug = `${args.slug}-${suffix}`;
      suffix += 1;
    }

    const communityId = await ctx.db.insert("communities", {
      name: args.name,
      slug,
      description: args.description,
      icon: args.icon,
      members_count: 1,
      posts_count: 0,
      created_by: args.created_by,
      created_at: Date.now(),
    });

    // Creator automatically joins
    await ctx.db.insert("community_members", {
      community_id: communityId,
      user_id: args.created_by,
      joined_at: Date.now(),
    });

    return { community_id: communityId, slug };
  },
});

// Create a post in a community
export const createCommunityPost = mutation({
  args: {
    community_id: v.id("communities"),
    user_id: v.string(),
    title: v.string(),
    content: v.string(),
    media: v.optional(v.array(v.object({
      url: v.string(),
      type: v.union(v.literal("image"), v.literal("video")),
      storage_id: v.optional(v.string()),
    }))),
  },
  handler: async (ctx, args) => {
    const membership = await ctx.db
      .query("community_members")
      .withIndex("by_pair", (q) =>
        q.eq("community_id", args.community_id).eq("user_id", args.user_id)
      )
      .first();

    if (!membership) {
      throw new Error("Must join community before posting");
    }

    const postId = await ctx.db.insert("community_posts", {
      community_id: args.community_id,
      user_id: args.user_id,
      title: args.title,
      content: args.content,
      media: args.media ?? [],
      upvotes: 0,
      downvotes: 0,
      comments_count: 0,
      created_at: Date.now(),
    });

    // Increment posts_count
    const community = await ctx.db.get(args.community_id);
    if (community) {
      await ctx.db.patch(args.community_id, {
        posts_count: community.posts_count + 1,
      });
    }

    return { post_id: postId };
  },
});

// Cast a vote for bus of the week
export const castVote = mutation({
  args: {
    user_id: v.string(),
    category: v.string(),
    nominee_id: v.string(),
    year: v.number(),
    week: v.number(),
    role: v.optional(v.union(v.literal("admin"), v.literal("verified_spotter"), v.literal("user"))),
    spotter_status: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("votes")
      .withIndex("by_user_category_period", (q) =>
        q.eq("user_id", args.user_id)
          .eq("category", args.category)
          .eq("year", args.year)
          .eq("week", args.week)
      )
      .first();

    if (existing) {
      return { alreadyVoted: true, nominee_id: existing.nominee_id };
    }

    const weight =
      args.role === "admin"
        ? 3
        : args.role === "verified_spotter" || args.spotter_status
          ? 2
          : 1;

    await ctx.db.insert("votes", {
      user_id: args.user_id,
      category: args.category,
      nominee_id: args.nominee_id,
      year: args.year,
      week: args.week,
      weight,
      created_at: Date.now(),
    });

    return { success: true };
  },
});

// Join a community
export const joinCommunity = mutation({
  args: {
    community_id: v.id("communities"),
    user_id: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("community_members")
      .withIndex("by_pair", (q) =>
        q.eq("community_id", args.community_id).eq("user_id", args.user_id)
      )
      .first();

    if (existing) {
      return { already_member: true };
    }

    await ctx.db.insert("community_members", {
      community_id: args.community_id,
      user_id: args.user_id,
      joined_at: Date.now(),
    });

    const community = await ctx.db.get(args.community_id);
    if (community) {
      await ctx.db.patch(args.community_id, {
        members_count: community.members_count + 1,
      });
    }

    return { success: true };
  },
});

// Leave a community
export const leaveCommunity = mutation({
  args: {
    community_id: v.id("communities"),
    user_id: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("community_members")
      .withIndex("by_pair", (q) =>
        q.eq("community_id", args.community_id).eq("user_id", args.user_id)
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);

      const community = await ctx.db.get(args.community_id);
      if (community && community.members_count > 0) {
        await ctx.db.patch(args.community_id, {
          members_count: community.members_count - 1,
        });
      }

      return { success: true };
    }

    return { not_member: true };
  },
});
// Create a comment on a community post
export const createCommunityComment = mutation({
  args: {
    post_id: v.id("community_posts"),
    user_id: v.string(),
    content: v.string(),
    parent_id: v.optional(v.id("community_comments")),
  },
  handler: async (ctx, args) => {
    const commentId = await ctx.db.insert("community_comments", {
      post_id: args.post_id,
      user_id: args.user_id,
      content: args.content,
      parent_id: args.parent_id,
      upvotes: 0,
      downvotes: 0,
      replies_count: 0,
      created_at: Date.now(),
    });

    // Update post comment count
    const post = await ctx.db.get(args.post_id);
    if (post) {
      await ctx.db.patch(args.post_id, {
        comments_count: post.comments_count + 1,
      });
    }

    // If this is a reply, update parent's reply count
    if (args.parent_id) {
      const parent = await ctx.db.get(args.parent_id);
      if (parent) {
        await ctx.db.patch(args.parent_id, {
          replies_count: parent.replies_count + 1,
        });
      }
    }

    return commentId;
  },
});

// Vote on a community comment (upvote/downvote)
export const voteCommunityComment = mutation({
  args: {
    comment_id: v.id("community_comments"),
    user_id: v.string(),
    vote_type: v.union(v.literal("upvote"), v.literal("downvote")),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("community_comment_votes")
      .withIndex("by_user_comment", (q) =>
        q.eq("user_id", args.user_id).eq("comment_id", args.comment_id)
      )
      .first();

    const comment = await ctx.db.get(args.comment_id);
    if (!comment) throw new Error("Comment not found");

    if (existing) {
      // Remove existing vote
      await ctx.db.delete(existing._id);
      
      if (existing.vote_type === "upvote") {
        await ctx.db.patch(args.comment_id, {
          upvotes: Math.max(0, comment.upvotes - 1),
        });
      } else {
        await ctx.db.patch(args.comment_id, {
          downvotes: Math.max(0, comment.downvotes - 1),
        });
      }

      // If same vote type, just remove it
      if (existing.vote_type === args.vote_type) {
        return { vote_type: null };
      }
    }

    // Add new vote
    await ctx.db.insert("community_comment_votes", {
      comment_id: args.comment_id,
      user_id: args.user_id,
      vote_type: args.vote_type,
      created_at: Date.now(),
    });

    if (args.vote_type === "upvote") {
      await ctx.db.patch(args.comment_id, {
        upvotes: comment.upvotes + 1,
      });
    } else {
      await ctx.db.patch(args.comment_id, {
        downvotes: comment.downvotes + 1,
      });
    }

    return { vote_type: args.vote_type };
  },
});

// Vote on a community post (upvote/downvote)
export const voteCommunityPost = mutation({
  args: {
    post_id: v.id("community_posts"),
    user_id: v.string(),
    vote_type: v.union(v.literal("upvote"), v.literal("downvote")),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("community_post_votes")
      .withIndex("by_user_post", (q) =>
        q.eq("user_id", args.user_id).eq("post_id", args.post_id)
      )
      .first();

    const post = await ctx.db.get(args.post_id);
    if (!post) throw new Error("Post not found");

    if (existing) {
      // Remove existing vote
      await ctx.db.delete(existing._id);
      
      if (existing.vote_type === "upvote") {
        await ctx.db.patch(args.post_id, {
          upvotes: Math.max(0, post.upvotes - 1),
        });
      } else {
        await ctx.db.patch(args.post_id, {
          downvotes: Math.max(0, post.downvotes - 1),
        });
      }

      // If same vote type, just remove it
      if (existing.vote_type === args.vote_type) {
        return { vote_type: null };
      }
    }

    // Add new vote
    await ctx.db.insert("community_post_votes", {
      post_id: args.post_id,
      user_id: args.user_id,
      vote_type: args.vote_type,
      created_at: Date.now(),
    });

    if (args.vote_type === "upvote") {
      await ctx.db.patch(args.post_id, {
        upvotes: post.upvotes + 1,
      });
    } else {
      await ctx.db.patch(args.post_id, {
        downvotes: post.downvotes + 1,
      });
    }

    return { vote_type: args.vote_type };
  },
});
// Seed communities for testing
export const seedCommunities = mutation({
  args: {},
  handler: async (ctx) => {
    const communities = [
      {
        name: "Golden Arrow Bus Services",
        slug: "golden-arrow",
        description: "Discuss GABS routes, schedules, and experiences",
        icon: "🚌",
        created_by: "mock-user-id",
      },
      {
        name: "MyCiTi Fans",
        slug: "myciti-fans", 
        description: "Cape Town's BRT system discussions",
        icon: "🔵",
        created_by: "mock-user-id",
      },
      {
        name: "Bus Photography",
        slug: "bus-photography",
        description: "Share your best bus photos and spotting tips",
        icon: "📷",
        created_by: "mock-user-id",
      }
    ];

    for (const community of communities) {
      const existing = await ctx.db
        .query("communities")
        .withIndex("by_slug", (q) => q.eq("slug", community.slug))
        .first();
      
      if (!existing) {
        const communityId = await ctx.db.insert("communities", {
          ...community,
          members_count: 1,
          posts_count: 0,
          created_at: Date.now(),
        });

        await ctx.db.insert("community_members", {
          community_id: communityId,
          user_id: community.created_by,
          joined_at: Date.now(),
        });
      }
    }

    return { success: true };
  },
});
// Rate a company
export const rateCompany = mutation({
  args: {
    user_id: v.string(),
    company_id: v.id("companies"),
    rating: v.number(),
    comment: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user already rated this company
    const existing = await ctx.db
      .query("company_ratings")
      .withIndex("by_user_company", (q) =>
        q.eq("user_id", args.user_id).eq("company_id", args.company_id)
      )
      .first();

    if (existing) {
      // Update existing rating
      await ctx.db.patch(existing._id, {
        rating: args.rating,
        comment: args.comment,
        updated_at: Date.now(),
      });
    } else {
      // Create new rating
      await ctx.db.insert("company_ratings", {
        user_id: args.user_id,
        company_id: args.company_id,
        rating: args.rating,
        comment: args.comment,
        created_at: Date.now(),
      });
    }

    // Recalculate company average rating
    const ratings = await ctx.db
      .query("company_ratings")
      .withIndex("by_company", (q) => q.eq("company_id", args.company_id))
      .collect();

    const avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;

    await ctx.db.patch(args.company_id, {
      rating_avg: avgRating,
    });

    return { success: true, new_average: avgRating };
  },
});

// Update company
export const updateCompany = mutation({
  args: {
    id: v.id("companies"),
    name: v.string(),
    logo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...data } = args;
    await ctx.db.patch(id, data);
    return { success: true };
  },
});

// Update bus
export const updateBus = mutation({
  args: {
    id: v.id("buses"),
    company_id: v.optional(v.id("companies")),
    fleet_number: v.optional(v.string()),
    route: v.optional(v.string()),
    type: v.optional(v.string()),
    year: v.optional(v.number()),
    photos: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { id, ...data } = args;
    const updates: any = {};
    Object.keys(data).forEach(key => {
      if (data[key as keyof typeof data] !== undefined) {
        updates[key] = data[key as keyof typeof data];
      }
    });
    await ctx.db.patch(id, updates);
    return { success: true };
  },
});

// Update driver
export const updateDriver = mutation({
  args: {
    id: v.id("drivers"),
    name: v.optional(v.string()),
    company_id: v.optional(v.id("companies")),
    routes: v.optional(v.array(v.string())),
    experience_years: v.optional(v.number()),
    photo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...data } = args;
    const updates: any = {};
    Object.keys(data).forEach(key => {
      if (data[key as keyof typeof data] !== undefined) {
        updates[key] = data[key as keyof typeof data];
      }
    });
    await ctx.db.patch(id, updates);
    return { success: true };
  },
});
