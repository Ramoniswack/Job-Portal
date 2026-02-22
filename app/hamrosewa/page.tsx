'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ServiceCategoriesSection from './sections/ServiceCategoriesSection';
import ServicesSection from './sections/ServicesSection';
import AddServiceSection from './sections/AddServiceSection';
import UsersSection from './sections/UsersSection';
import JobsSection from './sections/JobsSection';
import DashboardSection from './sections/DashboardSection';

interface User {
    _id: string;
    name: string;
    email: string;
    role: 'worker' | 'client' | 'admin';
    createdAt: string;
}

export default function AdminDashboard() {
    const router = useRouter();
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [token, setToken] = useState('');
    const [activeSection, setActiveSection] = useState('dashboard');

    useEffect(() => {
        const storedToken = localStorage.getItem('authToken') || '';
        const storedUser = localStorage.getItem('currentUser');

        if (!storedToken || !storedUser) {
            router.push('/login');
            return;
        }

        const user = JSON.parse(storedUser);

        // Check if user is admin
        if (user.role !== 'admin') {
            router.push('/dashboard');
            return;
        }

        setCurrentUser(user);
        setToken(storedToken);
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        router.push('/login');
    };

    if (!currentUser) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#26cf71] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Navbar */}
            <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 h-16">
                <div className="h-full px-6 flex items-center justify-between">
                    {/* Left: Logo and Brand */}
                    <div className="flex items-center gap-8">
                        <a href="/" className="flex items-center gap-3">
                            <img src="/logo.png" alt="Hamro Sewa" className="h-10 w-auto" />
                        </a>

                        {/* Navigation Links */}
                        <div className="hidden md:flex items-center gap-6">
                            <a href="/" className="text-sm font-medium text-gray-600 hover:text-[#26cf71] transition-colors">
                                Home
                            </a>
                            <span className="text-sm font-medium text-[#26cf71]">
                                Admin Dashboard
                            </span>
                        </div>
                    </div>

                    {/* Right: User Info and Actions */}
                    <div className="flex items-center gap-4">
                        {/* User Role Badge */}
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-purple-50 rounded-lg">
                            <span className="material-symbols-outlined text-purple-600 text-[18px]">
                                admin_panel_settings
                            </span>
                            <span className="text-sm font-medium text-purple-600 capitalize">
                                Admin
                            </span>
                        </div>

                        {/* User Menu */}
                        <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg">
                            <div className="w-8 h-8 rounded-full bg-[#26cf71] flex items-center justify-center text-white font-semibold text-sm">
                                {currentUser.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="hidden sm:block">
                                <p className="text-sm font-semibold text-gray-900">{currentUser.name}</p>
                                <p className="text-xs text-gray-500">{currentUser.email}</p>
                            </div>
                        </div>

                        {/* Logout Button */}
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm font-medium"
                        >
                            <span className="material-symbols-outlined text-[18px]">logout</span>
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Layout with Sidebar */}
            <div className="flex pt-16">
                {/* Sidebar */}
                <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-[calc(100vh-4rem)] top-16 z-40">
                    <div className="p-6 flex items-center gap-3 border-b border-gray-200">
                        <span className="material-symbols-outlined text-[#26cf71] text-[24px]">dashboard</span>
                        <h2 className="text-[#26cf71] text-lg font-bold tracking-tight">Navigation</h2>
                    </div>

                    <div className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
                        <button
                            onClick={() => setActiveSection('dashboard')}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium ${activeSection === 'dashboard'
                                ? 'bg-[#26cf71] text-white'
                                : 'text-gray-600 hover:bg-green-50 hover:text-[#26cf71]'
                                }`}
                        >
                            <span className="material-symbols-outlined text-[20px]">dashboard</span>
                            <span>Dashboard</span>
                        </button>

                        {/* Services Section */}
                        <div className="pt-4 pb-2 px-3">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Services</p>
                        </div>

                        <button
                            onClick={() => setActiveSection('add-service')}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium ${activeSection === 'add-service'
                                ? 'bg-[#26cf71] text-white'
                                : 'text-gray-600 hover:bg-green-50 hover:text-[#26cf71]'
                                }`}
                        >
                            <span className="material-symbols-outlined text-[20px]">add_circle</span>
                            <span>Add Service</span>
                        </button>

                        <button
                            onClick={() => setActiveSection('services')}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium ${activeSection === 'services'
                                ? 'bg-[#26cf71] text-white'
                                : 'text-gray-600 hover:bg-green-50 hover:text-[#26cf71]'
                                }`}
                        >
                            <span className="material-symbols-outlined text-[20px]">inventory_2</span>
                            <span>All Services</span>
                        </button>

                        <button
                            onClick={() => setActiveSection('service-categories')}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium ${activeSection === 'service-categories'
                                ? 'bg-[#26cf71] text-white'
                                : 'text-gray-600 hover:bg-green-50 hover:text-[#26cf71]'
                                }`}
                        >
                            <span className="material-symbols-outlined text-[20px]">category</span>
                            <span>Categories</span>
                        </button>

                        {/* Separator Line */}
                        <div className="my-4 border-t border-gray-200"></div>

                        <button
                            onClick={() => setActiveSection('users')}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium ${activeSection === 'users'
                                ? 'bg-[#26cf71] text-white'
                                : 'text-gray-600 hover:bg-green-50 hover:text-[#26cf71]'
                                }`}
                        >
                            <span className="material-symbols-outlined text-[20px]">group</span>
                            <span>Users</span>
                        </button>

                        <button
                            onClick={() => setActiveSection('jobs')}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium ${activeSection === 'jobs'
                                ? 'bg-[#26cf71] text-white'
                                : 'text-gray-600 hover:bg-green-50 hover:text-[#26cf71]'
                                }`}
                        >
                            <span className="material-symbols-outlined text-[20px]">work_outline</span>
                            <span>Jobs</span>
                        </button>

                        <button
                            onClick={() => setActiveSection('settings')}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium ${activeSection === 'settings'
                                ? 'bg-[#26cf71] text-white'
                                : 'text-gray-600 hover:bg-green-50 hover:text-[#26cf71]'
                                }`}
                        >
                            <span className="material-symbols-outlined text-[20px]">settings</span>
                            <span>Settings</span>
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 ml-64 min-h-screen">
                    {/* Header */}
                    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 h-16 sticky top-0 z-40 px-8 flex items-center justify-between">
                        <div className="flex-1 max-w-xl">
                            <div className="relative group">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#26cf71] transition-colors text-[20px]">search</span>
                                <input
                                    className="w-full bg-gray-50 border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-green-200 transition-all"
                                    placeholder="Search..."
                                    type="text"
                                />
                            </div>
                        </div>
                    </header>

                    {/* Content Area */}
                    <div className="p-8">
                        {/* Content based on active section */}
                        {activeSection === 'dashboard' && (
                            <DashboardSection token={token} />
                        )}

                        {activeSection === 'users' && (
                            <UsersSection token={token} />
                        )}

                        {activeSection === 'jobs' && (
                            <JobsSection token={token} />
                        )}

                        {activeSection === 'settings' && (
                            <div className="bg-white rounded-xl border border-gray-200 p-8">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Settings</h2>
                                <p className="text-gray-600">Settings content will be added here.</p>
                            </div>
                        )}

                        {activeSection === 'service-categories' && (
                            <ServiceCategoriesSection token={token} />
                        )}

                        {activeSection === 'add-service' && (
                            <AddServiceSection token={token} />
                        )}

                        {activeSection === 'services' && (
                            <ServicesSection token={token} />
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}