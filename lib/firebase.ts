// Firebase configuration and initialization
import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

console.log('🔥 Firebase Config:', {
  apiKey: firebaseConfig.apiKey ? '✅ Set' : '❌ Missing',
  authDomain: firebaseConfig.authDomain ? '✅ Set' : '❌ Missing',
  projectId: firebaseConfig.projectId ? '✅ Set' : '❌ Missing',
  storageBucket: firebaseConfig.storageBucket ? '✅ Set' : '❌ Missing',
  messagingSenderId: firebaseConfig.messagingSenderId ? '✅ Set' : '❌ Missing',
  appId: firebaseConfig.appId ? '✅ Set' : '❌ Missing'
});

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
console.log('✅ Firebase app initialized');

// Initialize Firebase Cloud Messaging
let messaging: Messaging | null = null;

if (typeof window !== 'undefined') {
  try {
    messaging = getMessaging(app);
    console.log('✅ Firebase Messaging initialized');
  } catch (error) {
    console.error('❌ Error initializing Firebase Messaging:', error);
  }
}

// Request notification permission and get FCM token
export const requestNotificationPermission = async (): Promise<string | null> => {
  try {
    if (!messaging) {
      console.error('❌ Messaging not initialized');
      return null;
    }

    console.log('📱 Requesting notification permission...');
    
    // Request permission
    const permission = await Notification.requestPermission();
    console.log('Permission status:', permission);
    
    if (permission === 'granted') {
      console.log('✅ Notification permission granted');
      
      const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
      console.log('VAPID key exists:', !!vapidKey);
      
      // Get FCM token
      const token = await getToken(messaging, {
        vapidKey: vapidKey
      });
      
      console.log('✅ FCM Token obtained:', token.substring(0, 20) + '...');
      return token;
    } else {
      console.log('❌ Notification permission denied');
      return null;
    }
  } catch (error) {
    console.error('❌ Error getting notification permission:', error);
    return null;
  }
};

// Listen for foreground messages
export const onMessageListener = () =>
  new Promise((resolve) => {
    if (!messaging) {
      console.error('❌ Messaging not initialized');
      return;
    }

    console.log('👂 Listening for foreground messages...');
    
    onMessage(messaging, (payload) => {
      console.log('📬 Foreground message received:', payload);
      resolve(payload);
    });
  });

export { app, messaging };
