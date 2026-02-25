'use client';

import { useState, useEffect } from 'react';
import { Bell, Check, Trash2, Settings } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'success' | 'info' | 'warning' | 'error';
    read: boolean;
    timestamp: Date;
    data?: Record<string, any>;
}

interface NotificationBellWithFCMProps {
    userId?: string;
}

export default function NotificationBellWithFCM({ userId }: NotificationBellWithFCMProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const { fcmToken, notification: fcmNotification } = useNotifications(userId || null);

    useEffect(() => {
        loadNotifications();
    }, [userId]);

    useEffect(() => {
        // When a new FCM notification arrives, add it to the list
        if (fcmNotification) {
            console.log('=== NEW FCM NOTIFICATION RECEIVED ===');
            console.log('Notification:', fcmNotification);

            const newNotif: Notification = {
                id: Date.now().toString(),
                title: (fcmNotification as any).notification?.title || 'New Notification',
                message: (fcmNotification as any).notification?.body || '',
                type: determineNotificationType((fcmNotification as any).data),
                read: false,
                timestamp: new Date(),
                data: (fcmNotification as any).data
            };

            console.log('Adding notification to list:', newNotif);
            const updated = [newNotif, ...notifications];
            saveNotifications(updated);
        }
    }, [fcmNotification]);

    useEffect(() => {
        const unread = notifications.filter(n => !n.read).length;
        setUnreadCount(unread);
    }, [notifications]);

    const determineNotificationType = (data: any): 'success' | 'info' | 'warning' | 'error' => {
        if (data?.type === 'application_status_update') {
            if (data?.status === 'approved') return 'success';
            if (data?.status === 'rejected') return 'warning';
        }
        return 'info';
    };

    const loadNotifications = () => {
        const stored = localStorage.getItem(`notifications_${userId}`);
        if (stored) {
            const parsed = JSON.parse(stored);
            setNotifications(parsed.map((n: any) => ({
                ...n,
                timestamp: new Date(n.timestamp)
            })));
        }
    };

    const saveNotifications = (notifs: Notification[]) => {
        localStorage.setItem(`notifications_${userId}`, JSON.stringify(notifs));
        setNotifications(notifs);
    };

    const markAsRead = (id: string) => {
        const updated = notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
        );
        saveNotifications(updated);
    };

    const markAllAsRead = () => {
        const updated = notifications.map(n => ({ ...n, read: true }));
        saveNotifications(updated);
    };

    const deleteNotification = (id: string) => {
        const updated = notifications.filter(n => n.id !== id);
        saveNotifications(updated);
    };

    const clearAll = () => {
        saveNotifications([]);
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'success':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'error':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'warning':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default:
                return 'bg-blue-100 text-blue-800 border-blue-200';
        }
    };

    const formatTime = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    };

    const handleNotificationClick = (notification: Notification) => {
        markAsRead(notification.id);
        setIsOpen(false);

        // Navigate based on notification type
        if (notification.data?.type === 'new_application') {
            window.location.href = '/dashboard?section=my-jobs';
        } else if (notification.data?.type === 'application_status_update') {
            window.location.href = '/dashboard?section=my-applications';
        }
    };

    return (
        <div className="relative">
            {/* Bell Icon Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Notifications"
            >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1 text-xs font-bold text-white bg-red-500 rounded-full animate-pulse">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown Panel */}
                    <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 animate-in slide-in-from-top-2 duration-200">
                        {/* Header */}
                        <div className="p-4 border-b border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Notifications
                                </h3>
                                <button
                                    className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                                    title="Notification settings"
                                >
                                    <Settings className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="flex items-center justify-between">
                                {unreadCount > 0 && (
                                    <p className="text-sm text-gray-500">
                                        {unreadCount} unread
                                    </p>
                                )}
                                {notifications.length > 0 && (
                                    <div className="flex gap-3 ml-auto">
                                        {unreadCount > 0 && (
                                            <button
                                                onClick={markAllAsRead}
                                                className="text-xs text-[#26cf71] hover:text-[#1eb863] font-medium"
                                            >
                                                Mark all read
                                            </button>
                                        )}
                                        <button
                                            onClick={clearAll}
                                            className="text-xs text-red-600 hover:text-red-700 font-medium"
                                        >
                                            Clear all
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Notifications List */}
                        <div className="max-h-[400px] overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 px-4">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                        <Bell className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <p className="text-gray-900 font-medium mb-1">No notifications yet</p>
                                    <p className="text-gray-500 text-sm text-center">
                                        We'll notify you when something important happens
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${!notification.read ? 'bg-blue-50/50' : ''}`}
                                        >
                                            <div className="flex items-start gap-3">
                                                {/* Unread Indicator */}
                                                {!notification.read && (
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                                                )}

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2 mb-1">
                                                        <h4 className="text-sm font-semibold text-gray-900">
                                                            {notification.title}
                                                        </h4>
                                                        <span className="text-xs text-gray-500 whitespace-nowrap">
                                                            {formatTime(notification.timestamp)}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-600 mb-2">
                                                        {notification.message}
                                                    </p>

                                                    {/* Show worker details for new application notifications */}
                                                    {notification.data?.type === 'new_application' && (
                                                        <div className="mb-2 p-2 bg-gray-50 rounded border border-gray-200">
                                                            <p className="text-xs text-gray-700 mb-1">
                                                                <span className="font-semibold">👤 Applicant:</span> {notification.data.workerName}
                                                            </p>
                                                            {notification.data.workerEmail && (
                                                                <p className="text-xs text-gray-600">
                                                                    <span className="font-semibold">📧 Email:</span> {notification.data.workerEmail}
                                                                </p>
                                                            )}
                                                        </div>
                                                    )}

                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className={`text-xs px-2 py-0.5 rounded-full border font-medium ${getTypeColor(
                                                                notification.type
                                                            )}`}
                                                        >
                                                            {notification.type}
                                                        </span>

                                                        {/* Action buttons based on notification type */}
                                                        {notification.data?.type === 'new_application' && (
                                                            <button
                                                                onClick={() => handleNotificationClick(notification)}
                                                                className="text-xs px-3 py-1 bg-[#26cf71] hover:bg-[#1eb863] text-white rounded-full font-medium transition-colors"
                                                            >
                                                                View Applications
                                                            </button>
                                                        )}

                                                        {notification.data?.type === 'application_status_update' && (
                                                            <button
                                                                onClick={() => handleNotificationClick(notification)}
                                                                className="text-xs px-3 py-1 bg-[#26cf71] hover:bg-[#1eb863] text-white rounded-full font-medium transition-colors"
                                                            >
                                                                View Details
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex gap-1 flex-shrink-0">
                                                    {!notification.read && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                markAsRead(notification.id);
                                                            }}
                                                            className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                                                            title="Mark as read"
                                                        >
                                                            <Check className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            deleteNotification(notification.id);
                                                        }}
                                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 3 && (
                            <div className="p-3 border-t border-gray-200 bg-gray-50">
                                <button
                                    onClick={() => {
                                        setIsOpen(false);
                                    }}
                                    className="w-full text-sm text-center text-[#26cf71] hover:text-[#1eb863] font-medium py-1"
                                >
                                    View all notifications
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
