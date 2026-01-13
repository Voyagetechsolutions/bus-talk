import { supabase } from './supabase';

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
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        // Check if there's an existing registration
        const existingRegistration = await navigator.serviceWorker.getRegistration('/sw.js');
        if (existingRegistration) {
          this.registration = existingRegistration;
          console.log('Service Worker already registered');
        } else {
          this.registration = await navigator.serviceWorker.register('/sw.js');
          console.log('Service Worker registered');
        }
      } catch (error) {
        console.error('Service Worker registration failed:', error);
        // Continue without service worker - the app still works
      }
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  async subscribeUser(userId: string): Promise<boolean> {
    if (!this.registration) {
      console.error('Service Worker not registered');
      return false;
    }

    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          process.env.REACT_APP_VAPID_PUBLIC_KEY || ''
        )
      });

      // Store subscription in database
      await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: userId,
          subscription: JSON.stringify(subscription),
          created_at: new Date().toISOString()
        });

      return true;
    } catch (error) {
      console.error('Failed to subscribe user:', error);
      return false;
    }
  }

  async sendNotification(userId: string, notification: NotificationData) {
    try {
      await supabase.functions.invoke('send-push-notification', {
        body: {
          userId,
          notification
        }
      });
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
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

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}

export const notificationService = new NotificationService();