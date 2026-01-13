# Convex Setup Instructions

## 1. Install Convex CLI globally
```bash
npm install -g convex
```

## 2. Login to Convex
```bash
npx convex login
```

## 3. Initialize your project
```bash
npx convex dev
```

## 4. Set environment variable
Add your Convex URL to `.env.local`:
```
REACT_APP_CONVEX_URL=https://your-deployment-url.convex.cloud
```

## 5. Start development
```bash
npm start
```

Your Convex backend is now set up with:
- Schema for all tables (users, companies, buses, drivers, posts, ratings, etc.)
- Queries for fetching data
- Mutations for creating/updating data
- React integration with ConvexProvider

The app will use Convex instead of Supabase once you complete the setup.