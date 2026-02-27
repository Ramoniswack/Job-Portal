'use client';

import React, { useState, useEffect } from 'react';
import {
    Briefcase,
    FileText,
    Package,
    TrendingUp,
    Clock,
    CheckCircle,
    XCircle,
    RefreshCw,
    Eye,
    Calendar,
    Layers,
    ShoppingBag,
    Shield,
    Users,
    FolderTree
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
    totalJobs: number;

    // My Services (for service providers)
    myServicesCount: number;
    myActiveServices: number;
    myDraftServices: number;

    // Service Bookings (received by service providers)
    serviceBookingsReceived: number;
    bookingsApplied: number;
    bookingsApproved: number;
    bookingsPending: number;
    bookingsActive: number;

    // My Bookings (services I booked as customer)
    myServiceBookings: number;
    myBookingsPending: number;
    myBookingsActive: number;
    myBookingsCompleted: number;

    // AMC Packages (for providers)
    myAMCPackages: number;
    myActiveAMCPackages: number;

    // AMC Bookings (as customer)
    myAMCBookings: number;
    myAMCBookingsPending: number;
    myAMCBookingsActive: number;

    // Jobs (existing)
    myJobsCount: number;
    myApplicationsCount: number;
    pendingApplications: number;
    acceptedApplications: number;
    activeJobs: number;
}

interface RecentActivity {
    id: string;
    type: 'job' | 'application' | 'service' | 'booking' | 'amc';
    title: string;
    description: string;
    timestamp: Date;
    status?: string;
}

