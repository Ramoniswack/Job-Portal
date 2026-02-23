'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TopNavbar from './TopNavbar';
import Sidebar from './Sidebar';
import Header from './Header';
import DashboardSection from './sections/DashboardSection';
import BrowseJobsSection from './sections/BrowseJobsSection';
import ImprovedMyJobsSection from './sections/ImprovedMyJobsSection';
import MyApplicationsSection from './sections/MyApplicationsSection';
import MessagesSection from './sections/MessagesSection';
import ViewPostsSection from './sections/ViewPostsSection';
import AddPostSection from './sections/AddPostSection';
import PostCategoriesSection from './sections/PostCategoriesSection';
import CreateJobModal from './CreateJobModal';
import { useFCMNotifications } from '@/lib/useFCMNotifications';

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'worker' | 'client' | 'admin';
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
    const [activeSection, setActiveSection] = useState('dashboard');
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [token, setToken] = useState('');
    const [myJobs, setMyJobs] = useState<Job[]>([]);
    const [allJobs, setAllJobs] = useState<Job[]>([]);
    const [myApplications, setMyApplications] = useState<Application[]>([]);
    const [jobApplications, setJobApplications] = useState<Application[]>([]);
    const [showCreateJobModal, setShowCreateJobModal] = useState(false);
    const [loadingJobs, setLoadingJobs] = useState(false);
    const [loadingAllJobs, setLoadingAllJobs] = useState(false);
    const [loadingApplications, setLoadingApplications] = useState(false);
    const [editingPost, setEditingPost] = useState<any>(null);

    // Initialize FCM notifications
    const { notification } = useFCMNotifications(token);

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
            <TopNavbar currentUser={currentUser} onLogout={handleLogout} />

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

                <main className="flex-1 lg:ml-64 min-h-screen w-full">
                    <Header
                        currentUser={currentUser}
                        onCreateJob={() => setShowCreateJobModal(true)}
                    />

                    {activeSection === 'dashboard' && (
                        <DashboardSection
                            currentUser={currentUser}
                            myJobs={myJobs}
                            myApplications={myApplications}
                            setActiveSection={setActiveSection}
                            onLoadJobs={loadAllJobs}
                            onLoadMyJobs={() => loadMyJobs(token)}
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

                    {activeSection === 'my-jobs' && (
                        <ImprovedMyJobsSection
                            myJobs={myJobs}
                            jobApplications={jobApplications}
                            token={token}
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
                </main>
            </div>

            {showCreateJobModal && (
                <CreateJobModal
                    token={token}
                    onClose={() => setShowCreateJobModal(false)}
                    onSuccess={refreshData}
                />
            )}
        </div>
    );
}
