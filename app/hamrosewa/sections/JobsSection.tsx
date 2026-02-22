'use client';
import React, { useState, useEffect } from 'react';
interface User {
    _id: string;
    name: string;
    email: string;
}
interface Job {
    _id: string;
    title: string;
    description: string;
    category: string;
    location: string;
    budget: number;
    client: User;
    status: string;
    createdAt: string;
}

interface Application {
    _id: string;
    job: string;
    worker: User;
    workerLocation: string;
    phone: string;
    email: string;
    qualification: string;
    message: string;
    status: string;
    createdAt: string;
}

interface Message {
    _id: string;
    sender: User;
    receiver: User;
    content: string;
    createdAt: string;
}

interface JobsSectionProps {
    token: string;
}

export default function JobsSection({ token }: JobsSectionProps) {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [applications, setApplications] = useState<Application[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [loadingDetails, setLoadingDetails] = useState(false);

    useEffect(() => {
        if (token) {
            loadJobs();
        }
    }, [token]);

    const loadJobs = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/jobs');
            if (!response.ok) throw new Error('Failed to load jobs');

            const result = await response.json();
            // Handle both response formats
            const jobsData = result.data || result;
            setJobs(Array.isArray(jobsData) ? jobsData : []);
        } catch (error) {
            console.error('Error loading jobs:', error);
            alert('Failed to load jobs');
            setJobs([]);
        } finally {
            setLoading(false);
        }
    };

    const loadJobDetails = async (job: Job) => {
        setSelectedJob(job);
        setShowDetailsModal(true);
        setLoadingDetails(true);

        try {
            // Load applications for this job
            console.log('Loading applications for job:', job._id);
            console.log('Token exists:', !!token);
            console.log('Token preview:', token ? token.substring(0, 20) + '...' : 'NO TOKEN');

            const appsResponse = await fetch(`http://localhost:5000/api/applications/job/${job._id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Applications response status:', appsResponse.status);
            console.log('Applications response statusText:', appsResponse.statusText);

            if (appsResponse.ok) {
                const appsResult = await appsResponse.json();
                console.log('Applications result:', appsResult);

                // Handle both response formats
                const appsData = Array.isArray(appsResult) ? appsResult : (appsResult.data || []);
                console.log('Applications data:', appsData);
                console.log('Number of applications:', appsData.length);

                setApplications(appsData);

                // Load messages for approved applications
                const approvedApps = appsData.filter((app: Application) => app.status === 'approved');
                console.log('Approved applications:', approvedApps.length);

                if (approvedApps.length > 0) {
                    const allMessages: Message[] = [];
                    for (const app of approvedApps) {
                        const msgResponse = await fetch(`http://localhost:5000/api/messages/${app._id}`, {
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        if (msgResponse.ok) {
                            const msgResult = await msgResponse.json();
                            // Handle both response formats
                            const msgData = Array.isArray(msgResult) ? msgResult : (msgResult.data || []);
                            allMessages.push(...msgData);
                        }
                    }
                    setMessages(allMessages);
                }
            } else {
                console.error('Failed to load applications:', appsResponse.statusText);
            }
        } catch (error) {
            console.error('Error loading job details:', error);
            setApplications([]);
            setMessages([]);
        } finally {
            setLoadingDetails(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-700',
            accepted: 'bg-blue-100 text-blue-700',
            confirmed: 'bg-green-100 text-green-700',
            completed: 'bg-gray-100 text-gray-700',
            closed: 'bg-red-100 text-red-700',
        };
        return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-700';
    };

    const getApplicationStatusBadge = (status: string) => {
        const styles = {
            requested: 'bg-yellow-100 text-yellow-700',
            approved: 'bg-green-100 text-green-700',
            rejected: 'bg-red-100 text-red-700',
        };
        return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-700';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Jobs Management</h2>
                <p className="text-gray-600">View all jobs, applications, and messages</p>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600">Total Jobs</p>
                        <p className="text-2xl font-bold text-gray-900">{jobs.filter(j => j.client).length}</p>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4">
                        <p className="text-sm text-yellow-600">Pending</p>
                        <p className="text-2xl font-bold text-yellow-700">
                            {jobs.filter(j => j.client && j.status === 'pending').length}
                        </p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                        <p className="text-sm text-green-600">Active</p>
                        <p className="text-2xl font-bold text-green-700">
                            {jobs.filter(j => j.client && ['accepted', 'confirmed'].includes(j.status)).length}
                        </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600">Completed</p>
                        <p className="text-2xl font-bold text-gray-700">
                            {jobs.filter(j => j.client && j.status === 'completed').length}
                        </p>
                    </div>
                </div>
            </div>

            {/* Jobs Table */}
            <div className="overflow-x-auto">
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#26cf71] mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading jobs...</p>
                    </div>
                ) : jobs.filter(j => j.client).length === 0 ? (
                    <div className="p-12 text-center">
                        <span className="material-symbols-outlined text-gray-300 text-[64px]">work_off</span>
                        <p className="mt-4 text-gray-600">No jobs found</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Job Title
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Client
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Category
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Budget
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {jobs.filter(job => job.client).map((job) => (
                                <tr key={job._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="font-semibold text-gray-900">{job.title}</p>
                                        <p className="text-sm text-gray-500">{job.location}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-gray-900">{job.client.name}</p>
                                        <p className="text-sm text-gray-500">{job.client.email}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-gray-600">{job.category}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-semibold text-gray-900">NPR {job.budget}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getStatusBadge(job.status)}`}>
                                            {job.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => loadJobDetails(job)}
                                            className="px-4 py-2 bg-[#26cf71] text-white rounded-lg hover:bg-[#1eb863] transition-colors text-sm font-semibold"
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Job Details Modal */}
            {showDetailsModal && selectedJob && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">{selectedJob.title}</h3>
                                    <p className="text-gray-600 mt-1">Posted by {selectedJob.client?.name || 'Unknown'}</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowDetailsModal(false);
                                        setSelectedJob(null);
                                        setApplications([]);
                                        setMessages([]);
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <span className="material-symbols-outlined text-[28px]">close</span>
                                </button>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 space-y-6">
                            {/* Job Details */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-bold text-gray-900 mb-3">Job Details</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-600">Category</p>
                                        <p className="font-semibold text-gray-900">{selectedJob.category}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Budget</p>
                                        <p className="font-semibold text-gray-900">NPR {selectedJob.budget}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Location</p>
                                        <p className="font-semibold text-gray-900">{selectedJob.location}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Status</p>
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase ${getStatusBadge(selectedJob.status)}`}>
                                            {selectedJob.status}
                                        </span>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-gray-600 mb-1">Description</p>
                                        <p className="text-gray-900">{selectedJob.description}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Client Info */}
                            <div className="bg-blue-50 rounded-lg p-4">
                                <h4 className="font-bold text-gray-900 mb-3">Client Information</h4>
                                {selectedJob.client ? (
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-gray-600 text-[20px]">person</span>
                                            <span className="text-gray-900">{selectedJob.client.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-gray-600 text-[20px]">email</span>
                                            <span className="text-gray-900">{selectedJob.client.email}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-sm">Client information not available (user may have been deleted)</p>
                                )}
                            </div>

                            {/* Assigned Worker (for accepted/confirmed/completed jobs) */}
                            {!loadingDetails && ['accepted', 'confirmed', 'completed'].includes(selectedJob.status) && (
                                (() => {
                                    const approvedApp = applications.find(app => app.status === 'approved');
                                    if (approvedApp) {
                                        return (
                                            <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
                                                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-green-600">check_circle</span>
                                                    Assigned Worker
                                                </h4>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-full bg-[#26cf71] flex items-center justify-center text-white font-bold text-lg">
                                                        {approvedApp.worker?.name?.charAt(0).toUpperCase() || 'U'}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-bold text-gray-900 text-lg">{approvedApp.worker?.name || 'Unknown Worker'}</p>
                                                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                                            <div className="flex items-center gap-1">
                                                                <span className="material-symbols-outlined text-[16px]">email</span>
                                                                <span>{approvedApp.worker?.email || 'N/A'}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <span className="material-symbols-outlined text-[16px]">phone</span>
                                                                <span>{approvedApp.phone}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <span className="material-symbols-outlined text-[16px]">location_on</span>
                                                                <span>{approvedApp.workerLocation}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                })()
                            )}

                            {/* Applications */}
                            {loadingDetails ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#26cf71] mx-auto"></div>
                                    <p className="mt-2 text-gray-600">Loading applications...</p>
                                </div>
                            ) : (
                                <>
                                    <div>
                                        <h4 className="font-bold text-gray-900 mb-3">
                                            Applications ({applications.length})
                                        </h4>
                                        {applications.length === 0 ? (
                                            <p className="text-gray-500 text-center py-4">No applications yet</p>
                                        ) : (
                                            <div className="space-y-3">
                                                {applications.map((app) => (
                                                    <div key={app._id} className="border border-gray-200 rounded-lg p-4">
                                                        <div className="flex items-start justify-between mb-3">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <div className="w-10 h-10 rounded-full bg-[#26cf71] flex items-center justify-center text-white font-semibold">
                                                                        {app.worker?.name?.charAt(0).toUpperCase() || 'U'}
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-semibold text-gray-900">{app.worker?.name || 'Deleted User'}</p>
                                                                        <p className="text-sm text-gray-600">{app.worker?.email || 'N/A'}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getApplicationStatusBadge(app.status)}`}>
                                                                {app.status}
                                                            </span>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-3 text-sm mb-3 bg-gray-50 p-3 rounded-lg">
                                                            <div>
                                                                <p className="text-gray-600 font-semibold mb-1">Contact Phone</p>
                                                                <p className="text-gray-900">{app.phone}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-gray-600 font-semibold mb-1">Contact Email</p>
                                                                <p className="text-gray-900">{app.email}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-gray-600 font-semibold mb-1">Location</p>
                                                                <p className="text-gray-900">{app.workerLocation}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-gray-600 font-semibold mb-1">Qualification</p>
                                                                <p className="text-gray-900">{app.qualification}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-sm">
                                                            <p className="text-gray-600 font-semibold mb-1">Application Message:</p>
                                                            <p className="text-gray-700 bg-gray-50 p-2 rounded">{app.message}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Messages */}
                                    {messages.length > 0 && (
                                        <div>
                                            <h4 className="font-bold text-gray-900 mb-3">
                                                Messages ({messages.length})
                                            </h4>
                                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                                {messages.map((msg) => (
                                                    <div key={msg._id} className="bg-gray-50 rounded-lg p-3">
                                                        <div className="flex items-start justify-between mb-1">
                                                            <p className="font-semibold text-sm text-gray-900">
                                                                {msg.sender?.name || 'Unknown'}
                                                                <span className="text-gray-500 font-normal"> → {msg.receiver?.name || 'Unknown'}</span>
                                                            </p>
                                                            <p className="text-xs text-gray-500">{formatDate(msg.createdAt)}</p>
                                                        </div>
                                                        <p className="text-sm text-gray-700">{msg.content}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
