# Environment Setup Required

## Supabase Configuration Needed

The app needs valid Supabase credentials. Update `.env.local`:

```env
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
```

## Get Supabase Credentials:

1. Go to https://supabase.com
2. Create new project
3. Go to Settings > API
4. Copy:
   - Project URL → `REACT_APP_SUPABASE_URL`
   - Anon public key → `REACT_APP_SUPABASE_ANON_KEY`

## Quick Demo Setup (No Database):

Replace `src/utils/supabase.ts` with mock data to run without backend:

```typescript
export const supabase = {
  from: () => ({
    select: () => ({ data: [], error: null }),
    insert: () => ({ data: null, error: null }),
    update: () => ({ data: null, error: null }),
  }),
  auth: {
    onAuthStateChange: () => ({ data: { subscription: null } }),
  },
};
```

This will let you see the UI without database setup.