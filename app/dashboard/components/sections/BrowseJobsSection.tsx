'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
    Briefcase,
    RefreshCw,
    CheckCircle,
    Clock,
    MapPin,
    DollarSign,
    Tag,
    Calendar,
    Users,
    Send,
    Lock,
    UserCircle,
    Ban,
    X,
    Mail
} from 'lucide-react';
import { User, Job, Application } from '../DashboardLayout';
import ApplyJobModal from '../ApplyJobModal';
import ConfirmDialog from '@/app/components/ConfirmDialog';

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
    const [cancelConfirm, setCancelConfirm] = useState<{ isOpen: boolean; jobId: string | null; jobTitle: string }>({
        isOpen: false,
        jobId: null,
        jobTitle: ''
    });
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

        try {
            const response = await fetch(`http://localhost:5000/api/applications/${application._id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            const data = await response.json();
            if (data.success) {
                toast.success('Application cancelled successfully!', {
                    description: 'Your application has been withdrawn.'
                });
                onRefresh();
            } else {
                toast.error('Failed to cancel application', {
                    description: data.message || 'Please try again.'
                });
            }
        } catch (error) {
            console.error('Error cancelling application:', error);
            toast.error('Error cancelling application', {
                description: 'Please check your connection and try again.'
            });
        }
    };

    const openCancelConfirm = (jobId: string, jobTitle: string) => {
        setCancelConfirm({ isOpen: true, jobId, jobTitle });
    };

    const closeCancelConfirm = () => {
        setCancelConfirm({ isOpen: false, jobId: null, jobTitle: '' });
    };

    const handleCancelConfirm = () => {
        if (cancelConfirm.jobId) {
            cancelApplication(cancelConfirm.jobId);
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
            <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Jobs</h1>
                            <p className="text-gray-600">Find your next opportunity from available job listings</p>
                        </div>
                        <button
                            onClick={onLoadAllJobs}
                            disabled={loadingAllJobs}
                            className="flex items-center gap-2 bg-[#26cf71] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#1eb863] transition-all disabled:opacity-50 shadow-lg shadow-green-200"
                        >
                            <RefreshCw className={`w-5 h-5 ${loadingAllJobs ? 'animate-spin' : ''}`} />
                            {loadingAllJobs ? 'Loading...' : 'Refresh'}
                        </button>
                    </div>

                    {/* Stats Bar */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                                    <Briefcase className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{allJobs.filter(job => job.client).length}</p>
                                    <p className="text-sm text-gray-600">Available Jobs</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                                    <CheckCircle className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{myApplications.length}</p>
                                    <p className="text-sm text-gray-600">My Applications</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                                    <Clock className="w-6 h-6 text-yellow-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {myApplications.filter(app => app.status === 'requested').length}
                                    </p>
                                    <p className="text-sm text-gray-600">Pending Review</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Jobs Grid */}
                {allJobs.filter(job => job.client).length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
                        {allJobs.filter(job => job.client).map((job) => {
                            const clientId = typeof job.client === 'string' ? job.client : job.client._id;
                            const clientName = typeof job.client === 'string' ? 'Anonymous' : job.client.name;
                            const clientEmail = typeof job.client === 'string' ? '' : job.client.email;
                            const isOwnJob = currentUser && clientId === currentUser.id;
                            const hasApplied = appliedJobIds.includes(job._id);
                            const applicationStatus = getApplicationStatus(job._id);

                            return (
                                <div
                                    key={job._id}
                                    className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group"
                                >
                                    {/* Card Header */}
                                    <div className="p-6 pb-4">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-gradient-to-br from-[#26cf71] to-[#1eb863] rounded-xl flex items-center justify-center shadow-lg shadow-green-200">
                                                    <Briefcase className="w-6 h-6 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#26cf71] transition-colors line-clamp-1">
                                                        {job.title}
                                                    </h3>
                                                    <p className="text-sm text-gray-500">{clientName}</p>
                                                    {clientEmail && (
                                                        <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                                                            <Mail className="w-3 h-3" />
                                                            {clientEmail}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${job.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                                                job.status === 'accepted' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                                                    job.status === 'confirmed' ? 'bg-green-50 text-green-700 border border-green-200' :
                                                        job.status === 'closed' ? 'bg-red-50 text-red-700 border border-red-200' :
                                                            'bg-gray-50 text-gray-700 border border-gray-200'
                                                }`}>
                                                {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                                            </span>
                                        </div>

                                        <p className="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed">
                                            {job.description}
                                        </p>

                                        <div className="flex flex-wrap gap-2 mb-4">
                                            <div className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 rounded-lg text-xs text-gray-700 border border-gray-200">
                                                <Tag className="w-3.5 h-3.5" />
                                                {job.category}
                                            </div>
                                            <div className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 rounded-lg text-xs text-gray-700 border border-gray-200">
                                                <MapPin className="w-3.5 h-3.5" />
                                                {job.location}
                                            </div>
                                            <div className="flex items-center gap-1 px-3 py-1.5 bg-green-50 rounded-lg text-xs font-bold text-[#26cf71] border border-green-200">
                                                <DollarSign className="w-3.5 h-3.5" />
                                                {job.budget}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {new Date(job.createdAt).toLocaleDateString()}
                                            </div>
                                            {job.maxApplicants && (
                                                <div className="flex items-center gap-1">
                                                    <Users className="w-3.5 h-3.5" />
                                                    <span className="font-semibold text-gray-700">{job.currentApplicants || 0}</span>
                                                    <span>/ {job.maxApplicants}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="px-6 pb-6">
                                        {isOwnJob ? (
                                            <div className="w-full py-3 bg-purple-50 text-purple-700 rounded-xl text-sm font-semibold text-center border border-purple-200 flex items-center justify-center gap-1">
                                                <UserCircle className="w-4 h-4" />
                                                Your Job Posting
                                            </div>
                                        ) : hasApplied && applicationStatus ? (
                                            <div className="flex items-center gap-2">
                                                <div className={`flex-1 py-3 rounded-xl text-sm font-semibold text-center ${applicationStatus.color} border ${applicationStatus.text === 'Pending' ? 'border-yellow-200' :
                                                    applicationStatus.text === 'Accepted' ? 'border-green-200' :
                                                        'border-red-200'
                                                    } flex items-center justify-center gap-1`}>
                                                    {applicationStatus.text === 'Pending' ? <Clock className="w-4 h-4" /> :
                                                        applicationStatus.text === 'Accepted' ? <CheckCircle className="w-4 h-4" /> :
                                                            <Ban className="w-4 h-4" />}
                                                    {applicationStatus.text}
                                                </div>
                                                {applicationStatus.text === 'Pending' && (
                                                    <button
                                                        onClick={() => openCancelConfirm(job._id, job.title)}
                                                        className="px-4 py-3 bg-red-50 text-red-700 hover:bg-red-100 rounded-xl text-sm font-semibold transition-all border border-red-200"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        ) : currentUser?.role === 'worker' ? (
                                            job.status === 'closed' ? (
                                                <div className="w-full py-3 bg-red-50 text-red-700 rounded-xl text-sm font-semibold text-center border border-red-200 flex items-center justify-center gap-1">
                                                    <Ban className="w-4 h-4" />
                                                    Position Filled
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => openApplyModal(job._id, job.title)}
                                                    className="w-full py-3 bg-gradient-to-r from-[#26cf71] to-[#1eb863] text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-green-200 transition-all flex items-center justify-center gap-2"
                                                >
                                                    <Send className="w-4 h-4" />
                                                    Apply Now
                                                </button>
                                            )
                                        ) : (
                                            <div className="w-full py-3 bg-gray-50 text-gray-600 rounded-xl text-sm font-semibold text-center border border-gray-200 flex items-center justify-center gap-1">
                                                <Lock className="w-4 h-4" />
                                                Workers Only
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Briefcase className="w-16 h-16 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No Jobs Available</h3>
                        <p className="text-gray-600">Check back later for new opportunities</p>
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

            {/* Cancel Confirmation Dialog */}
            <ConfirmDialog
                isOpen={cancelConfirm.isOpen}
                onClose={closeCancelConfirm}
                onConfirm={handleCancelConfirm}
                title="Cancel Application?"
                message={`Are you sure you want to cancel your application for "${cancelConfirm.jobTitle}"? This action cannot be undone.`}
                confirmText="Cancel Application"
                cancelText="Keep Application"
                type="warning"
            />
        </>
    );
}
