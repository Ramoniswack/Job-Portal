'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import TopNavbar from './TopNavbar';
import Sidebar from './Sidebar';
import Header from './Header';
import DashboardSection from './sections/DashboardSection';
import EnhancedDashboardSection from './sections/EnhancedDashboardSection';
import BrowseJobsSection from './sections/BrowseJobsSection';
import MyApplicationsSection from './sections/MyApplicationsSection';
import MessagesSection from './sections/MessagesSection';
import ViewPostsSection from './sections/ViewPostsSection';
import AddPostSection from './sections/AddPostSection';
import PostCategoriesSection from './sections/PostCategoriesSection';
import ServicesSection from './sections/ServicesSection';
import AddServiceSection from './sections/AddServiceSection';
import ServiceCategoriesSection from './sections/ServiceCategoriesSection';
import MyServicesSection from './sections/MyServicesSection';
import MyBookingsSection from './sections/MyBookingsSection';
import AMCPackagesSection from './sections/AMCPackagesSection';
import AddAMCPackageSection from './sections/AddAMCPackageSection';
import MyAMCBookingsSection from './sections/MyAMCBookingsSection';
import { useFCMNotifications } from '@/lib/useFCMNotifications';

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
}

export interface Job {
    _id: string;
    title: string;
    description: string;
    category: string;
    location: string;
    budget: number;
    status: 'pending' | 'accepted' | 'confirmed' | 'completed';
    client: {
        _id: string;
        name: string;
        email: string;
    } | string;
    createdAt: string;
}

export interface Application {
    _id: string;
    job: Job;
    worker: {
        _id: string;
        name: string;
        email: string;
    };
    workerLocation: string;
    message: string;
    status: 'requested' | 'approved' | 'rejected';
    createdAt: string;
}

