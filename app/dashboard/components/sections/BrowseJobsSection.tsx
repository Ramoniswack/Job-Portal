'use client';

import { useState } from 'react';
import { User, Job, Application } from '../DashboardLayout';
import ApplyJobModal from '../ApplyJobModal';

interface BrowseJobsSectionProps {
    allJobs: Job[];
    currentUser: User | null;
    token: string;
    loadingAllJobs: boolean;
    onLoadAllJobs: () => void;
    myApplications: Application[];
    onRefresh: () => void;
}

export default function BrowseJobsSection({
    allJobs,
    currentUser,
    token,
    loadingAllJobs,
    onLoadAllJobs,
    myApplications,
    onRefresh,
}: BrowseJobsSectionProps) {
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [selectedJob, setSelectedJob] = useState<{ id: string; title: string } | null>(null);
    const appliedJobIds = myApplications.map(app => app.job._id);

    const openApplyModal = (jobId: string, jobTitle: string) => {
        setSelectedJob({ id: jobId, title: jobTitle });
        setShowApplyModal(true);
    };

    const closeApplyModal = () => {
        setShowApplyModal(false);
        setSelectedJob(null);
    };

    const handleApplicationSuccess = () => {
        onRefresh();
    };

    const cancelApplication = async (jobId: string) => {
        const application = myApplications.find(app => app.job._id === jobId);
        if (!application) return;

        if (!confirm('Are you sure you want to cancel this application?')) return;

        try {
            const response = await fetch(`http://localhost:5000/api/applications/${application._id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            const data = await response.json();
            if (data.success) {
                alert('Application cancelled successfully!');
                onRefresh();
            } else {
                alert(data.message || 'Failed to cancel application');
            }
        } catch (error) {
            console.error('Error cancelling application:', error);
            alert('Error cancelling application');
        }
    };

    const getApplicationStatus = (jobId: string) => {
        const application = myApplications.find(app => app.job._id === jobId);
        if (!application) return null;

        const statusMap: Record<string, { text: string; color: string }> = {
            'requested': { text: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
            'approved': { text: 'Accepted', color: 'bg-green-100 text-green-800' },
            'rejected': { text: 'Rejected', color: 'bg-red-100 text-red-800' },
        };

        return statusMap[application.status] || { text: 'Applied', color: 'bg-green-100 text-[#26cf71]' };
    };

    return (
        <>
            <div className="p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Recommended Jobs</h2>
                        <p className="text-sm text-gray-500">Based on your skills and past activity</p>
                    </div>
                    <button
                        onClick={onLoadAllJobs}
                        disabled={loadingAllJobs}
                        className="bg-[#26cf71] text-white px-5 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition-all disabled:opacity-50"
                    >
                        {loadingAllJobs ? 'Loading...' : 'Refresh Jobs'}
                    </button>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {allJobs.map((job) => {
                        const clientId = typeof job.client === 'string' ? job.client : job.client._id;
                        const clientName = typeof job.client === 'string' ? 'Anonymous' : job.client.name;
                        const clientEmail = typeof job.client === 'string' ? '' : job.client.email;
                        const isOwnJob = currentUser && clientId === currentUser.id;
                        const hasApplied = appliedJobIds.includes(job._id);
                        const applicationStatus = getApplicationStatus(job._id);

                        return (
                            <div key={job._id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl hover:shadow-green-50 transition-all">
                                <div className="flex items-start gap-4">
                                    <div className="w-14 h-14 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <span className="material-symbols-outlined text-[#26cf71] text-[32px]">work</span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[#26cf71] text-xs font-bold uppercase tracking-widest">{clientName}</span>
                                            {clientEmail && (
                                                <>
                                                    <span className="text-gray-300">•</span>
                                                    <span className="text-gray-500 text-xs">{clientEmail}</span>
                                                </>
                                            )}
                                            <span className="text-gray-300">•</span>
                                            <span className="text-gray-500 text-xs">{new Date(job.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 hover:text-[#26cf71] transition-colors">{job.title}</h3>
                                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{job.description}</p>
                                        <div className="flex flex-wrap gap-2 mt-4">
                                            <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600">{job.category}</span>
                                            <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600">{job.location}</span>
                                            <span className="px-3 py-1 bg-green-100 rounded-full text-xs font-bold text-[#26cf71]">${job.budget}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${job.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                        job.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                            job.status === 'confirmed' ? 'bg-green-100 text-[#26cf71]' :
                                                'bg-gray-100 text-gray-800'
                                        }`}>
                                        {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                                    </span>

                                    <div>
                                        {isOwnJob ? (
                                            <span className="px-4 py-2 bg-purple-100 text-purple-800 rounded-lg text-sm font-bold">Your Job</span>
                                        ) : hasApplied && applicationStatus ? (
                                            <div className="flex items-center gap-2">
                                                <span className={`px-4 py-2 rounded-lg text-sm font-bold ${applicationStatus.color}`}>
                                                    {applicationStatus.text}
                                                </span>
                                                {applicationStatus.text === 'Pending' && (
                                                    <button
                                                        onClick={() => cancelApplication(job._id)}
                                                        className="px-3 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-xs font-bold transition-all"
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                            </div>
                                        ) : currentUser?.role === 'worker' ? (
                                            <button
                                                onClick={() => openApplyModal(job._id, job.title)}
                                                className="bg-green-100 text-[#26cf71] hover:bg-[#26cf71] hover:text-white px-6 py-2 rounded-lg text-sm font-bold transition-all"
                                            >
                                                Apply Now
                                            </button>
                                        ) : (
                                            <span className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-bold">Worker Only</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {allJobs.length === 0 && !loadingAllJobs && (
                    <div className="text-center py-12">
                        <span className="material-symbols-outlined text-gray-300 text-[64px]">work_off</span>
                        <p className="text-gray-500 mt-4">No jobs available at the moment.</p>
                    </div>
                )}
            </div>

            {/* Apply Job Modal */}
            {showApplyModal && selectedJob && currentUser && (
                <ApplyJobModal
                    jobId={selectedJob.id}
                    jobTitle={selectedJob.title}
                    token={token}
                    currentUserEmail={currentUser.email}
                    onClose={closeApplyModal}
                    onSuccess={handleApplicationSuccess}
                />
            )}
        </>
    );
}

