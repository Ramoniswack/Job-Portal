'use client';

import React, { useState, useEffect } from 'react';
import {
    TrendingUp,
    Package,
    FolderTree,
    Layers,
    Calendar,
    CheckCircle,
    Clock,
    XCircle,
    BarChart3
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, Sector } from 'recharts';
import { type PieSectorDataItem } from 'recharts/types/polar/Pie';

interface DashboardStats {
    totalServices: number;
    myServices: number;
    totalCategories: number;
    totalSubcategories: number;
    myBookings: number;
    pendingBookings: number;
    approvedBookings: number;
    completedBookings: number;
    myAMCBookings: number;
    pendingAMCBookings: number;
    approvedAMCBookings: number;
    completedAMCBookings: number;
    recentServices: any[];
    recentBookings: any[];
}

interface DashboardSectionProps {
    currentUser: any;
    setActiveSection: (section: string) => void;
}

export default function EnhancedDashboardSection({
    currentUser,
    setActiveSection
}: DashboardSectionProps) {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats>({
        totalServices: 0,
        myServices: 0,
        totalCategories: 0,
        totalSubcategories: 0,
        myBookings: 0,
        pendingBookings: 0,
        approvedBookings: 0,
        completedBookings: 0,
        myAMCBookings: 0,
        pendingAMCBookings: 0,
        approvedAMCBookings: 0,
        completedAMCBookings: 0,
        recentServices: [],
        recentBookings: []
    });

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('authToken');

            // Fetch all data in parallel
            const [servicesRes, categoriesRes, myServicesRes, bookingsRes, amcBookingsRes] = await Promise.all([
                fetch('http://localhost:5000/api/services'),
                fetch('http://localhost:5000/api/categories/all'),
                token ? fetch('http://localhost:5000/api/services/my-services', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }) : Promise.resolve({ ok: false }),
                token ? fetch('http://localhost:5000/api/bookings/my-bookings', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }) : Promise.resolve({ ok: false }),
                token ? fetch('http://localhost:5000/api/amc-bookings/my-bookings', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }) : Promise.resolve({ ok: false })
            ]);

            // Process services
            const servicesData = servicesRes.ok ? await servicesRes.json() : [];
            const services = Array.isArray(servicesData) ? servicesData : (servicesData.data || []);

            // Process categories - these are service categories
            const categoriesData = categoriesRes.ok ? await categoriesRes.json() : [];
            const categories = Array.isArray(categoriesData) ? categoriesData : (categoriesData.data || []);

            // Count parent categories (categories without parent field)
            const parentCategories = categories.filter((cat: any) => !cat.parent || cat.parent === null);
            // Count subcategories (categories with parent field)
            const subcategories = categories.filter((cat: any) => cat.parent && cat.parent !== null);

            // Process my services
            let myServices = [];
            if (myServicesRes.ok) {
                const myServicesData = await myServicesRes.json();
                myServices = myServicesData.success ? myServicesData.data : [];
            }

            // Process bookings
            let bookings = [];
            if (bookingsRes.ok) {
                const bookingsData = await bookingsRes.json();
                bookings = bookingsData.success ? bookingsData.data : [];
            }

            const pendingBookings = bookings.filter((b: any) => b.status === 'pending').length;
            const approvedBookings = bookings.filter((b: any) => b.status === 'approved').length;
            const completedBookings = bookings.filter((b: any) => b.status === 'completed').length;

            // Process AMC bookings
            let amcBookings = [];
            if (amcBookingsRes.ok) {
                const amcBookingsData = await amcBookingsRes.json();
                amcBookings = amcBookingsData.success ? amcBookingsData.data : [];
            }

            const pendingAMCBookings = amcBookings.filter((b: any) => b.status === 'pending').length;
            const approvedAMCBookings = amcBookings.filter((b: any) => b.status === 'approved').length;
            const completedAMCBookings = amcBookings.filter((b: any) => b.status === 'completed').length;

            setStats({
                totalServices: services.length,
                myServices: myServices.length,
                totalCategories: parentCategories.length,
                totalSubcategories: subcategories.length,
                myBookings: bookings.length,
                pendingBookings,
                approvedBookings,
                completedBookings,
                myAMCBookings: amcBookings.length,
                pendingAMCBookings,
                approvedAMCBookings,
                completedAMCBookings,
                recentServices: services.slice(0, 5),
                recentBookings: bookings.slice(0, 5)
            });
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B35] mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400 dark:text-gray-500">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
                <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">Welcome back, {currentUser?.name}!</h2>
                <p className="text-gray-600 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500">Here's what's happening with your services today.</p>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Services */}
                <div
                    onClick={() => setActiveSection('services')}
                    className="bg-white dark:bg-gray-800 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                            <Package className="w-6 h-6 text-blue-600" />
                        </div>
                        <TrendingUp className="w-5 h-5 text-green-500" />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500 mb-1">Total Services</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.totalServices}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">Available on platform</p>
                </div>

                {/* My Services */}
                <div
                    onClick={() => setActiveSection('my-services')}
                    className="bg-white dark:bg-gray-800 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors">
                            <BarChart3 className="w-6 h-6 text-purple-600" />
                        </div>
                        <TrendingUp className="w-5 h-5 text-green-500" />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500 mb-1">My Services</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.myServices}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">Services you created</p>
                </div>

                {/* Categories */}
                <div
                    onClick={() => setActiveSection('service-categories')}
                    className="bg-white dark:bg-gray-800 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-orange-50 rounded-lg group-hover:bg-orange-100 transition-colors">
                            <FolderTree className="w-6 h-6 text-orange-600" />
                        </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500 mb-1">Categories</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.totalCategories}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">Main service categories</p>
                </div>

                {/* Subcategories */}
                <div
                    onClick={() => setActiveSection('service-categories')}
                    className="bg-white dark:bg-gray-800 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors">
                            <Layers className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500 mb-1">Subcategories</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.totalSubcategories}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">Service subcategories</p>
                </div>
            </div>

            {/* Bookings Stats */}
            <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">My Bookings Overview</h3>
                    <button
                        onClick={() => setActiveSection('my-bookings')}
                        className="text-sm text-[#FF6B35] hover:text-[#FF5722] font-medium"
                    >
                        View All →
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 dark:bg-gray-900 dark:bg-gray-900 rounded-lg p-4">
                            <div className="flex items-center gap-3 mb-2">
                                <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400 dark:text-gray-500" />
                                <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">Total</p>
                            </div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.myBookings}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900 dark:bg-gray-900 rounded-lg p-4">
                            <div className="flex items-center gap-3 mb-2">
                                <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400 dark:text-gray-500" />
                                <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">Pending</p>
                            </div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.pendingBookings}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900 dark:bg-gray-900 rounded-lg p-4">
                            <div className="flex items-center gap-3 mb-2">
                                <CheckCircle className="w-5 h-5 text-gray-600 dark:text-gray-400 dark:text-gray-500" />
                                <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">Approved</p>
                            </div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.approvedBookings}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900 dark:bg-gray-900 rounded-lg p-4">
                            <div className="flex items-center gap-3 mb-2">
                                <CheckCircle className="w-5 h-5 text-gray-600 dark:text-gray-400 dark:text-gray-500" />
                                <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">Completed</p>
                            </div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.completedBookings}</p>
                        </div>
                    </div>

                    {/* Pie Chart */}
                    <div className="flex items-center justify-center">
                        {stats.myBookings > 0 ? (
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Tooltip cursor={false} />
                                    <Pie
                                        data={[
                                            { name: 'Pending', value: stats.pendingBookings || 0, fill: '#FF6B35' },
                                            { name: 'Approved', value: stats.approvedBookings || 0, fill: '#4ECDC4' },
                                            { name: 'Completed', value: stats.completedBookings || 0, fill: '#10B981' }
                                        ]}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        strokeWidth={5}
                                        dataKey="value"
                                        activeIndex={0}
                                        activeShape={({
                                            outerRadius = 0,
                                            ...props
                                        }: PieSectorDataItem) => (
                                            <Sector {...props} outerRadius={outerRadius + 10} />
                                        )}
                                    >
                                        {[
                                            { name: 'Pending', value: stats.pendingBookings || 0, fill: '#FF6B35' },
                                            { name: 'Approved', value: stats.approvedBookings || 0, fill: '#4ECDC4' },
                                            { name: 'Completed', value: stats.completedBookings || 0, fill: '#10B981' }
                                        ].map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-[250px] text-gray-400 dark:text-gray-500">
                                <div className="text-center">
                                    <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No bookings yet</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* AMC Bookings Stats */}
            <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">My AMC Bookings Overview</h3>
                    <button
                        onClick={() => setActiveSection('my-amc-bookings')}
                        className="text-sm text-[#FF6B35] hover:text-[#FF5722] font-medium"
                    >
                        View All →
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 dark:bg-gray-900 dark:bg-gray-900 rounded-lg p-4">
                            <div className="flex items-center gap-3 mb-2">
                                <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400 dark:text-gray-500" />
                                <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">Total</p>
                            </div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.myAMCBookings}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900 dark:bg-gray-900 rounded-lg p-4">
                            <div className="flex items-center gap-3 mb-2">
                                <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400 dark:text-gray-500" />
                                <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">Pending</p>
                            </div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.pendingAMCBookings}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900 dark:bg-gray-900 rounded-lg p-4">
                            <div className="flex items-center gap-3 mb-2">
                                <CheckCircle className="w-5 h-5 text-gray-600 dark:text-gray-400 dark:text-gray-500" />
                                <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">Approved</p>
                            </div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.approvedAMCBookings}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900 dark:bg-gray-900 rounded-lg p-4">
                            <div className="flex items-center gap-3 mb-2">
                                <CheckCircle className="w-5 h-5 text-gray-600 dark:text-gray-400 dark:text-gray-500" />
                                <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">Completed</p>
                            </div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.completedAMCBookings}</p>
                        </div>
                    </div>

                    {/* Pie Chart */}
                    <div className="flex items-center justify-center">
                        {stats.myAMCBookings > 0 ? (
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Tooltip cursor={false} />
                                    <Pie
                                        data={[
                                            { name: 'Pending', value: stats.pendingAMCBookings || 0, fill: '#FF6B35' },
                                            { name: 'Approved', value: stats.approvedAMCBookings || 0, fill: '#4ECDC4' },
                                            { name: 'Completed', value: stats.completedAMCBookings || 0, fill: '#10B981' }
                                        ]}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        strokeWidth={5}
                                        dataKey="value"
                                        activeIndex={0}
                                        activeShape={({
                                            outerRadius = 0,
                                            ...props
                                        }: PieSectorDataItem) => (
                                            <Sector {...props} outerRadius={outerRadius + 10} />
                                        )}
                                    >
                                        {[
                                            { name: 'Pending', value: stats.pendingAMCBookings || 0, fill: '#FF6B35' },
                                            { name: 'Approved', value: stats.approvedAMCBookings || 0, fill: '#4ECDC4' },
                                            { name: 'Completed', value: stats.completedAMCBookings || 0, fill: '#10B981' }
                                        ].map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-[250px] text-gray-400 dark:text-gray-500">
                                <div className="text-center">
                                    <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No AMC bookings yet</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                        onClick={() => setActiveSection('add-service')}
                        className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:bg-gray-800 rounded-lg transition-colors text-left"
                    >
                        <span className="material-symbols-outlined text-gray-600 dark:text-gray-400 dark:text-gray-500 text-[32px]">add_circle</span>
                        <div>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">Add New Service</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">Create a service offering</p>
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveSection('services')}
                        className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:bg-gray-800 rounded-lg transition-colors text-left"
                    >
                        <span className="material-symbols-outlined text-gray-600 dark:text-gray-400 dark:text-gray-500 text-[32px]">inventory_2</span>
                        <div>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">Browse Services</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">Explore all services</p>
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveSection('my-bookings')}
                        className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:bg-gray-800 rounded-lg transition-colors text-left"
                    >
                        <span className="material-symbols-outlined text-gray-600 dark:text-gray-400 dark:text-gray-500 text-[32px]">calendar_month</span>
                        <div>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">My Bookings</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">View your bookings</p>
                        </div>
                    </button>
                </div>
            </div>

            {/* Recent Activity */}
            {stats.recentServices.length > 0 && (
                <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Recent Services</h3>
                        <button
                            onClick={() => setActiveSection('services')}
                            className="text-sm text-[#FF6B35] hover:text-[#FF5722] font-medium"
                        >
                            View All →
                        </button>
                    </div>
                    <div className="space-y-3">
                        {stats.recentServices.map((service: any) => (
                            <div key={service._id} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:bg-gray-800 transition-colors">
                                {service.images && service.images[0] && (
                                    <img
                                        src={service.images[0].url}
                                        alt={service.title}
                                        className="w-12 h-12 rounded-lg object-cover"
                                    />
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{service.title}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-500">{service.priceLabel}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${service.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                                    }`}>
                                    {service.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
