import { useEffect, useState } from 'react';
// import { requestNotificationPermission, onMessageListener } from './firebase';

export const useFCMNotifications = (token: string) => {
  const [notification, setNotification] = useState<any>(null);

  useEffect(() => {
    // FCM disabled for now - will be enabled later
    console.log('FCM notifications disabled');
  }, [token]);

  return { notification };
};
