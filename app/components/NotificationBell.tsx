'use client';

import { useState, useEffect } from 'react';
import { Bell, Check, X, Trash2 } from 'lucide-react';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'success' | 'info' | 'warning' | 'error';
    read: boolean;
    timestamp: Date;
}

interface NotificationBellProps {
    userId?: string;
}

export default function NotificationBell({ userId }: NotificationBellProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        // Load notifications from localStorage or API
        loadNotifications();
    }, [userId]);

    useEffect(() => {
        // Count unread notifications
        const unread = notifications.filter(n => !n.read).length;
        setUnreadCount(unread);
    }, [notifications]);

    const loadNotifications = () => {
        // For now, load from localStorage
        // In production, fetch from API
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

    return (
        <div className="relative">
            {/* Bell Icon Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
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
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Notifications
                                </h3>
                                {unreadCount > 0 && (
                                    <p className="text-sm text-gray-500">
                                        {unreadCount} unread
                                    </p>
                                )}
                            </div>
                            {notifications.length > 0 && (
                                <div className="flex gap-2">
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={markAllAsRead}
                                            className="text-sm text-[#26cf71] hover:text-[#1eb863] font-medium"
                                        >
                                            Mark all read
                                        </button>
                                    )}
                                    <button
                                        onClick={clearAll}
                                        className="text-sm text-red-600 hover:text-red-700 font-medium"
                                    >
                                        Clear all
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Notifications List */}
                        <div className="max-h-96 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 px-4">
                                    <Bell className="w-12 h-12 text-gray-300 mb-3" />
                                    <p className="text-gray-500 text-sm">No notifications yet</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={`p-4 hover:bg-gray-50 transition-colors ${!notification.read ? 'bg-blue-50' : ''
                                                }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2 mb-1">
                                                        <h4 className="text-sm font-semibold text-gray-900 line-clamp-1">
                                                            {notification.title}
                                                        </h4>
                                                        <span className="text-xs text-gray-500 whitespace-nowrap">
                                                            {formatTime(notification.timestamp)}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                                        {notification.message}
                                                    </p>
                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className={`text-xs px-2 py-1 rounded-full border ${getTypeColor(
                                                                notification.type
                                                            )}`}
                                                        >
                                                            {notification.type}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-1">
                                                    {!notification.read && (
                                                        <button
                                                            onClick={() => markAsRead(notification.id)}
                                                            className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                                                            title="Mark as read"
                                                        >
                                                            <Check className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => deleteNotification(notification.id)}
                                                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
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
                        {notifications.length > 0 && (
                            <div className="p-3 border-t border-gray-200 bg-gray-50">
                                <button
                                    onClick={() => {
                                        setIsOpen(false);
                                        // Navigate to notifications page if you have one
                                    }}
                                    className="w-full text-sm text-center text-[#26cf71] hover:text-[#1eb863] font-medium"
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
