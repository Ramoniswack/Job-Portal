'use client';

import React, { useState, useEffect } from 'react';

interface DashboardSectionProps {
    currentUser: any;
    myJobs: any[];
    myApplications: any[];
    setActiveSection: (section: string) => void;
    onLoadJobs: () => void;
    onLoadMyJobs: () => void;
}

export default function DashboardSection({
    currentUser,
    myJobs,
    myApplications,
    setActiveSection,
    onLoadJobs,
    onLoadMyJobs
}: DashboardSectionProps) {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalJobs: 0,
        totalServices: 0,
        myJobsCount: 0,
        myApplicationsCount: 0
    });

    useEffect(() => {
        loadStats();
    }, [myJobs, myApplications]);

    const loadStats = async () => {
        setLoading(true);
        try {
            // Fetch public data (no auth required)
            const [jobsRes, servicesRes] = await Promise.all([
                fetch('http://localhost:5000/api/jobs'),
                fetch('http://localhost:5000/api/services')
            ]);

            const jobsData = jobsRes.ok ? await jobsRes.json() : { data: [] };
            const servicesData = servicesRes.ok ? await servicesRes.json() : { data: [] };

            // Process jobs data
            const jobs = Array.isArray(jobsData) ? jobsData : (jobsData.data || []);

            // Process services data
            const services = Array.isArray(servicesData) ? servicesData : (servicesData.data || []);

            setStats({
                totalJobs: jobs.filter((j: any) => j.client).length,
                totalServices: services.length,
                myJobsCount: myJobs.length,
                myApplicationsCount: myApplications.length
            });
        } catch (error) {
            console.error('Error loading dashboard stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B35] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Main Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* My Jobs/Applications */}
                {currentUser?.role === 'client' ? (
                    <div
                        onClick={() => setActiveSection('my-jobs')}
                        className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer"
                    >
                        <div className="flex items-center justify-between">
                            <span className="material-symbols-outlined text-[48px] text-[#FF6B35]">work</span>
                            <div className="text-right">
                                <p className="text-sm text-gray-600">My Jobs</p>
                                <p className="text-4xl font-bold text-gray-900">{stats.myJobsCount}</p>
                            </div>
                        </div>
                        <p className="mt-4 text-sm text-gray-500">Jobs you've posted</p>
                    </div>
                ) : (
                    <div
                        onClick={() => setActiveSection('my-applications')}
                        className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer"
                    >
                        <div className="flex items-center justify-between">
                            <span className="material-symbols-outlined text-[48px] text-[#FF6B35]">description</span>
                            <div className="text-right">
                                <p className="text-sm text-gray-600">My Applications</p>
                                <p className="text-4xl font-bold text-gray-900">{stats.myApplicationsCount}</p>
                            </div>
                        </div>
                        <p className="mt-4 text-sm text-gray-500">Jobs you've applied to</p>
                    </div>
                )}

                {/* Total Jobs Available */}
                <div
                    onClick={() => setActiveSection('browse-jobs')}
                    className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                    <div className="flex items-center justify-between">
                        <span className="material-symbols-outlined text-[48px] text-[#FF6B35]">work_outline</span>
                        <div className="text-right">
                            <p className="text-sm text-gray-600">Available Jobs</p>
                            <p className="text-4xl font-bold text-gray-900">{stats.totalJobs}</p>
                        </div>
                    </div>
                    <p className="mt-4 text-sm text-gray-500">Browse all job postings</p>
                </div>

                {/* Total Services */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <span className="material-symbols-outlined text-[48px] text-[#FF6B35]">inventory_2</span>
                        <div className="text-right">
                            <p className="text-sm text-gray-600">Total Services</p>
                            <p className="text-4xl font-bold text-gray-900">{stats.totalServices}</p>
                        </div>
                    </div>
                    <p className="mt-4 text-sm text-gray-500">Available on platform</p>
                </div>

                {/* Quick Action */}
                <div
                    onClick={currentUser?.role === 'client' ? () => setActiveSection('my-jobs') : onLoadJobs}
                    className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <span className="material-symbols-outlined text-[48px] text-[#FF6B35] mb-2">
                                {currentUser?.role === 'client' ? 'add_circle' : 'refresh'}
                            </span>
                            <p className="text-lg font-bold text-gray-900">
                                {currentUser?.role === 'client' ? 'Post New Job' : 'Refresh Jobs'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                        onClick={() => setActiveSection('browse-jobs')}
                        className="flex items-center gap-3 p-4 bg-[#F8F9FA] hover:bg-[#F1F3F5] rounded-lg transition-colors text-left"
                    >
                        <span className="material-symbols-outlined text-[#FF6B35] text-[32px]">search</span>
                        <div>
                            <p className="font-semibold text-gray-900">Browse Jobs</p>
                            <p className="text-sm text-gray-600">Find opportunities</p>
                        </div>
                    </button>
                    <button
                        onClick={currentUser?.role === 'client' ? () => setActiveSection('my-jobs') : () => setActiveSection('my-applications')}
                        className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left"
                    >
                        <span className="material-symbols-outlined text-blue-600 text-[32px]">
                            {currentUser?.role === 'client' ? 'work' : 'description'}
                        </span>
                        <div>
                            <p className="font-semibold text-gray-900">
                                {currentUser?.role === 'client' ? 'My Jobs' : 'My Applications'}
                            </p>
                            <p className="text-sm text-gray-600">
                                {currentUser?.role === 'client' ? 'Manage your postings' : 'Track your applications'}
                            </p>
                        </div>
                    </button>
                    <button
                        onClick={onLoadMyJobs}
                        className="flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-left"
                    >
                        <span className="material-symbols-outlined text-purple-600 text-[32px]">refresh</span>
                        <div>
                            <p className="font-semibold text-gray-900">Refresh Data</p>
                            <p className="text-sm text-gray-600">Update your information</p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}
