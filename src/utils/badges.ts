import { supabase } from './supabase';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export const BADGES: Record<string, Badge> = {
  verified: {
    id: 'verified',
    name: 'Verified Spotter',
    description: 'Verified community spotter',
    icon: '✓',
    color: 'text-accent-yellow'
  },
  senior: {
    id: 'senior',
    name: 'Senior Spotter',
    description: 'Active for over 6 months',
    icon: '🎖️',
    color: 'text-blue-400'
  },
  rising_star: {
    id: 'rising_star',
    name: 'Rising Star',
    description: 'Top contributor this month',
    icon: '⭐',
    color: 'text-accent-cyan'
  },
  veteran: {
    id: 'veteran',
    name: 'Veteran',
    description: 'Active for over 1 year',
    icon: '🏆',
    color: 'text-accent-red'
  },
  top_rater: {
    id: 'top_rater',
    name: 'Top Rater',
    description: 'Submitted 50+ ratings',
    icon: '📊',
    color: 'text-green-400'
  },
  photographer: {
    id: 'photographer',
    name: 'Photographer',
    description: 'Shared 25+ photos',
    icon: '📸',
    color: 'text-purple-400'
  }
};

export const awardBadge = async (userId: string, badgeId: string) => {
  try {
    const { data: user } = await supabase
      .from('users')
      .select('badges')
      .eq('id', userId)
      .single();

    if (user && !user.badges.includes(badgeId)) {
      const newBadges = [...user.badges, badgeId];
      
      await supabase
        .from('users')
        .update({ badges: newBadges })
        .eq('id', userId);
        
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error awarding badge:', error);
    return false;
  }
};

export const checkAndAwardBadges = async (userId: string) => {
  try {
    // Check for Senior Spotter (6+ months)
    const { data: user } = await supabase
      .from('users')
      .select('created_at, badges')
      .eq('id', userId)
      .single();

    if (user) {
      const accountAge = Date.now() - new Date(user.created_at).getTime();
      const sixMonths = 6 * 30 * 24 * 60 * 60 * 1000;
      const oneYear = 12 * 30 * 24 * 60 * 60 * 1000;

      if (accountAge > sixMonths && !user.badges.includes('senior')) {
        await awardBadge(userId, 'senior');
      }

      if (accountAge > oneYear && !user.badges.includes('veteran')) {
        await awardBadge(userId, 'veteran');
      }
    }

    // Check for Top Rater (50+ ratings)
    const { count: ratingsCount } = await supabase
      .from('ratings')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (ratingsCount && ratingsCount >= 50) {
      await awardBadge(userId, 'top_rater');
    }

    // Check for Photographer (25+ photos)
    const { data: posts } = await supabase
      .from('posts')
      .select('media_urls')
      .eq('user_id', userId);

    if (posts) {
      const totalPhotos = posts.reduce((count, post) => count + post.media_urls.length, 0);
      if (totalPhotos >= 25) {
        await awardBadge(userId, 'photographer');
      }
    }

  } catch (error) {
    console.error('Error checking badges:', error);
  }
};