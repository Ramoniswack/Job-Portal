importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAoLTB1dcvsu2FcZvtViebplRagripfDZ4",
  authDomain: "job-portal-2d567.firebaseapp.com",
  projectId: "job-portal-2d567",
  storageBucket: "job-portal-2d567.firebasestorage.app",
  messagingSenderId: "811768898682",
  appId: "1:811768898682:web:fec27f8bc44fd4905787c3"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);
  
  const notificationTitle = payload.notification?.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
