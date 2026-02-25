import { useEffect, useState } from 'react';
import { requestNotificationPermission, onMessageListener } from '@/lib/firebase';

interface NotificationPayload {
  notification?: {
    title?: string;
    body?: string;
  };
  data?: Record<string, string>;
}

export const useNotifications = (userId: string | null) => {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<NotificationPayload | null>(null);

  useEffect(() => {
    if (!userId) {
      console.log('⚠️ No userId provided, skipping notification setup');
      return;
    }

    console.log('🔔 Setting up notifications for user:', userId);

    const setupNotifications = async () => {
      try {
        console.log('📱 Requesting notification permission...');
        
        // Request permission and get token
        const token = await requestNotificationPermission();
        
        if (token) {
          console.log('✅ FCM token received:', token.substring(0, 20) + '...');
          setFcmToken(token);
          
          // Save token to backend
          await saveFCMToken(token);
        } else {
          console.log('❌ No FCM token received - permission may be denied');
        }
      } catch (error) {
        console.error('❌ Error setting up notifications:', error);
      }
    };

    setupNotifications();

    // Listen for foreground messages
    const setupMessageListener = async () => {
      try {
        const payload: any = await onMessageListener();
        console.log('📬 Received foreground message:', payload);
        setNotification(payload);

        // Show browser notification
        if (payload.notification && Notification.permission === 'granted') {
          console.log('🔔 Showing browser notification');
          new Notification(payload.notification.title || 'New Notification', {
            body: payload.notification.body,
            icon: '/icon-192x192.png',
            badge: '/badge-72x72.png'
          });
        }
      } catch (err) {
        console.error('❌ Failed to receive message:', err);
      }
    };

    setupMessageListener();
  }, [userId]);

  const saveFCMToken = async (token: string) => {
    try {
      const authToken = localStorage.getItem('authToken');
      
      // Don't try to save if no auth token
      if (!authToken) {
        console.log('⚠️ No auth token available, skipping FCM token save');
        return;
      }
      
      console.log('=== SAVING FCM TOKEN TO BACKEND ===');
      console.log('Auth token exists:', !!authToken);
      console.log('FCM token length:', token.length);
      console.log('Request URL:', 'http://localhost:5000/api/users/fcm-token');
      
      const response = await fetch('http://localhost:5000/api/users/fcm-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ fcmToken: token })
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      const data = await response.json();
      console.log('Response data:', data);
      
      if (response.ok && data.success) {
        console.log('✅ FCM token saved successfully to backend');
      } else {
        // Only log error if it's not a 401 (which means user isn't logged in)
        if (response.status !== 401) {
          console.error('❌ Failed to save FCM token. Status:', response.status);
          console.error('Response data:', data);
        } else {
          console.log('⚠️ User not authenticated, FCM token not saved');
        }
      }
    } catch (error) {
      console.error('❌ Error saving FCM token:', error);
    }
  };

  return { fcmToken, notification };
};
