'use client';

import React, { useState, useEffect } from 'react';
import {
    Package,
    Layers,
    Grid3x3,
    Wrench,
    Users,
    CheckCircle,
    Clock,
    XCircle,
    Calendar,
    ShoppingBag,
    RefreshCw,
    TrendingUp,
    FileCheck,
    Shield
} from 'lucide-react';

interface DashboardSectionProps {
    currentUser: any;
    myJobs: any[];
    myApplications: any[];
    setActiveSection: (section: string) => void;
    onLoadJobs: () => void;
    onLoadMyJobs: () => void;
}

interface Stats {
    // Platform-wide stats
    totalServices: number;
    totalCategories: number;
    totalSubcategories: number;
    totalAMCPackages: number;

    // User's services
    myServicesCount: number;
    myServicesApplications: number;
    myServicesApproved: number;

    // User's bookings (as customer)
    myServiceBookings: number;
    myServiceBookingsPending: number;
    myServiceBookingsActive: number;

    // User's AMC
    myAMCPackages: number;
    myAMCBookings: number;
    myAMCBookingsPending: number;
    myAMCBookingsActive: number;
}

interface RecentActivity {
    id: string;
    type: 'service' | 'booking' | 'amc' | 'application';
    title: string;
    description: string;
    timestamp: Date;
    status?: string;
}

