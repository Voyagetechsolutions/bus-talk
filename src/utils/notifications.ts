interface NotificationData {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: any;
}

class NotificationService {
  private registration: ServiceWorkerRegistration | null = null;

  async initialize() {
    // Simplified initialization without service worker registration
    console.log('Notification service initialized');
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  // Notification templates
  static templates = {
    spotterApproved: (username: string): NotificationData => ({
      title: '🎉 Spotter Status Approved!',
      body: `Congratulations ${username}! You can now create posts and boost content.`,
      icon: '/icon-192x192.png'
    }),

    postBoosted: (postTitle: string): NotificationData => ({
      title: '🚀 Your post was boosted!',
      body: `"${postTitle}" received a boost from a verified spotter.`,
      icon: '/icon-192x192.png'
    }),

    newComment: (postTitle: string, commenterName: string): NotificationData => ({
      title: '💬 New comment on your post',
      body: `${commenterName} commented on "${postTitle}"`,
      icon: '/icon-192x192.png'
    }),

    monthlyAward: (category: string, position: string): NotificationData => ({
      title: '🏆 Monthly Awards Results!',
      body: `You ${position} in the ${category} category this month!`,
      icon: '/icon-192x192.png'
    }),

    badgeEarned: (badgeName: string): NotificationData => ({
      title: '🏅 New Badge Earned!',
      body: `You've earned the "${badgeName}" badge!`,
      icon: '/icon-192x192.png'
    })
  };
}

export const notificationService = new NotificationService();