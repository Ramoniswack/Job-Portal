'use client';

import React, { useState, useEffect } from 'react';

interface DashboardStats {
    totalUsers: number;
    totalJobs: number;
    totalServices: number;
    totalCategories: number;
    usersByRole: {
        admin: number;
        worker: number;
        client: number;
    };
    jobsByStatus: {
        pending: number;
        accepted: number;
        confirmed: number;
        completed: number;
    };
}

interface DashboardSectionProps {
    token: string;
}

export default function DashboardSection({ token }: DashboardSectionProps) {
    const [stats, setStats] = useState<DashboardStats>({
        totalUsers: 0,
        totalJobs: 0,
        totalServices: 0,
        totalCategories: 0,
        usersByRole: { admin: 0, worker: 0, client: 0 },
        jobsByStatus: { pending: 0, accepted: 0, confirmed: 0, completed: 0 }
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            loadStats();
        }
    }, [token]);

    const loadStats = async () => {
        setLoading(true);
        try {
            // Fetch all data in parallel
            const [usersRes, jobsRes, servicesRes, categoriesRes] = await Promise.all([
                fetch('http://localhost:5000/api/users', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch('http://localhost:5000/api/jobs'),
                fetch('http://localhost:5000/api/services'),
                fetch('http://localhost:5000/api/categories/all')
            ]);

            // Check for authentication errors
            if (usersRes.status === 401) {
                alert('Your session has expired. Please log out and log back in.');
                setLoading(false);
                return;
            }

            const users = usersRes.ok ? await usersRes.json() : [];
            const jobsData = jobsRes.ok ? await jobsRes.json() : { data: [] };
            const servicesData = servicesRes.ok ? await servicesRes.json() : { data: [] };
            const categories = categoriesRes.ok ? await categoriesRes.json() : [];

            // Process jobs data
            const jobs = Array.isArray(jobsData) ? jobsData : (jobsData.data || []);

            // Process services data
            const services = Array.isArray(servicesData) ? servicesData : (servicesData.data || []);

            // Calculate stats
            const usersByRole = {
                admin: users.filter((u: any) => u.role === 'admin').length,
                worker: users.filter((u: any) => u.role === 'worker').length,
                client: users.filter((u: any) => u.role === 'client').length
            };

            const jobsByStatus = {
                pending: jobs.filter((j: any) => j.status === 'pending').length,
                accepted: jobs.filter((j: any) => j.status === 'accepted').length,
                confirmed: jobs.filter((j: any) => j.status === 'confirmed').length,
                completed: jobs.filter((j: any) => j.status === 'completed').length
            };

            setStats({
                totalUsers: users.length,
                totalJobs: jobs.length,
                totalServices: services.length,
                totalCategories: categories.length,
                usersByRole,
                jobsByStatus
            });
        } catch (error) {
            console.error('Error loading dashboard stats:', error);
            alert('Failed to load dashboard data. Please try refreshing the page.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#26cf71] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Main Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Users */}
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <span className="material-symbols-outlined text-[48px] opacity-80">group</span>
                        <div className="text-right">
                            <p className="text-sm opacity-90">Total Users</p>
                            <p className="text-4xl font-bold">{stats.totalUsers}</p>
                        </div>
                    </div>
                    <div className="flex gap-4 text-sm">
                        <div>
                            <p className="opacity-75">Admins</p>
                            <p className="font-semibold">{stats.usersByRole.admin}</p>
                        </div>
                        <div>
                            <p className="opacity-75">Workers</p>
                            <p className="font-semibold">{stats.usersByRole.worker}</p>
                        </div>
                        <div>
                            <p className="opacity-75">Clients</p>
                            <p className="font-semibold">{stats.usersByRole.client}</p>
                        </div>
                    </div>
                </div>

                {/* Total Jobs */}
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between">
                        <span className="material-symbols-outlined text-[48px] opacity-80">work</span>
                        <div className="text-right">
                            <p className="text-sm opacity-90">Total Jobs</p>
                            <p className="text-4xl font-bold">{stats.totalJobs}</p>
                        </div>
                    </div>
                    <p className="mt-4 text-sm opacity-90">All job postings</p>
                </div>

                {/* Total Services */}
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between">
                        <span className="material-symbols-outlined text-[48px] opacity-80">inventory_2</span>
                        <div className="text-right">
                            <p className="text-sm opacity-90">Total Services</p>
                            <p className="text-4xl font-bold">{stats.totalServices}</p>
                        </div>
                    </div>
                    <p className="mt-4 text-sm opacity-90">Active service listings</p>
                </div>

                {/* Total Categories */}
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between">
                        <span className="material-symbols-outlined text-[48px] opacity-80">category</span>
                        <div className="text-right">
                            <p className="text-sm opacity-90">Total Categories</p>
                            <p className="text-4xl font-bold">{stats.totalCategories}</p>
                        </div>
                    </div>
                    <p className="mt-4 text-sm opacity-90">Service categories</p>
                </div>
            </div>

            {/* Detailed Stats */}
            <div className="grid grid-cols-1 gap-6">
                {/* Users Breakdown */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-600">group</span>
                        Users Breakdown
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                            <span className="text-gray-700 font-medium">Administrators</span>
                            <span className="text-2xl font-bold text-purple-600">{stats.usersByRole.admin}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                            <span className="text-gray-700 font-medium">Service Workers</span>
                            <span className="text-2xl font-bold text-blue-600">{stats.usersByRole.worker}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                            <span className="text-gray-700 font-medium">Clients</span>
                            <span className="text-2xl font-bold text-green-600">{stats.usersByRole.client}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
