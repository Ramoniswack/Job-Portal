'use client';

import { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

interface NotificationProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message?: string;
    type?: 'success' | 'error' | 'warning';
    duration?: number;
}

export default function Notification({
    isOpen,
    onClose,
    title,
    message,
    type = 'success',
    duration = 3000
}: NotificationProps) {
    useEffect(() => {
        if (isOpen && duration > 0) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [isOpen, duration, onClose]);

    if (!isOpen) return null;

    const getTypeStyles = () => {
        switch (type) {
            case 'success':
                return {
                    icon: CheckCircle,
                    bgColor: 'bg-green-50',
                    borderColor: 'border-green-200',
                    iconColor: 'text-green-600',
                    textColor: 'text-green-900'
                };
            case 'error':
                return {
                    icon: XCircle,
                    bgColor: 'bg-red-50',
                    borderColor: 'border-red-200',
                    iconColor: 'text-red-600',
                    textColor: 'text-red-900'
                };
            case 'warning':
                return {
                    icon: AlertCircle,
                    bgColor: 'bg-yellow-50',
                    borderColor: 'border-yellow-200',
                    iconColor: 'text-yellow-600',
                    textColor: 'text-yellow-900'
                };
        }
    };

    const styles = getTypeStyles();
    const Icon = styles.icon;

    return (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
            <div className={`${styles.bgColor} ${styles.borderColor} border rounded-lg shadow-lg p-4 min-w-[320px] max-w-md`}>
                <div className="flex items-start gap-3">
                    <Icon className={`${styles.iconColor} flex-shrink-0 mt-0.5`} size={20} />
                    <div className="flex-1">
                        <h4 className={`${styles.textColor} font-semibold text-sm`}>
                            {title}
                        </h4>
                        {message && (
                            <p className={`${styles.textColor} text-sm mt-1 opacity-90`}>
                                {message}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className={`${styles.iconColor} hover:opacity-70 transition-opacity flex-shrink-0`}
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