export default function BandungThemedDashboard({
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
        totalJobs: 0,
        myServicesCount: 0,
        myActiveServices: 0,
        myDraftServices: 0,
        serviceBookingsReceived: 0,
        bookingsApplied: 0,
        bookingsApproved: 0,
        bookingsPending: 0,
        bookingsActive: 0,
        myServiceBookings: 0,
        myBookingsPending: 0,
        myBookingsActive: 0,
        myBookingsCompleted: 0,
        myAMCPackages: 0,
        myActiveAMCPackages: 0,
        myAMCBookings: 0,
        myAMCBookingsPending: 0,
        myAMCBookingsActive: 0,
        myJobsCount: 0,
        myApplicationsCount: 0,
        pendingApplications: 0,
        acceptedApplications: 0,
        activeJobs: 0
    });
    const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);

    useEffect(() => {
        loadDashboardData();
    }, [myJobs, myApplications]);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('authToken') || '';

            // Fetch all data in parallel
            const [
                jobsRes,
                servicesRes,
                categoriesRes,
                amcPackagesRes,
                serviceBookingsRes,
                amcBookingsRes
            ] = await Promise.all([
                fetch('http://localhost:5000/api/jobs'),
                fetch('http://localhost:5000/api/services'),
                fetch('http://localhost:5000/api/categories'),
                fetch('http://localhost:5000/api/amc-packages'),
                fetch('http://localhost:5000/api/bookings', {
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                }),
                fetch('http://localhost:5000/api/amc-bookings', {
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                })
            ]);

            const jobsData = jobsRes.ok ? await jobsRes.json() : { data: [] };
            const servicesData = servicesRes.ok ? await servicesRes.json() : { data: [] };
            const categoriesData = categoriesRes.ok ? await categoriesRes.json() : { data: [] };
            const amcPackagesData = amcPackagesRes.ok ? await amcPackagesRes.json() : { data: [] };
            const serviceBookingsData = serviceBookingsRes.ok ? await serviceBookingsRes.json() : { data: [] };
            const amcBookingsData = amcBookingsRes.ok ? await amcBookingsRes.json() : { data: [] };

            const jobs = Array.isArray(jobsData) ? jobsData : (jobsData.data || []);
            const services = Array.isArray(servicesData) ? servicesData : (servicesData.data || []);
            const categories = Array.isArray(categoriesData) ? categoriesData : (categoriesData.data || []);
            const amcPackages = Array.isArray(amcPackagesData) ? amcPackagesData : (amcPackagesData.data || []);
            const serviceBookings = Array.isArray(serviceBookingsData) ? serviceBookingsData : (serviceBookingsData.data || []);
            const amcBookings = Array.isArray(amcBookingsData) ? amcBookingsData : (amcBookingsData.data || []);

            // Calculate platform-wide stats
            const totalCategories = categories.filter((c: any) => !c.parent).length;
            const totalSubcategories = categories.filter((c: any) => c.parent).length;

            // Calculate my services stats
            const myServices = services.filter((s: any) =>
                s.createdBy?._id === currentUser?.id || s.createdBy === currentUser?.id
            );
            const myActiveServices = myServices.filter((s: any) => s.status === 'active').length;
            const myDraftServices = myServices.filter((s: any) => s.status === 'draft').length;

            // Calculate service bookings received (for my services)
            const myServiceIds = myServices.map((s: any) => s._id);
            const bookingsReceived = serviceBookings.filter((b: any) =>
                myServiceIds.includes(b.service?._id || b.service)
            );
            const bookingsApplied = bookingsReceived.length;
            const bookingsApproved = bookingsReceived.filter((b: any) =>
                b.status === 'approved' || b.status === 'confirmed'
            ).length;
            const bookingsPending = bookingsReceived.filter((b: any) => b.status === 'pending').length;
            const bookingsActive = bookingsReceived.filter((b: any) =>
                b.status === 'in-progress' || b.status === 'confirmed'
            ).length;

            // Calculate my bookings (as customer)
            const myServiceBookings = serviceBookings.filter((b: any) =>
                b.customer?._id === currentUser?.id || b.customer === currentUser?.id
            );
            const myBookingsPending = myServiceBookings.filter((b: any) => b.status === 'pending').length;
            const myBookingsActive = myServiceBookings.filter((b: any) =>
                b.status === 'in-progress' || b.status === 'confirmed' || b.status === 'approved'
            ).length;
            const myBookingsCompleted = myServiceBookings.filter((b: any) => b.status === 'completed').length;

            // Calculate AMC packages stats
            const myAMCPackages = amcPackages.filter((p: any) =>
                p.createdBy?._id === currentUser?.id || p.createdBy === currentUser?.id
            );
            const myActiveAMCPackages = myAMCPackages.filter((p: any) => p.isActive).length;

            // Calculate AMC bookings (as customer)
            const myAMCBookingsData = amcBookings.filter((b: any) =>
                b.customer?._id === currentUser?.id || b.customer === currentUser?.id
            );
            const myAMCBookingsPending = myAMCBookingsData.filter((b: any) => b.status === 'pending').length;
            const myAMCBookingsActive = myAMCBookingsData.filter((b: any) =>
                b.status === 'approved' || b.status === 'completed'
            ).length;

            // Calculate job application stats
            const pendingApps = myApplications.filter(app => app.status === 'pending').length;
            const acceptedApps = myApplications.filter(app => app.status === 'accepted').length;
            const activeJobsCount = myJobs.filter(job => job.status === 'active').length;

            setStats({
                totalServices: services.length,
                totalCategories,
                totalSubcategories,
                totalAMCPackages: amcPackages.length,
                totalJobs: jobs.filter((j: any) => j.client).length,
                myServicesCount: myServices.length,
                myActiveServices,
                myDraftServices,
                serviceBookingsReceived: bookingsReceived.length,
                bookingsApplied,
                bookingsApproved,
                bookingsPending,
                bookingsActive,
                myServiceBookings: myServiceBookings.length,
                myBookingsPending,
                myBookingsActive,
                myBookingsCompleted,
                myAMCPackages: myAMCPackages.length,
                myActiveAMCPackages,
                myAMCBookings: myAMCBookingsData.length,
                myAMCBookingsPending,
                myAMCBookingsActive,
                myJobsCount: myJobs.length,
                myApplicationsCount: myApplications.length,
                pendingApplications: pendingApps,
                acceptedApplications: acceptedApps,
                activeJobs: activeJobsCount
            });

            generateRecentActivity(myServices, serviceBookings, amcBookings);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateRecentActivity = (myServices: any[], serviceBookings: any[], amcBookings: any[]) => {
        const activities: RecentActivity[] = [];

        // Add job applications
        myApplications.slice(0, 2).forEach(app => {
            activities.push({
                id: app._id,
                type: 'application',
                title: 'Job Application',
                description: `Applied for ${app.job?.title || 'a job'}`,
                timestamp: new Date(app.createdAt),
                status: app.status
            });
        });

        // Add my jobs
        myJobs.slice(0, 2).forEach(job => {
            activities.push({
                id: job._id,
                type: 'job',
                title: 'Job Posted',
                description: job.title,
                timestamp: new Date(job.createdAt),
                status: job.status
            });
        });

        // Add my services
        myServices.slice(0, 2).forEach(service => {
            activities.push({
                id: service._id,
                type: 'service',
                title: 'Service Listed',
                description: service.title,
                timestamp: new Date(service.createdAt),
                status: service.status
            });
        });

        // Add service bookings
        serviceBookings.slice(0, 2).forEach(booking => {
            activities.push({
                id: booking._id,
                type: 'booking',
                title: 'Service Booking',
                description: booking.serviceTitle || 'Service booked',
                timestamp: new Date(booking.createdAt),
                status: booking.status
            });
        });

        // Add AMC bookings
        amcBookings.slice(0, 2).forEach(booking => {
            activities.push({
                id: booking._id,
                type: 'amc',
                title: 'AMC Booking',
                description: booking.packageTitle || 'AMC package booked',
                timestamp: new Date(booking.createdAt),
                status: booking.status
            });
        });

        activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        setRecentActivity(activities.slice(0, 6));
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await onLoadMyJobs();
        await loadDashboardData();
        setRefreshing(false);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-[#FEF9C3] text-[#854D0E]';
            case 'accepted':
            case 'active':
                return 'bg-[#DCFCE7] text-[#166534]';
            case 'rejected':
            case 'closed':
                return 'bg-[#FEE2E2] text-[#991B1B]';
            default:
                return 'bg-[#F3F4F6] text-[#374151]';
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
                    <p className="mt-4 text-[#6B7280]">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-4 md:p-5">
            {/* Welcome Header */}
            <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-3 pb-3">
                <h3 className="text-[#0C1C3C] text-lg font-bold ml-3 mb-4">Welcome Back</h3>
                <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-[20px] p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold mb-2 text-[#0C1C3C]">
                                Hello, {currentUser?.name}!
                            </h1>
                            <p className="text-[#6B7280]">
                                Here's your complete platform overview
                            </p>
                        </div>
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="p-3 bg-[#F7F7F7] hover:bg-[#E5E7EB] rounded-[16px] transition-colors"
                        >
                            <RefreshCw className={`w-5 h-5 text-[#0C1C3C] ${refreshing ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Platform Overview Stats */}
            <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-3 pb-3">
                <h3 className="text-[#0C1C3C] text-lg font-bold ml-3 mb-4">Platform Overview</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-[20px] p-5 cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => setActiveSection('services')}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[#0C1C3C] text-4xl font-extrabold mb-1">{stats.totalServices}</p>
                                <p className="text-[#6B7280] text-sm font-medium">Total Services</p>
                            </div>
                            <div className="w-16 h-16 bg-[#C5E151] rounded-[22px] flex items-center justify-center">
                                <Package className="w-7 h-7 text-[#0C1C3C]" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-[20px] p-5 cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => setActiveSection('service-categories')}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[#0C1C3C] text-4xl font-extrabold mb-1">{stats.totalCategories}</p>
                                <p className="text-[#6B7280] text-sm font-medium">Categories</p>
                            </div>
                            <div className="w-16 h-16 bg-[#82D9D7] rounded-[22px] flex items-center justify-center">
                                <Layers className="w-7 h-7 text-[#0C1C3C]" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-[20px] p-5 cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => setActiveSection('service-categories')}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[#0C1C3C] text-4xl font-extrabold mb-1">{stats.totalSubcategories}</p>
                                <p className="text-[#6B7280] text-sm font-medium">Subcategories</p>
                            </div>
                            <div className="w-16 h-16 bg-[#FAAC7B] rounded-[22px] flex items-center justify-center">
                                <FolderTree className="w-7 h-7 text-[#0C1C3C]" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-[20px] p-5 cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => setActiveSection('amc-packages')}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[#0C1C3C] text-4xl font-extrabold mb-1">{stats.totalAMCPackages}</p>
                                <p className="text-[#6B7280] text-sm font-medium">AMC Packages</p>
                            </div>
                            <div className="w-16 h-16 bg-[#C5E151] rounded-[22px] flex items-center justify-center">
                                <Shield className="w-7 h-7 text-[#0C1C3C]" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* My Services Section */}
            {stats.myServicesCount > 0 && (
                <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-3 pb-3">
                    <h3 className="text-[#0C1C3C] text-lg font-bold ml-3 mb-4">My Services</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-[20px] p-5 cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => setActiveSection('my-services')}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[#0C1C3C] text-4xl font-extrabold mb-1">{stats.myServicesCount}</p>
                                    <p className="text-[#6B7280] text-sm font-medium">Total Services</p>
                                </div>
                                <div className="w-16 h-16 bg-[#DBEAFE] rounded-[22px] flex items-center justify-center">
                                    <Package className="w-7 h-7 text-[#1E40AF]" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-[20px] p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[#0C1C3C] text-4xl font-extrabold mb-1">{stats.myActiveServices}</p>
                                    <p className="text-[#22C55E] text-sm font-medium">Active</p>
                                </div>
                                <div className="w-16 h-16 bg-[#DCFCE7] rounded-[22px] flex items-center justify-center">
                                    <CheckCircle className="w-7 h-7 text-[#166534]" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-[20px] p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[#0C1C3C] text-4xl font-extrabold mb-1">{stats.myDraftServices}</p>
                                    <p className="text-[#6B7280] text-sm font-medium">Draft</p>
                                </div>
                                <div className="w-16 h-16 bg-[#F3F4F6] rounded-[22px] flex items-center justify-center">
                                    <FileText className="w-7 h-7 text-[#6B7280]" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Service Bookings Received */}
            {stats.serviceBookingsReceived > 0 && (
                <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-3 pb-3">
                    <h3 className="text-[#0C1C3C] text-lg font-bold ml-3 mb-4">Service Bookings Received</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-[20px] p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[#0C1C3C] text-4xl font-extrabold mb-1">{stats.bookingsApplied}</p>
                                    <p className="text-[#6B7280] text-sm font-medium">Total Applied</p>
                                </div>
                                <div className="w-16 h-16 bg-[#DBEAFE] rounded-[22px] flex items-center justify-center">
                                    <Users className="w-7 h-7 text-[#1E40AF]" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-[20px] p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[#0C1C3C] text-4xl font-extrabold mb-1">{stats.bookingsPending}</p>
                                    <p className="text-[#EAB308] text-sm font-medium">Pending</p>
                                </div>
                                <div className="w-16 h-16 bg-[#FEF9C3] rounded-[22px] flex items-center justify-center">
                                    <Clock className="w-7 h-7 text-[#854D0E]" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-[20px] p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[#0C1C3C] text-4xl font-extrabold mb-1">{stats.bookingsApproved}</p>
                                    <p className="text-[#22C55E] text-sm font-medium">Approved</p>
                                </div>
                                <div className="w-16 h-16 bg-[#DCFCE7] rounded-[22px] flex items-center justify-center">
                                    <CheckCircle className="w-7 h-7 text-[#166534]" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-[20px] p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[#0C1C3C] text-4xl font-extrabold mb-1">{stats.bookingsActive}</p>
                                    <p className="text-[#3B82F6] text-sm font-medium">Active</p>
                                </div>
                                <div className="w-16 h-16 bg-[#DBEAFE] rounded-[22px] flex items-center justify-center">
                                    <TrendingUp className="w-7 h-7 text-[#1E40AF]" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Recent Activity */}
            <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-3 pb-3">
                <div className="flex items-center justify-between ml-3 mr-3 mb-4">
                    <h3 className="text-[#0C1C3C] text-lg font-bold">Recent Activity</h3>
                    <button
                        onClick={() => setActiveSection(currentUser?.role === 'client' ? 'my-jobs' : 'my-applications')}
                        className="text-sm text-[#EF3F09] hover:underline font-medium"
                    >
                        View All
                    </button>
                </div>
                <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-[20px] p-5">
                    {recentActivity.length > 0 ? (
                        <div className="space-y-4">
                            {recentActivity.map((activity) => (
                                <div
                                    key={activity.id}
                                    className="flex items-start gap-4 pb-3 border-b border-[#E5E7EB] last:border-0 last:pb-0"
                                >
                                    <div className={`p-2 rounded-[16px] ${activity.type === 'job' ? 'bg-[#DBEAFE]' :
                                        activity.type === 'application' ? 'bg-[#E9D5FF]' :
                                            'bg-[#DCFCE7]'
                                        }`}>
                                        {activity.type === 'job' ? (
                                            <Briefcase className="w-5 h-5 text-[#1E40AF]" />
                                        ) : activity.type === 'application' ? (
                                            <FileText className="w-5 h-5 text-[#7C3AED]" />
                                        ) : (
                                            <Package className="w-5 h-5 text-[#166534]" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="font-semibold text-[#0C1C3C] truncate text-sm">{activity.title}</p>
                                            {activity.status && (
                                                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(activity.status)}`}>
                                                    {activity.status}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-[#6B7280] truncate">{activity.description}</p>
                                        <p className="text-xs text-[#9CA3AF] mt-1">{formatTimeAgo(activity.timestamp)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Calendar className="w-12 h-12 text-[#D1D5DB] mx-auto mb-3" />
                            <p className="text-[#6B7280]">No recent activity</p>
                            <p className="text-sm text-[#9CA3AF] mt-1">
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
                <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-[20px] p-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button
                            onClick={() => setActiveSection('browse-jobs')}
                            className="flex items-center gap-3 p-4 border border-[#DCDEDD] rounded-[16px] hover:border-[#EF3F09] transition-all text-left"
                        >
                            <div className="w-12 h-12 bg-[#DBEAFE] rounded-[16px] flex items-center justify-center flex-shrink-0">
                                <Eye className="w-6 h-6 text-[#1E40AF]" />
                            </div>
                            <div>
                                <p className="font-semibold text-[#0C1C3C] text-sm">Browse Jobs</p>
                                <p className="text-xs text-[#6B7280]">Find opportunities</p>
                            </div>
                        </button>

                        <button
                            onClick={() => setActiveSection(currentUser?.role === 'client' ? 'my-jobs' : 'my-applications')}
                            className="flex items-center gap-3 p-4 border border-[#DCDEDD] rounded-[16px] hover:border-[#EF3F09] transition-all text-left"
                        >
                            <div className="w-12 h-12 bg-[#E9D5FF] rounded-[16px] flex items-center justify-center flex-shrink-0">
                                {currentUser?.role === 'client' ? (
                                    <Briefcase className="w-6 h-6 text-[#7C3AED]" />
                                ) : (
                                    <FileText className="w-6 h-6 text-[#7C3AED]" />
                                )}
                            </div>
                            <div>
                                <p className="font-semibold text-[#0C1C3C] text-sm">
                                    {currentUser?.role === 'client' ? 'My Jobs' : 'My Applications'}
                                </p>
                                <p className="text-xs text-[#6B7280]">
                                    {currentUser?.role === 'client' ? 'Manage postings' : 'Track applications'}
                                </p>
                            </div>
                        </button>

                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="flex items-center gap-3 p-4 border border-[#DCDEDD] rounded-[16px] hover:border-[#EF3F09] transition-all text-left disabled:opacity-50"
                        >
                            <div className="w-12 h-12 bg-[#DCFCE7] rounded-[16px] flex items-center justify-center flex-shrink-0">
                                <RefreshCw className={`w-6 h-6 text-[#166534] ${refreshing ? 'animate-spin' : ''}`} />
                            </div>
                            <div>
                                <p className="font-semibold text-[#0C1C3C] text-sm">Refresh Data</p>
                                <p className="text-xs text-[#6B7280]">Update information</p>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
