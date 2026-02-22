'use client';

import { User } from './DashboardLayout';
import Link from 'next/link';

interface SidebarProps {
    activeSection: string;
    setActiveSection: (section: string) => void;
    currentUser: User | null;
    onLogout: () => void;
    onLoadJobs: () => void;
    onLoadAllJobs: () => void;
    onLoadApplications: () => void;
    onLoadMessages: () => void;
}

export default function Sidebar({
    activeSection,
    setActiveSection,
    currentUser,
    onLogout,
    onLoadJobs,
    onLoadAllJobs,
    onLoadApplications,
    onLoadMessages,
}: SidebarProps) {
    const handleSectionChange = (section: string) => {
        setActiveSection(section);
        if (section === 'my-jobs') {
            onLoadJobs();
        } else if (section === 'browse-jobs') {
            onLoadAllJobs();
        } else if (section === 'my-applications') {
            onLoadApplications();
        } else if (section === 'messages') {
            onLoadMessages();
        }
    };

    return (
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-[calc(100vh-4rem)] top-16 z-40">
            <div className="p-6 flex items-center gap-3 border-b border-gray-200">
                <span className="material-symbols-outlined text-[#26cf71] text-[24px]">dashboard</span>
                <h2 className="text-[#26cf71] text-lg font-bold tracking-tight">Navigation</h2>
            </div>

            <div className="flex-1 px-4 py-4 space-y-2">
                <button
                    onClick={() => handleSectionChange('dashboard')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium ${activeSection === 'dashboard' ? 'bg-[#26cf71] text-white' : 'text-gray-600 hover:bg-green-50 hover:text-[#26cf71]'
                        }`}
                >
                    <span className="material-symbols-outlined text-[20px]">dashboard</span>
                    <span>Dashboard</span>
                </button>

                {currentUser?.role === 'worker' && (
                    <button
                        onClick={() => handleSectionChange('browse-jobs')}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium ${activeSection === 'browse-jobs' ? 'bg-[#26cf71] text-white' : 'text-gray-600 hover:bg-green-50 hover:text-[#26cf71]'
                            }`}
                    >
                        <span className="material-symbols-outlined text-[20px]">search</span>
                        <span>Browse Jobs</span>
                    </button>
                )}

                <button
                    onClick={() => handleSectionChange('my-jobs')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium ${activeSection === 'my-jobs' ? 'bg-[#26cf71] text-white' : 'text-gray-600 hover:bg-green-50 hover:text-[#26cf71]'
                        }`}
                >
                    <span className="material-symbols-outlined text-[20px]">work_outline</span>
                    <span>My Jobs</span>
                </button>

                {currentUser?.role === 'worker' && (
                    <button
                        onClick={() => handleSectionChange('my-applications')}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium ${activeSection === 'my-applications' ? 'bg-[#26cf71] text-white' : 'text-gray-600 hover:bg-green-50 hover:text-[#26cf71]'
                            }`}
                    >
                        <span className="material-symbols-outlined text-[20px]">description</span>
                        <span>My Applications</span>
                    </button>
                )}

                <button
                    onClick={() => handleSectionChange('messages')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium ${activeSection === 'messages' ? 'bg-[#26cf71] text-white' : 'text-gray-600 hover:bg-green-50 hover:text-[#26cf71]'
                        }`}
                >
                    <span className="material-symbols-outlined text-[20px]">chat</span>
                    <span>Messages</span>
                </button>

                {/* Posts Section - Admin Only */}
                {currentUser?.role === 'admin' && (
                    <>
                        <div className="pt-4 pb-2 px-3">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Posts</p>
                        </div>
                        <button
                            onClick={() => handleSectionChange('view-posts')}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium ${activeSection === 'view-posts' ? 'bg-[#26cf71] text-white' : 'text-gray-600 hover:bg-green-50 hover:text-[#26cf71]'
                                }`}
                        >
                            <span className="material-symbols-outlined text-[20px]">article</span>
                            <span>View Posts</span>
                        </button>
                        <button
                            onClick={() => handleSectionChange('add-post')}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium ${activeSection === 'add-post' ? 'bg-[#26cf71] text-white' : 'text-gray-600 hover:bg-green-50 hover:text-[#26cf71]'
                                }`}
                        >
                            <span className="material-symbols-outlined text-[20px]">add_circle</span>
                            <span>Add Post</span>
                        </button>
                        <button
                            onClick={() => handleSectionChange('post-categories')}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium ${activeSection === 'post-categories' ? 'bg-[#26cf71] text-white' : 'text-gray-600 hover:bg-green-50 hover:text-[#26cf71]'
                                }`}
                        >
                            <span className="material-symbols-outlined text-[20px]">category</span>
                            <span>Categories</span>
                        </button>
                    </>
                )}
            </div>
        </aside>
    );
}
