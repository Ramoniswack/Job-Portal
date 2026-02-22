'use client';

import { User } from './DashboardLayout';

interface HeaderProps {
    currentUser: User | null;
    onCreateJob: () => void;
}

export default function Header({ currentUser, onCreateJob }: HeaderProps) {
    return (
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 h-16 sticky top-0 z-40 px-8 flex items-center justify-between">
            <div className="flex-1 max-w-xl">
                <div className="relative group">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#26cf71] transition-colors text-[20px]">search</span>
                    <input
                        className="w-full bg-gray-50 border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-green-200 transition-all"
                        placeholder="Search for jobs, companies, or skills..."
                        type="text"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                {currentUser && (
                    <div className="flex bg-gray-50 p-1 rounded-lg">
                        <button
                            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${currentUser.role === 'worker' ? 'bg-white shadow-sm text-[#26cf71]' : 'text-gray-500 hover:text-[#26cf71]'
                                }`}
                        >
                            Worker
                        </button>
                        <button
                            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${currentUser.role === 'client' ? 'bg-white shadow-sm text-[#26cf71]' : 'text-gray-500 hover:text-[#26cf71]'
                                }`}
                        >
                            Client
                        </button>
                    </div>
                )}

                <div className="h-6 w-[1px] bg-gray-200"></div>

                {currentUser && (
                    <button
                        onClick={onCreateJob}
                        className="bg-[#26cf71] text-white px-5 py-2 rounded-lg text-sm font-bold shadow-lg shadow-green-200 hover:bg-[#1fb862] transition-all flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[18px]">add</span>
                        {currentUser.role === 'client' ? 'Post a Job' : 'Create Job'}
                    </button>
                )}
            </div>
        </header>
    );
}
