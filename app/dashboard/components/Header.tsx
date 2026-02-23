'use client';

import { User } from './DashboardLayout';

interface HeaderProps {
    currentUser: User | null;
    onCreateJob: () => void;
}

export default function Header({ currentUser, onCreateJob }: HeaderProps) {
    return (
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 h-auto lg:h-16 sticky top-0 z-40 px-4 lg:px-8 py-3 lg:py-0 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 lg:gap-0">
            {/* Search Bar */}
            <div className="flex-1 max-w-full lg:max-w-xl">
                <div className="relative group">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#FF6B35] transition-colors text-[20px]">search</span>
                    <input
                        className="w-full bg-[#F8F9FA] border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-green-200 transition-all"
                        placeholder="Search jobs..."
                        type="text"
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between lg:justify-end gap-3 lg:gap-4">
                {/* Role Toggle - Hidden on mobile */}
                {currentUser && (
                    <div className="hidden md:flex bg-[#F8F9FA] p-1 rounded-lg">
                        <button
                            className={`px-3 lg:px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${currentUser.role === 'worker' ? 'bg-white shadow-sm text-[#FF6B35]' : 'text-gray-500 hover:text-[#FF6B35]'
                                }`}
                        >
                            Worker
                        </button>
                        <button
                            className={`px-3 lg:px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${currentUser.role === 'client' ? 'bg-white shadow-sm text-[#FF6B35]' : 'text-gray-500 hover:text-[#FF6B35]'
                                }`}
                        >
                            Client
                        </button>
                    </div>
                )}

                <div className="hidden md:block h-6 w-[1px] bg-[#E9ECEF]"></div>

                {/* Create Job Button */}
                {currentUser && (
                    <button
                        onClick={onCreateJob}
                        className="bg-[#FF6B35] text-white px-4 lg:px-5 py-2 rounded-lg text-sm font-bold shadow-lg shadow-green-200 hover:bg-[#1fb862] transition-all flex items-center justify-center gap-2 flex-1 lg:flex-initial"
                    >
                        <span className="material-symbols-outlined text-[18px]">add</span>
                        <span className="hidden sm:inline">{currentUser.role === 'client' ? 'Post a Job' : 'Create Job'}</span>
                        <span className="sm:hidden">Post Job</span>
                    </button>
                )}
            </div>
        </header>
    );
}
