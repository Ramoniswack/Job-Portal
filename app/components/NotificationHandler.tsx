'use client';

import { useEffect, useState } from 'react';
import { requestNotificationPermission, onMessageListener } from '@/lib/firebase';
import { Bell, X } from 'lucide-react';

interface NotificationHandlerProps {
    userId?: string;
    userRole?: string;
}

export default function NotificationHandler({ userId, userRole }: NotificationHandlerProps) {
    const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);
    const [foregroundNotification, setForegroundNotification] = useState<any>(null);

    useEffect(() => {
        // Check if user is logged in and is a worker
        if (userId && userRole === 'worker') {
            checkNotificationPermission();
            setupForegroundListener();
        }
    }, [userId, userRole]);

    const checkNotificationPermission = async () => {
        if ('Notification' in window) {
            const permission = Notification.permission;

            if (permission === 'default') {
                // Show custom prompt
                setShowPermissionPrompt(true);
            } else if (permission === 'granted') {
                // Register FCM token
                await registerFCMToken();
            }
        }
    };

    const registerFCMToken = async () => {
        try {
            const token = await requestNotificationPermission();

            if (token) {
                // Send token to backend
                const authToken = localStorage.getItem('token');

                const response = await fetch('http://localhost:5000/api/notifications/token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify({ fcmToken: token })
                });

                const data = await response.json();

                if (data.success) {
                    console.log('FCM token registered successfully');
                } else {
                    console.error('Failed to register FCM token:', data.message);
                }
            }
        } catch (error) {
            console.error('Error registering FCM token:', error);
        }
    };

    const setupForegroundListener = () => {
        onMessageListener()
            .then((payload: any) => {
                console.log('Received foreground message:', payload);
                setForegroundNotification(payload);

                // Auto-hide after 5 seconds
                setTimeout(() => {
                    setForegroundNotification(null);
                }, 5000);
            })
            .catch((err) => console.error('Failed to receive foreground message:', err));
    };

    const handleEnableNotifications = async () => {
        setShowPermissionPrompt(false);
        await registerFCMToken();
    };

    const handleDismissPrompt = () => {
        setShowPermissionPrompt(false);
    };

    const handleDismissNotification = () => {
        setForegroundNotification(null);
    };

    return (
        <>
            {/* Permission Prompt */}
            {showPermissionPrompt && (
                <div className="fixed bottom-4 right-4 z-50 max-w-sm bg-white rounded-lg shadow-2xl border border-gray-200 p-4 animate-in slide-in-from-bottom-2">
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                            <Bell className="w-6 h-6 text-[#26cf71]" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">
                                Enable Notifications
                            </h3>
                            <p className="text-sm text-gray-600 mb-3">
                                Get instant updates when your job applications are approved or rejected.
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleEnableNotifications}
                                    className="flex-1 px-3 py-2 bg-[#26cf71] hover:bg-[#1eb863] text-white text-sm font-medium rounded-lg transition-colors"
                                >
                                    Enable
                                </button>
                                <button
                                    onClick={handleDismissPrompt}
                                    className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
                                >
                                    Not Now
                                </button>
                            </div>
                        </div>
                        <button
                            onClick={handleDismissPrompt}
                            className="flex-shrink-0 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}

            {/* Foreground Notification */}
            {foregroundNotification && (
                <div className="fixed top-4 right-4 z-50 max-w-sm bg-white rounded-lg shadow-2xl border border-gray-200 p-4 animate-in slide-in-from-top-2">
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                            <Bell className="w-6 h-6 text-[#26cf71]" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">
                                {foregroundNotification.notification?.title || 'New Notification'}
                            </h3>
                            <p className="text-sm text-gray-600">
                                {foregroundNotification.notification?.body || 'You have a new notification'}
                            </p>
                        </div>
                        <button
                            onClick={handleDismissNotification}
                            className="flex-shrink-0 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
