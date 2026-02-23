import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';

// Firebase configuration
// Replace these values with your actual Firebase config from Firebase Console
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "YOUR_STORAGE_BUCKET",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "YOUR_APP_ID"
};

// Check if Firebase is properly configured
const isFirebaseConfigured = () => {
  const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
  const missingKeys = requiredKeys.filter(key => {
    const value = firebaseConfig[key as keyof typeof firebaseConfig];
    return !value || value.startsWith('YOUR_');
  });
  
  if (missingKeys.length > 0) {
    console.error('❌ Firebase not configured properly!');
    console.error('Missing or invalid configuration for:', missingKeys.join(', '));
    console.error('Please update frontend/.env.local with your Firebase credentials');
    console.error('Get them from: Firebase Console > Project Settings > General > Your apps');
    return false;
  }
  return true;
};

// Initialize Firebase only if configured
const app = getApps().length === 0 && isFirebaseConfigured() ? initializeApp(firebaseConfig) : getApps()[0];

// Get messaging instance (only in browser)
let messaging: any = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      messaging = getMessaging(app);
    }
  });
}

// Request notification permission and get FCM token
export const requestNotificationPermission = async () => {
  try {
    // Check if notifications are supported
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return null;
    }

    // Check if messaging is supported
    const supported = await isSupported();
    if (!supported) {
      console.log('Firebase messaging is not supported in this browser');
      return null;
    }

    // Check if VAPID key is configured
    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    if (!vapidKey || vapidKey === 'your_vapid_key_here' || vapidKey === 'YOUR_VAPID_KEY') {
      console.error('❌ VAPID key not configured!');
      console.error('Please add your Firebase VAPID key to frontend/.env.local');
      console.error('Get it from: Firebase Console > Project Settings > Cloud Messaging > Web Push certificates');
      return null;
    }

    // Request permission
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('Notification permission granted');
      
      // Get FCM token
      const token = await getToken(messaging, { vapidKey });
      
      console.log('FCM Token:', token);
      return token;
    } else {
      console.log('Notification permission denied');
      return null;
    }
  } catch (error) {
    console.error('Error getting notification permission:', error);
    if (error instanceof Error && error.message.includes('applicationServerKey')) {
      console.error('❌ Invalid VAPID key! Please check your Firebase configuration.');
      console.error('The VAPID key should start with "B" and be a long string.');
    }
    return null;
  }
};

// Listen for foreground messages
export const onMessageListener = () =>
  new Promise((resolve) => {
    if (messaging) {
      onMessage(messaging, (payload) => {
        console.log('Received foreground message:', payload);
        resolve(payload);
      });
    }
  });

export { messaging };
