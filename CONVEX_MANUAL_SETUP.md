# Convex Setup - Manual Steps

The Convex CLI has compatibility issues with Node.js 18. Here's how to set up manually:

## Option 1: Use Web Dashboard
1. Go to https://dashboard.convex.dev
2. Sign up/login with GitHub
3. Create new project: "bus-talk"
4. Copy deployment URL: `https://mellow-mandrill-396.convex.cloud`

## Option 2: Update Node.js
```bash
# Install Node.js 20+
nvm install 20
nvm use 20
npx convex login
npx convex dev
```

## Current Status
- ✅ Schema created (`convex/schema.ts`)
- ✅ Queries created (`convex/queries.ts`) 
- ✅ Mutations created (`convex/mutations.ts`)
- ✅ React integration ready
- ✅ Environment configured (`.env.local`)
- ❌ CLI deployment (Node.js compatibility issue)

## Quick Start (Skip Convex for now)
Your app works perfectly with Supabase. Convex is optional and can be added later.

```bash
npm start
```

The app will use Supabase backend and all features work normally.