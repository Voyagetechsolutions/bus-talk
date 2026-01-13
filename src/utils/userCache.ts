import { supabase } from './supabase';

interface CachedUser {
    id: string;
    username: string;
    profile_pic?: string;
    spotter_status: boolean;
    role: string;
}

// Simple in-memory cache for user data
const userCache = new Map<string, { user: CachedUser; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Fetches user data from Supabase by user ID (UUID)
 * Results are cached for 5 minutes to reduce database calls
 */
export const getUserById = async (userId: string): Promise<CachedUser | null> => {
    if (!userId) return null;

    // Check cache first
    const cached = userCache.get(userId);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.user;
    }

    try {
        const { data, error } = await supabase
            .from('users')
            .select('id, username, profile_pic, spotter_status, role')
            .eq('id', userId)
            .single();

        if (error || !data) {
            console.error('Error fetching user:', error);
            return null;
        }

        const user: CachedUser = {
            id: data.id,
            username: data.username || 'User',
            profile_pic: data.profile_pic,
            spotter_status: data.spotter_status || false,
            role: data.role || 'user',
        };

        // Cache the result
        userCache.set(userId, { user, timestamp: Date.now() });
        console.log('Fetched user:', user.username);

        return user;
    } catch (error) {
        console.error('getUserById error:', error);
        return null;
    }
};

/**
 * Prefetch multiple users at once (for feed loading)
 */
export const prefetchUsers = async (userIds: string[]): Promise<void> => {
    const uncachedIds = userIds.filter(id => {
        const cached = userCache.get(id);
        return !cached || Date.now() - cached.timestamp >= CACHE_TTL;
    });

    if (uncachedIds.length === 0) return;

    try {
        const { data, error } = await supabase
            .from('users')
            .select('id, username, profile_pic, spotter_status, role')
            .in('id', uncachedIds);

        if (error || !data) {
            console.error('Error prefetching users:', error);
            return;
        }

        data.forEach(userData => {
            const user: CachedUser = {
                id: userData.id,
                username: userData.username || 'User',
                profile_pic: userData.profile_pic,
                spotter_status: userData.spotter_status || false,
                role: userData.role || 'user',
            };
            userCache.set(userData.id, { user, timestamp: Date.now() });
        });

        console.log(`Prefetched ${data.length} users`);
    } catch (error) {
        console.error('prefetchUsers error:', error);
    }
};

/**
 * Clear the user cache (useful for testing or logout)
 */
export const clearUserCache = (): void => {
    userCache.clear();
};

/**
 * Get cached user synchronously (returns null if not cached)
 */
export const getCachedUser = (userId: string): CachedUser | null => {
    const cached = userCache.get(userId);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.user;
    }
    return null;
};
