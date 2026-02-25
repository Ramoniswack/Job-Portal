'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { User } from './DashboardLayout';
import ManageProfileModal from '@/app/components/ManageProfileModal';
import NotificationBellWithFCM from '@/app/components/NotificationBellWithFCM';

interface TopNavbarProps {
    currentUser: User | null;
    onLogout: () => void;
    token: string;
    onProfileUpdate: (updatedUser: User) => void;
}

export default function TopNavbar({ currentUser, onLogout, token, onProfileUpdate }: TopNavbarProps) {
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

    return (
        <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 h-16">
            <div className="h-full px-6 flex items-center justify-between">
                {/* Left: Logo and Brand */}
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-3">
                        <img src="/logo.jpg" alt="Hamro Sewa" className="h-10 w-auto" />
                    </Link>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center gap-6">
                        <Link href="/" className="text-sm font-medium text-gray-600 hover:text-[#FF6B35] transition-colors">
                            Home
                        </Link>
                        <Link href="/dashboard" className="text-sm font-medium text-[#FF6B35]">
                            Dashboard
                        </Link>
                    </div>
                </div>

                {/* Right: User Info and Actions */}
                <div className="flex items-center gap-4">
                    {currentUser ? (
                        <>
                            {/* User Role Badge */}
                            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#F8F9FA] rounded-lg">
                                <span className="material-symbols-outlined text-gray-900 text-[18px]">
                                    {currentUser.role === 'worker' ? 'person' : 'business'}
                                </span>
                                <span className="text-sm font-medium text-gray-900 capitalize">
                                    {currentUser.role}
                                </span>
                            </div>

                            {/* Notification Bell */}
                            <NotificationBellWithFCM userId={currentUser.id} />

                            {/* User Menu */}
                            <div className="flex items-center gap-3 px-3 py-2 bg-[#F8F9FA] rounded-lg">
                                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-sm">
                                    {currentUser.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="hidden sm:block">
                                    <p className="text-sm font-semibold text-gray-900">{currentUser.name}</p>
                                    <p className="text-xs text-gray-500">{currentUser.email}</p>
                                </div>
                            </div>

                            {/* Settings Dropdown */}
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium"
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
                                            <span className="material-symbols-outlined text-[20px] text-gray-900">manage_accounts</span>
                                            <span className="font-medium">Manage Profile</span>
                                        </button>
                                        <div className="border-t border-gray-100 my-1"></div>
                                        <button
                                            onClick={() => {
                                                setIsDropdownOpen(false);
                                                onLogout();
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">logout</span>
                                            <span className="font-medium">Logout</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Link
                                href="/login"
                                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-[#FF6B35] transition-colors"
                            >
                                Login
                            </Link>
                            <Link
                                href="/register"
                                className="px-4 py-2 bg-[#FF6B35] hover:bg-[#FF5722] text-white rounded-lg text-sm font-medium transition-colors"
                            >
                                Sign Up
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Manage Profile Modal */}
            {currentUser && (
                <ManageProfileModal
                    isOpen={isProfileModalOpen}
                    onClose={() => setIsProfileModalOpen(false)}
                    currentUser={currentUser}
                    token={token}
                    onProfileUpdate={onProfileUpdate}
                />
            )}
        </nav>
    );
}
