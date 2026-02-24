'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import ManageProfileModal from '../components/ManageProfileModal';
import ServiceCategoriesSection from './sections/ServiceCategoriesSection';
import ServicesSection from './sections/ServicesSection';
import AddServiceSection from './sections/AddServiceSection';
import UsersSection from './sections/UsersSection';
import JobsSection from './sections/JobsSection';
import DashboardSection from './sections/DashboardSection';
import AMCPackagesSection from './sections/AMCPackagesSection';
import ServicesHeroSection from './sections/ServicesHeroSection';
import ServiceBookingsSection from './sections/ServiceBookingsSection';

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
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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

    const handleProfileUpdate = (updatedUser: User) => {
        setCurrentUser(updatedUser);
    };

    const handleSectionChange = (section: string) => {
        setActiveSection(section);
        setIsMobileMenuOpen(false);
    };

    if (!currentUser) {
        return (
            <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B35] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    const menuItems = (
        <>
            <button
                onClick={() => handleSectionChange('dashboard')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium ${activeSection === 'dashboard'
                    ? 'bg-[#FF6B35] text-white'
                    : 'text-gray-600 hover:bg-[#F8F9FA] hover:text-[#FF6B35]'
                    }`}
            >
                <span className="material-symbols-outlined text-[20px]">dashboard</span>
                <span>Dashboard</span>
            </button>

            <button
                onClick={() => handleSectionChange('services-hero')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium ${activeSection === 'services-hero'
                    ? 'bg-[#FF6B35] text-white'
                    : 'text-gray-600 hover:bg-[#F8F9FA] hover:text-[#FF6B35]'
                    }`}
            >
                <span className="material-symbols-outlined text-[20px]">image</span>
                <span>Services Hero</span>
            </button>

            <button
                onClick={() => handleSectionChange('service-bookings')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium ${activeSection === 'service-bookings'
                    ? 'bg-[#FF6B35] text-white'
                    : 'text-gray-600 hover:bg-[#F8F9FA] hover:text-[#FF6B35]'
                    }`}
            >
                <span className="material-symbols-outlined text-[20px]">book_online</span>
                <span>Service Bookings</span>
            </button>

            {/* Services Section */}
            <div className="pt-4 pb-2 px-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Services</p>
            </div>

            <button
                onClick={() => handleSectionChange('add-service')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium ${activeSection === 'add-service'
                    ? 'bg-[#FF6B35] text-white'
                    : 'text-gray-600 hover:bg-[#F8F9FA] hover:text-[#FF6B35]'
                    }`}
            >
                <span className="material-symbols-outlined text-[20px]">add_circle</span>
                <span>Add Service</span>
            </button>

            <button
                onClick={() => handleSectionChange('services')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium ${activeSection === 'services'
                    ? 'bg-[#FF6B35] text-white'
                    : 'text-gray-600 hover:bg-[#F8F9FA] hover:text-[#FF6B35]'
                    }`}
            >
                <span className="material-symbols-outlined text-[20px]">inventory_2</span>
                <span>All Services</span>
            </button>

            <button
                onClick={() => handleSectionChange('service-categories')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium ${activeSection === 'service-categories'
                    ? 'bg-[#FF6B35] text-white'
                    : 'text-gray-600 hover:bg-[#F8F9FA] hover:text-[#FF6B35]'
                    }`}
            >
                <span className="material-symbols-outlined text-[20px]">category</span>
                <span>Categories</span>
            </button>

            {/* Separator Line */}
            <div className="my-4 border-t border-gray-200"></div>

            <button
                onClick={() => handleSectionChange('users')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium ${activeSection === 'users'
                    ? 'bg-[#FF6B35] text-white'
                    : 'text-gray-600 hover:bg-[#F8F9FA] hover:text-[#FF6B35]'
                    }`}
            >
                <span className="material-symbols-outlined text-[20px]">group</span>
                <span>Users</span>
            </button>

            <button
                onClick={() => handleSectionChange('jobs')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium ${activeSection === 'jobs'
                    ? 'bg-[#FF6B35] text-white'
                    : 'text-gray-600 hover:bg-[#F8F9FA] hover:text-[#FF6B35]'
                    }`}
            >
                <span className="material-symbols-outlined text-[20px]">work_outline</span>
                <span>Jobs</span>
            </button>

            <button
                onClick={() => handleSectionChange('amc-packages')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium ${activeSection === 'amc-packages'
                    ? 'bg-[#FF6B35] text-white'
                    : 'text-gray-600 hover:bg-[#F8F9FA] hover:text-[#FF6B35]'
                    }`}
            >
                <span className="material-symbols-outlined text-[20px]">inventory</span>
                <span>AMC Packages</span>
            </button>

            <button
                onClick={() => handleSectionChange('settings')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium ${activeSection === 'settings'
                    ? 'bg-[#FF6B35] text-white'
                    : 'text-gray-600 hover:bg-[#F8F9FA] hover:text-[#FF6B35]'
                    }`}
            >
                <span className="material-symbols-outlined text-[20px]">settings</span>
                <span>Settings</span>
            </button>
        </>
    );

    return (
        <div className="min-h-screen bg-[#F8F9FA]">
            {/* Top Navbar */}
            <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 h-16">
                <div className="h-full px-4 lg:px-6 flex items-center justify-between">
                    {/* Left: Logo and Brand */}
                    <div className="flex items-center gap-4 lg:gap-8">
                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="lg:hidden p-2 hover:bg-[#F1F3F5] rounded-lg transition-colors"
                        >
                            {isMobileMenuOpen ? <X className="w-6 h-6 text-gray-600" /> : <Menu className="w-6 h-6 text-gray-600" />}
                        </button>

                        <a href="/" className="flex items-center gap-3">
                            <img src="/logo.jpg" alt="Hamro Sewa" className="h-8 lg:h-10 w-auto" />
                        </a>

                        {/* Navigation Links */}
                        <div className="hidden md:flex items-center gap-6">
                            <a href="/" className="text-sm font-medium text-gray-600 hover:text-[#FF6B35] transition-colors">
                                Home
                            </a>
                            <span className="text-sm font-medium text-[#FF6B35]">
                                Admin Dashboard
                            </span>
                        </div>
                    </div>

                    {/* Right: User Info and Actions */}
                    <div className="flex items-center gap-2 lg:gap-4">
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
                        <div className="flex items-center gap-2 lg:gap-3 px-2 lg:px-3 py-2 bg-[#F8F9FA] rounded-lg">
                            <div className="w-8 h-8 rounded-full bg-[#FF6B35] flex items-center justify-center text-white font-semibold text-sm">
                                {currentUser.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="hidden md:block">
                                <p className="text-sm font-semibold text-gray-900">{currentUser.name}</p>
                                <p className="text-xs text-gray-500">{currentUser.email}</p>
                            </div>
                        </div>

                        {/* Settings Dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center gap-2 px-3 lg:px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium"
                            >
                                <span className="material-symbols-outlined text-[18px]">settings</span>
                                <span className="hidden sm:inline">Settings</span>
                            </button>

                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                                    <button
                                        onClick={() => {
                                            setIsDropdownOpen(false);
                                            setIsProfileModalOpen(true);
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[20px] text-[#FF6B35]">manage_accounts</span>
                                        <span className="font-medium">Manage Profile</span>
                                    </button>
                                    <div className="border-t border-gray-100 my-1"></div>
                                    <button
                                        onClick={() => {
                                            setIsDropdownOpen(false);
                                            handleLogout();
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">logout</span>
                                        <span className="font-medium">Logout</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Layout with Sidebar */}
            <div className="flex pt-16">
                {/* Mobile Overlay */}
                {isMobileMenuOpen && (
                    <div
                        className="lg:hidden fixed inset-0 bg-black/50 z-40 top-16"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                )}

                {/* Desktop Sidebar */}
                <aside className="hidden lg:flex w-64 bg-white border-r border-gray-200 flex-col fixed h-[calc(100vh-4rem)] top-16 z-40">
                    <div className="p-6 flex items-center gap-3 border-b border-gray-200">
                        <span className="material-symbols-outlined text-[#FF6B35] text-[24px]">dashboard</span>
                        <h2 className="text-[#FF6B35] text-lg font-bold tracking-tight">Navigation</h2>
                    </div>

                    <div className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
                        {menuItems}
                    </div>
                </aside>

                {/* Mobile Sidebar */}
                <aside
                    className={`lg:hidden fixed top-16 left-0 w-64 bg-white border-r border-gray-200 flex flex-col h-[calc(100vh-4rem)] z-50 transform transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                        }`}
                >
                    <div className="p-6 flex items-center gap-3 border-b border-gray-200">
                        <span className="material-symbols-outlined text-[#FF6B35] text-[24px]">dashboard</span>
                        <h2 className="text-[#FF6B35] text-lg font-bold tracking-tight">Navigation</h2>
                    </div>

                    <div className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
                        {menuItems}
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 lg:ml-64 min-h-screen w-full">
                    {/* Header */}
                    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 h-auto lg:h-16 sticky top-0 z-40 px-4 lg:px-8 py-3 lg:py-0 flex items-center justify-between">
                        <div className="flex-1 max-w-full lg:max-w-xl">
                            <div className="relative group">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#FF6B35] transition-colors text-[20px]">search</span>
                                <input
                                    className="w-full bg-[#F8F9FA] border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-green-200 transition-all"
                                    placeholder="Search..."
                                    type="text"
                                />
                            </div>
                        </div>
                    </header>

                    {/* Content Area */}
                    <div className="p-4 lg:p-8">
                        {/* Content based on active section */}
                        {activeSection === 'dashboard' && (
                            <DashboardSection token={token} />
                        )}

                        {activeSection === 'services-hero' && (
                            <ServicesHeroSection token={token} />
                        )}

                        {activeSection === 'service-bookings' && (
                            <ServiceBookingsSection token={token} />
                        )}

                        {activeSection === 'users' && (
                            <UsersSection token={token} />
                        )}

                        {activeSection === 'jobs' && (
                            <JobsSection token={token} />
                        )}

                        {activeSection === 'amc-packages' && (
                            <AMCPackagesSection token={token} />
                        )}

                        {activeSection === 'settings' && (
                            <div className="bg-white rounded-xl border border-gray-200 p-6 lg:p-8">
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

            {/* Manage Profile Modal */}
            {currentUser && (
                <ManageProfileModal
                    isOpen={isProfileModalOpen}
                    onClose={() => setIsProfileModalOpen(false)}
                    currentUser={currentUser}
                    token={token}
                    onProfileUpdate={handleProfileUpdate}
                />
            )}
        </div>
    );
}
