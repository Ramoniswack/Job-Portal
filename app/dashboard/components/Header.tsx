'use client';

import { User } from './DashboardLayout';

interface HeaderProps {
    currentUser: User | null;
}

export default function Header({ currentUser }: HeaderProps) {
    return (
        <header className="bg-white dark:bg-gray-800 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 h-auto lg:h-16 sticky top-0 z-40 px-4 lg:px-8 py-3 lg:py-0 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 lg:gap-0">
            {/* Search Bar */}
            <div className="flex-1 max-w-full lg:max-w-xl">
                <div className="relative group">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-[#FF6B35] transition-colors text-[20px]">search</span>
                    <input
                        className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-orange-200 transition-all"
                        placeholder="Search jobs..."
                        type="text"
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between lg:justify-end gap-3 lg:gap-4">
            </div>
        </header>
    );
}
