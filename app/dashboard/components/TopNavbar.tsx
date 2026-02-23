'use client';

import Link from 'next/link';
import { User } from './DashboardLayout';

interface TopNavbarProps {
    currentUser: User | null;
    onLogout: () => void;
}

export default function TopNavbar({ currentUser, onLogout }: TopNavbarProps) {
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
                                <span className="material-symbols-outlined text-[#FF6B35] text-[18px]">
                                    {currentUser.role === 'worker' ? 'person' : 'business'}
                                </span>
                                <span className="text-sm font-medium text-[#FF6B35] capitalize">
                                    {currentUser.role}
                                </span>
                            </div>

                            {/* User Menu */}
                            <div className="flex items-center gap-3 px-3 py-2 bg-[#F8F9FA] rounded-lg">
                                <div className="w-8 h-8 rounded-full bg-[#FF6B35] flex items-center justify-center text-white font-semibold text-sm">
                                    {currentUser.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="hidden sm:block">
                                    <p className="text-sm font-semibold text-gray-900">{currentUser.name}</p>
                                    <p className="text-xs text-gray-500">{currentUser.email}</p>
                                </div>
                            </div>

                            {/* Logout Button */}
                            <button
                                onClick={onLogout}
                                className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm font-medium"
                            >
                                <span className="material-symbols-outlined text-[18px]">logout</span>
                                <span className="hidden sm:inline">Logout</span>
                            </button>
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
                                className="px-4 py-2 bg-[#FF6B35] hover:bg-[#1fb862] text-white rounded-lg text-sm font-medium transition-colors"
                            >
                                Sign Up
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
