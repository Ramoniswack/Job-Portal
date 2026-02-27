'use client';

import { User } from './DashboardLayout';

interface HeaderProps {
    currentUser: User | null;
}

export default function EnhancedHeader({ currentUser }: HeaderProps) {
    return (
        <header className="bg-white dark:bg-gray-800 dark:bg-gray-800/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-16 z-30 px-4 lg:px-8 py-4">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    {/* Header content can be added here if needed */}
                </div>
            </div>
        </header>
    );
}