export default function ThemedDashboardSection({
    currentUser,
    myJobs,
    myApplications,
    setActiveSection,
    onLoadJobs,
    onLoadMyJobs
}: DashboardSectionProps) {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState<Stats>({
        totalServices: 0,
        totalCategories: 0,
        totalSubcategories: 0,
        totalAMCPackages: 0,
        myServicesCount: 0,
        myServicesApplications: 0,
        myServicesApproved: 0,
        myServiceBookings: 0,
        myServiceBookingsPending: 0,
        myServiceBookingsActive: 0,
        myAMCPackages: 0,
        myAMCBookings: 0,
        myAMCBookingsPending: 0,
        myAMCBookingsActive: 0
    });
    const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);

    useEffect(() => {
        loadDashboardData();
    }, [currentUser]);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('authToken') || '';

            // Fetch platform-wide statistics
            const [servicesRes, categoriesRes, amcPackagesRes] = await Promise.all([
                fetch('http://localhost:5000/api/services'),
                fetch('http://localhost:5000/api/categories'),
                fetch('http://localhost:5000/api/amc-packages')
            ]);

            const servicesData = servicesRes.ok ? await servicesRes.json() : [];
            const categoriesData = categoriesRes.ok ? await categoriesRes.json() : { data: [] };
            const amcPackagesData = amcPackagesRes.ok ? await amcPackagesRes.json() : { data: [] };

            const services = Array.isArray(servicesData) ? servicesData : [];
            const categories = categoriesData.data || [];
            const amcPackages = amcPackagesData.data || [];

            // Count subcategories (categories with parent)
            const subcategories = categories.filter((cat: any) => cat.parent);

            // Fetch user-specific data if authenticated
            let myServices: any[] = [];
            let myServiceBookings: any[] = [];
            let myAMCPackages: any[] = [];
            let myAMCBookings: any[] = [];

            if (token) {
                const [myServicesRes, myBookingsRes, myAMCPackagesRes, myAMCBookingsRes] = await Promise.all([
                    fetch('http://localhost:5000/api/services/my-services', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    fetch('http://localhost:5000/api/bookings/my-bookings', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    fetch('http://localhost:5000/api/amc-packages/my-packages', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    fetch('http://localhost:5000/api/amc-bookings/my-bookings', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    })
                ]);

                const myServicesData = myServicesRes.ok ? await myServicesRes.json() : { data: [] };
                const myBookingsData = myBookingsRes.ok ? await myBookingsRes.json() : { data: [] };
                const myAMCPackagesData = myAMCPackagesRes.ok ? await myAMCPackagesRes.json() : { data: [] };
                const myAMCBookingsData = myAMCBookingsRes.ok ? await myAMCBookingsRes.json() : { data: [] };

                myServices = myServicesData.data || [];
                myServiceBookings = myBookingsData.data || [];
                myAMCPackages = myAMCPackagesData.data || [];
                myAMCBookings = myAMCBookingsData.data || [];
            }

            // Calculate service applications (bookings for my services)
            let totalApplications = 0;
            let approvedApplications = 0;
            myServices.forEach((service: any) => {
                if (service.bookings && Array.isArray(service.bookings)) {
                    totalApplications += service.bookings.length;
                    approvedApplications += service.bookings.filter((b: any) => b.status === 'approved').length;
                }
            });

            // Calculate booking statuses
            const pendingBookings = myServiceBookings.filter((b: any) => b.status === 'pending').length;
            const activeBookings = myServiceBookings.filter((b: any) =>
                ['approved', 'confirmed', 'in-progress'].includes(b.status)
            ).length;

            const pendingAMCBookings = myAMCBookings.filter((b: any) => b.status === 'pending').length;
            const activeAMCBookings = myAMCBookings.filter((b: any) =>
                ['approved', 'completed'].includes(b.status)
            ).length;

            setStats({
                totalServices: services.length,
                totalCategories: categories.length - subcategories.length,
                totalSubcategories: subcategories.length,
                totalAMCPackages: amcPackages.length,
                myServicesCount: myServices.length,
                myServicesApplications: totalApplications,
                myServicesApproved: approvedApplications,
                myServiceBookings: myServiceBookings.length,
                myServiceBookingsPending: pendingBookings,
                myServiceBookingsActive: activeBookings,
                myAMCPackages: myAMCPackages.length,
                myAMCBookings: myAMCBookings.length,
                myAMCBookingsPending: pendingAMCBookings,
                myAMCBookingsActive: activeAMCBookings
            });

            generateRecentActivity(myServices, myServiceBookings, myAMCBookings);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateRecentActivity = (services: any[], bookings: any[], amcBookings: any[]) => {
        const activities: RecentActivity[] = [];

        // Add recent services
        services.slice(0, 2).forEach(service => {
            activities.push({
                id: service._id,
                type: 'service',
                title: 'Service Posted',
                description: service.title,
                timestamp: new Date(service.createdAt || Date.now()),
                status: service.status
            });
        });

        // Add recent bookings
        bookings.slice(0, 2).forEach(booking => {
            activities.push({
                id: booking._id,
                type: 'booking',
                title: 'Service Booking',
                description: booking.service?.title || 'Service booked',
                timestamp: new Date(booking.createdAt || Date.now()),
                status: booking.status
            });
        });

        // Add recent AMC bookings
        amcBookings.slice(0, 2).forEach(booking => {
            activities.push({
                id: booking._id,
                type: 'amc',
                title: 'AMC Booking',
                description: booking.packageTitle || 'AMC package booked',
                timestamp: new Date(booking.createdAt || Date.now()),
                status: booking.status
            });
        });

        activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        setRecentActivity(activities.slice(0, 6));
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadDashboardData();
        setRefreshing(false);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-700';
            case 'approved':
            case 'active':
            case 'confirmed':
            case 'completed':
                return 'bg-green-100 text-green-700';
            case 'rejected':
            case 'cancelled':
                return 'bg-red-100 text-red-700';
            case 'in-progress':
                return 'bg-blue-100 text-blue-700';
            default:
                return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
        }
    };

    const formatTimeAgo = (date: Date) => {
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
        return date.toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EF3F09] mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400 dark:text-gray-500">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-4 md:p-5">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-[#EF3F09] to-[#FF6B35] rounded-[20px] p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold mb-2">
                            Welcome back, {currentUser?.name}!
                        </h1>
                        <p className="text-white/90">
                            Comprehensive overview of your services, bookings, and platform statistics
                        </p>
                    </div>
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="p-3 bg-white dark:bg-gray-800/20 hover:bg-white dark:bg-gray-800/30 rounded-[16px] transition-colors"
                    >
                        <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Platform Statistics */}
            <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-3 pb-3">
                <h3 className="text-[#0C1C3C] text-lg font-bold ml-3 mb-4">Platform Statistics</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Total Services */}
                    <div
                        onClick={() => setActiveSection('services')}
                        className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-[20px] p-5 cursor-pointer hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[#0C1C3C] text-3xl font-extrabold mb-1">{stats.totalServices}</p>
                                <p className="text-gray-600 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500 text-sm font-medium">Total Services</p>
                            </div>
                            <div className="w-14 h-14 bg-[#C5E151] rounded-[22px] flex items-center justify-center">
                                <Wrench className="w-6 h-6 text-[#0C1C3C]" />
                            </div>
                        </div>
                    </div>

                    {/* Total Categories */}
                    <div
                        onClick={() => setActiveSection('service-categories')}
                        className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-[20px] p-5 cursor-pointer hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[#0C1C3C] text-3xl font-extrabold mb-1">{stats.totalCategories}</p>
                                <p className="text-gray-600 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500 text-sm font-medium">Categories</p>
                            </div>
                            <div className="w-14 h-14 bg-[#82D9D7] rounded-[22px] flex items-center justify-center">
                                <Layers className="w-6 h-6 text-[#0C1C3C]" />
                            </div>
                        </div>
                    </div>

                    {/* Total Subcategories */}
                    <div
                        onClick={() => setActiveSection('service-categories')}
                        className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-[20px] p-5 cursor-pointer hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[#0C1C3C] text-3xl font-extrabold mb-1">{stats.totalSubcategories}</p>
                                <p className="text-gray-600 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500 text-sm font-medium">Subcategories</p>
                            </div>
                            <div className="w-14 h-14 bg-[#FAAC7B] rounded-[22px] flex items-center justify-center">
                                <Grid3x3 className="w-6 h-6 text-[#0C1C3C]" />
                            </div>
                        </div>
                    </div>

                    {/* Total AMC Packages */}
                    <div
                        onClick={() => setActiveSection('amc-packages')}
                        className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-[20px] p-5 cursor-pointer hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[#0C1C3C] text-3xl font-extrabold mb-1">{stats.totalAMCPackages}</p>
                                <p className="text-gray-600 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500 text-sm font-medium">AMC Packages</p>
                            </div>
                            <div className="w-14 h-14 bg-[#A855F7] rounded-[22px] flex items-center justify-center">
                                <Package className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* My Services Section */}
            <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-3 pb-3">
                <h3 className="text-[#0C1C3C] text-lg font-bold ml-3 mb-4">My Services</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* My Services Count */}
                    <div
                        onClick={() => setActiveSection('my-services')}
                        className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-[20px] p-5 cursor-pointer hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[#0C1C3C] text-3xl font-extrabold mb-1">{stats.myServicesCount}</p>
                                <p className="text-gray-600 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500 text-sm font-medium">Services Posted</p>
                            </div>
                            <div className="w-14 h-14 bg-[#C5E151] rounded-[22px] flex items-center justify-center">
                                <Wrench className="w-6 h-6 text-[#0C1C3C]" />
                            </div>
                        </div>
                    </div>

                    {/* Applications Received */}
                    <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-[20px] p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[#0C1C3C] text-3xl font-extrabold mb-1">{stats.myServicesApplications}</p>
                                <p className="text-gray-600 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500 text-sm font-medium">Applications Received</p>
                            </div>
                            <div className="w-14 h-14 bg-[#82D9D7] rounded-[22px] flex items-center justify-center">
                                <Users className="w-6 h-6 text-[#0C1C3C]" />
                            </div>
                        </div>
                    </div>

                    {/* Approved Applications */}
                    <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-[20px] p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[#0C1C3C] text-3xl font-extrabold mb-1">{stats.myServicesApproved}</p>
                                <p className="text-gray-600 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500 text-sm font-medium">Approved</p>
                            </div>
                            <div className="w-14 h-14 bg-green-500 rounded-[22px] flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* My Bookings Section */}
            <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-3 pb-3">
                <h3 className="text-[#0C1C3C] text-lg font-bold ml-3 mb-4">My Service Bookings</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Total Bookings */}
                    <div
                        onClick={() => setActiveSection('my-bookings')}
                        className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-[20px] p-5 cursor-pointer hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[#0C1C3C] text-3xl font-extrabold mb-1">{stats.myServiceBookings}</p>
                                <p className="text-gray-600 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500 text-sm font-medium">Total Bookings</p>
                            </div>
                            <div className="w-14 h-14 bg-[#FAAC7B] rounded-[22px] flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-[#0C1C3C]" />
                            </div>
                        </div>
                    </div>

                    {/* Pending Bookings */}
                    <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-[20px] p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[#0C1C3C] text-3xl font-extrabold mb-1">{stats.myServiceBookingsPending}</p>
                                <p className="text-gray-600 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500 text-sm font-medium">Pending</p>
                            </div>
                            <div className="w-14 h-14 bg-yellow-500 rounded-[22px] flex items-center justify-center">
                                <Clock className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>

                    {/* Active Bookings */}
                    <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-[20px] p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[#0C1C3C] text-3xl font-extrabold mb-1">{stats.myServiceBookingsActive}</p>
                                <p className="text-gray-600 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500 text-sm font-medium">Active</p>
                            </div>
                            <div className="w-14 h-14 bg-green-500 rounded-[22px] flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* My AMC Section */}
            <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-3 pb-3">
                <h3 className="text-[#0C1C3C] text-lg font-bold ml-3 mb-4">My AMC Packages & Bookings</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* My AMC Packages */}
                    <div
                        onClick={() => setActiveSection('amc-packages')}
                        className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-[20px] p-5 cursor-pointer hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[#0C1C3C] text-3xl font-extrabold mb-1">{stats.myAMCPackages}</p>
                                <p className="text-gray-600 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500 text-sm font-medium">My Packages</p>
                            </div>
                            <div className="w-14 h-14 bg-[#A855F7] rounded-[22px] flex items-center justify-center">
                                <Package className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>

                    {/* My AMC Bookings */}
                    <div
                        onClick={() => setActiveSection('my-amc-bookings')}
                        className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-[20px] p-5 cursor-pointer hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[#0C1C3C] text-3xl font-extrabold mb-1">{stats.myAMCBookings}</p>
                                <p className="text-gray-600 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500 text-sm font-medium">AMC Bookings</p>
                            </div>
                            <div className="w-14 h-14 bg-[#FAAC7B] rounded-[22px] flex items-center justify-center">
                                <ShoppingBag className="w-6 h-6 text-[#0C1C3C]" />
                            </div>
                        </div>
                    </div>

                    {/* Pending AMC Bookings */}
                    <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-[20px] p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[#0C1C3C] text-3xl font-extrabold mb-1">{stats.myAMCBookingsPending}</p>
                                <p className="text-gray-600 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500 text-sm font-medium">Pending</p>
                            </div>
                            <div className="w-14 h-14 bg-yellow-500 rounded-[22px] flex items-center justify-center">
                                <Clock className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>

                    {/* Active AMC Bookings */}
                    <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-[20px] p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[#0C1C3C] text-3xl font-extrabold mb-1">{stats.myAMCBookingsActive}</p>
                                <p className="text-gray-600 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500 text-sm font-medium">Active</p>
                            </div>
                            <div className="w-14 h-14 bg-green-500 rounded-[22px] flex items-center justify-center">
                                <Shield className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-3 pb-3">
                <div className="flex items-center justify-between mb-4 px-3">
                    <h3 className="text-[#0C1C3C] text-lg font-bold">Recent Activity</h3>
                    <button
                        onClick={() => setActiveSection(currentUser?.role === 'client' ? 'my-jobs' : 'my-applications')}
                        className="text-sm text-[#FF6B35] hover:underline font-medium"
                    >
                        View All
                    </button>
                </div>
                <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-[20px] p-4 md:p-5">
                    {recentActivity.length > 0 ? (
                        <div className="space-y-3">
                            {recentActivity.map((activity) => (
                                <div
                                    key={activity.id}
                                    className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-[16px] hover:bg-gray-100 dark:bg-gray-800 transition-colors"
                                >
                                    <div className={`p-2 rounded-[16px] ${activity.type === 'job' ? 'bg-blue-100' : 'bg-purple-100'
                                        }`}>
                                        {activity.type === 'job' ? (
                                            <Briefcase className="w-5 h-5 text-blue-600" />
                                        ) : (
                                            <FileText className="w-5 h-5 text-purple-600" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="font-medium text-[#0C1C3C] truncate">{activity.title}</p>
                                            {activity.status && (
                                                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(activity.status)}`}>
                                                    {activity.status}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500 truncate">{activity.description}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{formatTimeAgo(activity.timestamp)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-600 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500">No recent activity</p>
                            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                                {currentUser?.role === 'client'
                                    ? 'Start by posting a job'
                                    : 'Start by applying to jobs'}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-3 pb-3">
                <h3 className="text-[#0C1C3C] text-lg font-bold ml-3 mb-4">Quick Actions</h3>
                <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-[20px] p-4 md:p-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button
                            onClick={() => setActiveSection('browse-jobs')}
                            className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-[16px] transition-all text-left group"
                        >
                            <div className="p-2 bg-blue-500 rounded-[16px] group-hover:scale-110 transition-transform">
                                <Eye className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="font-semibold text-[#0C1C3C]">Browse Jobs</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">Find opportunities</p>
                            </div>
                        </button>

                        <button
                            onClick={() => setActiveSection(currentUser?.role === 'client' ? 'my-jobs' : 'my-applications')}
                            className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-[16px] transition-all text-left group"
                        >
                            <div className="p-2 bg-purple-500 rounded-[16px] group-hover:scale-110 transition-transform">
                                {currentUser?.role === 'client' ? (
                                    <Briefcase className="w-5 h-5 text-white" />
                                ) : (
                                    <FileText className="w-5 h-5 text-white" />
                                )}
                            </div>
                            <div>
                                <p className="font-semibold text-[#0C1C3C]">
                                    {currentUser?.role === 'client' ? 'My Jobs' : 'My Applications'}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                                    {currentUser?.role === 'client' ? 'Manage postings' : 'Track applications'}
                                </p>
                            </div>
                        </button>

                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-[16px] transition-all text-left group disabled:opacity-50"
                        >
                            <div className="p-2 bg-green-500 rounded-[16px] group-hover:scale-110 transition-transform">
                                <RefreshCw className={`w-5 h-5 text-white ${refreshing ? 'animate-spin' : ''}`} />
                            </div>
                            <div>
                                <p className="font-semibold text-[#0C1C3C]">Refresh Data</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">Update information</p>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
