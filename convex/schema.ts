import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    username: v.string(),
    email: v.string(),
    role: v.union(v.literal("admin"), v.literal("verified_spotter"), v.literal("user")),
    spotter_status: v.boolean(),
    badges: v.array(v.string()),
    profile_pic: v.optional(v.string()),
    created_at: v.optional(v.number()),
  })
    .index("by_username", ["username"])
    .index("by_email", ["email"]),

  companies: defineTable({
    name: v.string(),
    logo: v.optional(v.string()),
    rating_avg: v.number(),
    buses_count: v.number(),
    routes_count: v.number(),
  }),

  buses: defineTable({
    company_id: v.id("companies"),
    fleet_number: v.string(),
    route: v.string(),
    type: v.optional(v.string()),
    year: v.optional(v.number()),
    photos: v.optional(v.array(v.string())),
    rating_avg: v.number(),
    last_seen: v.optional(v.number()),
  }).index("by_company", ["company_id"]),

  drivers: defineTable({
    name: v.string(),
    company_id: v.id("companies"),
    routes: v.array(v.string()),
    experience_years: v.number(),
    photo: v.optional(v.string()),
    rating_avg: v.number(),
  }).index("by_company", ["company_id"]),

  // Posts with video support - user_id is Supabase UUID string
  posts: defineTable({
    user_id: v.string(),
    type: v.union(v.literal("news"), v.literal("sighting")),
    title: v.string(),
    content: v.string(),
    media: v.optional(v.array(v.object({
      url: v.string(),
      type: v.union(v.literal("image"), v.literal("video")),
      storage_id: v.optional(v.string()),
    }))),
    status: v.optional(v.union(v.literal("active"), v.literal("blocked"))),
    likes_count: v.number(),
    boosts_count: v.number(),
    comments_count: v.number(),
    created_at: v.number(),
  })
    .index("by_user", ["user_id"])
    .index("by_created", ["created_at"]),

  // Comments - user_id is Supabase UUID string
  comments: defineTable({
    post_id: v.id("posts"),
    user_id: v.string(),
    parent_id: v.optional(v.id("comments")),
    content: v.string(),
    likes_count: v.number(),
    replies_count: v.number(),
    created_at: v.number(),
  })
    .index("by_post", ["post_id"])
    .index("by_parent", ["parent_id"])
    .index("by_user", ["user_id"]),

  // Comment likes - user_id is Supabase UUID string
  comment_likes: defineTable({
    comment_id: v.id("comments"),
    user_id: v.string(),
  })
    .index("by_comment", ["comment_id"])
    .index("by_user_comment", ["user_id", "comment_id"]),

  // Post likes - user_id is Supabase UUID string
  likes: defineTable({
    post_id: v.id("posts"),
    user_id: v.string(),
  })
    .index("by_post", ["post_id"])
    .index("by_user_post", ["user_id", "post_id"]),

  // Post boosts - user_id is Supabase UUID string
  boosts: defineTable({
    post_id: v.id("posts"),
    user_id: v.string(),
  })
    .index("by_post", ["post_id"])
    .index("by_user_post", ["user_id", "post_id"]),

  // Ratings - user_id is Supabase UUID string
  ratings: defineTable({
    user_id: v.string(),
    bus_id: v.id("buses"),
    driver_id: v.optional(v.id("drivers")),
    trip_date: v.string(),
    punctuality: v.number(),
    cleanliness: v.number(),
    comfort: v.number(),
    behavior: v.number(),
    comment: v.optional(v.string()),
    created_at: v.optional(v.number()),
  })
    .index("by_bus", ["bus_id"])
    .index("by_user", ["user_id"]),

  awards: defineTable({
    month: v.number(),
    year: v.number(),
    category: v.string(),
    winner_id: v.string(),
    votes_total: v.number(),
    votes_weighted: v.number(),
  }),

  // Votes - user_id is Supabase UUID string
  votes: defineTable({
    user_id: v.string(),
    category: v.string(),
    nominee_id: v.string(),
    year: v.number(),
    week: v.number(),
    weight: v.number(),
    created_at: v.number(),
  })
    .index("by_user", ["user_id"])
    .index("by_category_period", ["category", "year", "week"])
    .index("by_user_category_period", ["user_id", "category", "year", "week"]),

  // Routes
  routes: defineTable({
    origin: v.string(),
    destination: v.string(),
    distance: v.optional(v.number()),
  }),

  // Follows - follower relationships between users
  follows: defineTable({
    follower_id: v.string(),   // User doing the following (Supabase UUID)
    following_id: v.string(),  // User being followed (Supabase UUID)
    created_at: v.number(),
  })
    .index("by_follower", ["follower_id"])
    .index("by_following", ["following_id"])
    .index("by_pair", ["follower_id", "following_id"]),

  // Spotter applications - user_id is Supabase UUID string
  spotter_applications: defineTable({
    user_id: v.string(),
    reason: v.string(),
    experience: v.optional(v.string()),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    reviewed_by: v.optional(v.string()),
    reviewed_at: v.optional(v.number()),
    created_at: v.number(),
  })
    .index("by_user", ["user_id"])
    .index("by_status", ["status"]),

  // Communities (Coach Talk) - Reddit-like discussion groups
  communities: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    icon: v.optional(v.string()),
    banner: v.optional(v.string()),
    members_count: v.number(),
    posts_count: v.number(),
    created_by: v.string(),
    created_at: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_created", ["created_at"]),

  // Community posts/threads
  community_posts: defineTable({
    community_id: v.id("communities"),
    user_id: v.string(),
    title: v.string(),
    content: v.string(),
    media: v.optional(v.array(v.object({
      url: v.string(),
      type: v.union(v.literal("image"), v.literal("video")),
      storage_id: v.optional(v.string()),
    }))),
    upvotes: v.number(),
    downvotes: v.number(),
    comments_count: v.number(),
    created_at: v.number(),
  })
    .index("by_community", ["community_id"])
    .index("by_user", ["user_id"])
    .index("by_created", ["created_at"]),

  // Community comments (Reddit-style)
  community_comments: defineTable({
    post_id: v.id("community_posts"),
    user_id: v.string(),
    parent_id: v.optional(v.id("community_comments")),
    content: v.string(),
    upvotes: v.number(),
    downvotes: v.number(),
    replies_count: v.number(),
    created_at: v.number(),
  })
    .index("by_post", ["post_id"])
    .index("by_parent", ["parent_id"])
    .index("by_user", ["user_id"]),

  // Community comment votes
  community_comment_votes: defineTable({
    comment_id: v.id("community_comments"),
    user_id: v.string(),
    vote_type: v.union(v.literal("upvote"), v.literal("downvote")),
    created_at: v.number(),
  })
    .index("by_comment", ["comment_id"])
    .index("by_user_comment", ["user_id", "comment_id"]),

  // Community post votes
  community_post_votes: defineTable({
    post_id: v.id("community_posts"),
    user_id: v.string(),
    vote_type: v.union(v.literal("upvote"), v.literal("downvote")),
    created_at: v.number(),
  })
    .index("by_post", ["post_id"])
    .index("by_user_post", ["user_id", "post_id"]),
  // Community membership
  community_members: defineTable({
    community_id: v.id("communities"),
    user_id: v.string(),
    joined_at: v.number(),
  })
    .index("by_community", ["community_id"])
    .index("by_user", ["user_id"])
    .index("by_pair", ["community_id", "user_id"]),
});