export default function DashboardLayout() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [activeSection, setActiveSection] = useState('dashboard');
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [token, setToken] = useState('');
    const [myJobs, setMyJobs] = useState<Job[]>([]);
    const [allJobs, setAllJobs] = useState<Job[]>([]);
    const [myApplications, setMyApplications] = useState<Application[]>([]);
    const [jobApplications, setJobApplications] = useState<Application[]>([]);
    const [loadingJobs, setLoadingJobs] = useState(false);
    const [loadingAllJobs, setLoadingAllJobs] = useState(false);
    const [loadingApplications, setLoadingApplications] = useState(false);
    const [editingPost, setEditingPost] = useState<any>(null);
    const [editingPackageId, setEditingPackageId] = useState<string | null>(null);

    // Initialize FCM notifications
    const { notification } = useFCMNotifications(token);

    // Handle URL parameters for navigation
    useEffect(() => {
        const section = searchParams.get('section');
        if (section) {
            setActiveSection(section);
        }
    }, [searchParams]);

    useEffect(() => {
        const storedToken = localStorage.getItem('authToken') || '';
        const storedUser = localStorage.getItem('currentUser');

        if (storedUser) {
            const user = JSON.parse(storedUser);

            // Redirect admin to admin dashboard
            if (user.role === 'admin') {
                router.push('/hamrosewa');
                return;
            }

            setCurrentUser(user);
        }
        setToken(storedToken);

        // Load initial data
        if (storedToken && storedUser) {
            loadMyJobs(storedToken);
            const user = JSON.parse(storedUser);
            if (user.role === 'worker') {
                loadMyApplications(storedToken);
            }
        }

        // Handle URL parameters for navigation from notifications
        const urlParams = new URLSearchParams(window.location.search);
        const section = urlParams.get('section');
        const jobId = urlParams.get('jobId');

        if (section) {
            console.log('Navigating to section from notification:', section);
            setActiveSection(section);

            // Clear URL parameters after navigation
            window.history.replaceState({}, '', '/dashboard');
        }
    }, [router]);

    const loadMyJobs = async (authToken: string) => {
        setLoadingJobs(true);
        try {
            const response = await fetch('http://localhost:5000/api/jobs/my-jobs', {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            const data = await response.json();
            if (data.success) {
                setMyJobs(data.data);
                // Load applications for all my jobs
                await loadJobApplications(authToken);
            }
        } catch (error) {
            console.error('Error loading jobs:', error);
        } finally {
            setLoadingJobs(false);
        }
    };

    const loadJobApplications = async (authToken: string) => {
        try {
            // Fetch all applications for the client's jobs
            const response = await fetch('http://localhost:5000/api/applications/job-applications', {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            const data = await response.json();
            if (data.success) {
                setJobApplications(data.data);
            }
        } catch (error) {
            console.error('Error loading job applications:', error);
        }
    };

    const loadAllJobs = async () => {
        setLoadingAllJobs(true);
        try {
            const response = await fetch('http://localhost:5000/api/jobs');
            const data = await response.json();
            if (data.success) {
                setAllJobs(data.data);
            }

            if (currentUser?.role === 'worker' && token) {
                await loadMyApplications(token);
            }
        } catch (error) {
            console.error('Error loading all jobs:', error);
        } finally {
            setLoadingAllJobs(false);
        }
    };

    const loadMyApplications = async (authToken: string) => {
        setLoadingApplications(true);
        try {
            const response = await fetch('http://localhost:5000/api/applications/my-applications', {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            const data = await response.json();
            if (data.success) {
                setMyApplications(data.data);
            }
        } catch (error) {
            console.error('Error loading applications:', error);
        } finally {
            setLoadingApplications(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        router.push('/login');
    };

    const handleProfileUpdate = (updatedUser: User) => {
        setCurrentUser(updatedUser);
    };

    const refreshData = () => {
        if (token) {
            loadMyJobs(token);
            if (currentUser?.role === 'worker') {
                loadMyApplications(token);
            }
        }
    };

    // Refresh data when notification is received
    useEffect(() => {
        if (notification) {
            console.log('New notification received, refreshing data...');
            refreshData();
        }
    }, [notification]);

    return (
        <div className="min-h-screen bg-[#F8F9FA]">
            {/* Top Navbar */}
            <TopNavbar
                currentUser={currentUser}
                onLogout={handleLogout}
                token={token}
                onProfileUpdate={handleProfileUpdate}
            />

            {/* Main Layout with Sidebar */}
            <div className="flex pt-16">
                <Sidebar
                    activeSection={activeSection}
                    setActiveSection={setActiveSection}
                    currentUser={currentUser}
                    onLogout={handleLogout}
                    onLoadJobs={() => loadMyJobs(token)}
                    onLoadAllJobs={loadAllJobs}
                    onLoadApplications={() => loadMyApplications(token)}
                    onLoadMessages={() => loadMyApplications(token)}
                />

                <main className="flex-1 lg:ml-64 min-h-screen w-full bg-white">
                    <div className="p-4 lg:p-8">
                        {activeSection === 'dashboard' && (
                            <EnhancedDashboardSection
                                currentUser={currentUser}
                                setActiveSection={setActiveSection}
                            />
                        )}

                        {activeSection === 'browse-jobs' && (
                            <BrowseJobsSection
                                allJobs={allJobs}
                                currentUser={currentUser}
                                token={token}
                                loadingAllJobs={loadingAllJobs}
                                onLoadAllJobs={loadAllJobs}
                                myApplications={myApplications}
                                onRefresh={refreshData}
                            />
                        )}

                        {activeSection === 'my-applications' && (
                            <MyApplicationsSection
                                myApplications={myApplications}
                                currentUser={currentUser}
                                token={token}
                                loadingApplications={loadingApplications}
                                onLoadApplications={() => loadMyApplications(token)}
                                onRefresh={refreshData}
                            />
                        )}

                        {activeSection === 'messages' && (
                            <MessagesSection
                                currentUser={currentUser}
                                token={token}
                                myApplications={myApplications}
                                onLoadApplications={() => loadMyApplications(token)}
                            />
                        )}

                        {activeSection === 'view-posts' && currentUser?.role === 'admin' && (
                            <ViewPostsSection
                                token={token}
                                onEditPost={(post) => {
                                    setEditingPost(post);
                                    setActiveSection('add-post');
                                }}
                            />
                        )}

                        {activeSection === 'add-post' && currentUser?.role === 'admin' && (
                            <AddPostSection
                                token={token}
                                editingPost={editingPost}
                                onSuccess={() => {
                                    setEditingPost(null);
                                    setActiveSection('view-posts');
                                }}
                                onCancel={() => {
                                    setEditingPost(null);
                                    setActiveSection('view-posts');
                                }}
                            />
                        )}

                        {activeSection === 'post-categories' && currentUser?.role === 'admin' && (
                            <PostCategoriesSection token={token} />
                        )}

                        {activeSection === 'services' && (
                            <ServicesSection token={token} />
                        )}

                        {activeSection === 'add-service' && (
                            <AddServiceSection token={token} />
                        )}

                        {activeSection === 'service-categories' && (
                            <ServiceCategoriesSection token={token} />
                        )}

                        {activeSection === 'my-services' && (
                            <MyServicesSection token={token} />
                        )}

                        {activeSection === 'my-bookings' && (
                            <MyBookingsSection token={token} />
                        )}

                        {activeSection === 'add-amc-package' && (
                            <AddAMCPackageSection
                                token={token}
                                editingPackageId={editingPackageId}
                                onBack={() => {
                                    setEditingPackageId(null);
                                    setActiveSection('amc-packages');
                                }}
                            />
                        )}

                        {activeSection === 'amc-packages' && (
                            <AMCPackagesSection
                                token={token}
                                currentUserId={currentUser?.id || ''}
                                onEditPackage={(packageId) => {
                                    setEditingPackageId(packageId);
                                    setActiveSection('add-amc-package');
                                }}
                            />
                        )}

                        {activeSection === 'my-amc-bookings' && (
                            <MyAMCBookingsSection token={token} />
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
