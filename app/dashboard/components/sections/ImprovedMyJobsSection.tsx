'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
    Briefcase,
    Edit2,
    Trash2,
    Tag,
    MapPin,
    DollarSign,
    Users,
    FileText
} from 'lucide-react';
import { Job, Application } from '../DashboardLayout';
import ConfirmDialog from '@/app/components/ConfirmDialog';

interface MyJobsSectionProps {
    myJobs: Job[];
    jobApplications: Application[];
    token: string;
    onRefresh: () => void;
}

export default function ImprovedMyJobsSection({ myJobs, jobApplications, token, onRefresh }: MyJobsSectionProps) {
    const [editingJobId, setEditingJobId] = useState<string | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; jobId: string | null; jobTitle: string }>({
        isOpen: false,
        jobId: null,
        jobTitle: ''
    });
    const [rejectConfirm, setRejectConfirm] = useState<{ isOpen: boolean; appId: string | null; workerName: string }>({
        isOpen: false,
        appId: null,
        workerName: ''
    });
    const [editFormData, setEditFormData] = useState({
        title: '',
        description: '',
        category: '',
        location: '',
        budget: 0,
    });

    const startEditJob = (job: Job) => {
        setEditingJobId(job._id);
        setEditFormData({
            title: job.title,
            description: job.description,
            category: job.category,
            location: job.location,
            budget: job.budget,
        });
    };

    const cancelEditJob = () => {
        setEditingJobId(null);
    };

    const updateJob = async (jobId: string) => {
        try {
            const response = await fetch(`http://localhost:5000/api/jobs/${jobId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(editFormData),
            });

            const data = await response.json();
            if (data.success) {
                toast.success('Job updated successfully!', {
                    description: 'Your job posting has been updated.'
                });
                cancelEditJob();
                onRefresh();
            } else {
                toast.error('Failed to update job', {
                    description: data.message || 'Please try again.'
                });
            }
        } catch (error) {
            console.error('Error updating job:', error);
            toast.error('Error updating job', {
                description: 'Please check your connection and try again.'
            });
        }
    };

    const deleteJob = async (jobId: string) => {
        try {
            const response = await fetch(`http://localhost:5000/api/jobs/${jobId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            const data = await response.json();
            if (data.success) {
                toast.success('Job deleted successfully!', {
                    description: 'The job posting has been removed.'
                });
                onRefresh();
            } else {
                toast.error('Failed to delete job', {
                    description: data.message || 'Please try again.'
                });
            }
        } catch (error) {
            console.error('Error deleting job:', error);
            toast.error('Error deleting job', {
                description: 'Please check your connection and try again.'
            });
        }
    };

    const openDeleteConfirm = (jobId: string, jobTitle: string) => {
        setDeleteConfirm({ isOpen: true, jobId, jobTitle });
    };

    const closeDeleteConfirm = () => {
        setDeleteConfirm({ isOpen: false, jobId: null, jobTitle: '' });
    };

    const handleDeleteConfirm = () => {
        if (deleteConfirm.jobId) {
            deleteJob(deleteConfirm.jobId);
        }
    };

    const openRejectConfirm = (appId: string, workerName: string) => {
        setRejectConfirm({ isOpen: true, appId, workerName });
    };

    const closeRejectConfirm = () => {
        setRejectConfirm({ isOpen: false, appId: null, workerName: '' });
    };

    const handleRejectConfirm = () => {
        if (rejectConfirm.appId) {
            updateApplicationStatus(rejectConfirm.appId, 'rejected');
        }
    };

    const updateJobStatus = async (jobId: string, newStatus: string) => {
        try {
            const response = await fetch(`http://localhost:5000/api/jobs/${jobId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ status: newStatus }),
            });

            const data = await response.json();
            if (data.success) {
                toast.success('Status updated!', {
                    description: `Job status changed to ${newStatus}.`
                });
                onRefresh();
            } else {
                toast.error('Failed to update status', {
                    description: data.message || 'Please try again.'
                });
            }
        } catch (error) {
            console.error('Error updating job status:', error);
            toast.error('Error updating status', {
                description: 'Please check your connection and try again.'
            });
        }
    };

    const updateApplicationStatus = async (applicationId: string, newStatus: string) => {
        try {
            const response = await fetch(`http://localhost:5000/api/applications/${applicationId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ status: newStatus }),
            });

            const data = await response.json();
            if (data.success) {
                toast.success(`Application ${newStatus}!`, {
                    description: `You have ${newStatus} this application.`
                });
                onRefresh();
            } else {
                toast.error('Failed to update application', {
                    description: data.message || 'Please try again.'
                });
            }
        } catch (error) {
            console.error('Error updating application status:', error);
            toast.error('Error updating application', {
                description: 'Please check your connection and try again.'
            });
        }
    };

    const getApplicationsForJob = (jobId: string) => {
        return jobApplications.filter(app => {
            const appJobId = typeof app.job === 'string' ? app.job : app.job._id;
            return appJobId === jobId;
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'accepted': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
            case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
            case 'closed': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="p-8">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">My Job Postings</h2>
                <p className="text-gray-600 mt-1">Manage your job listings and review applications</p>
            </div>

            {myJobs.length === 0 ? (
                <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
                    <Briefcase className="w-16 h-16 text-gray-300 mx-auto" />
                    <h3 className="text-lg font-semibold text-gray-900 mt-4">No jobs posted yet</h3>
                    <p className="text-gray-600 mt-2">Create your first job posting to find workers</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {myJobs.map((job) => {
                        const applications = getApplicationsForJob(job._id);

                        return (
                            <div key={job._id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                {/* Job Header */}
                                <div className="p-6 border-b border-gray-100">
                                    {editingJobId === job._id ? (
                                        <div className="space-y-4">
                                            <input
                                                type="text"
                                                value={editFormData.title}
                                                onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#26cf71] focus:border-transparent"
                                                placeholder="Job Title"
                                            />
                                            <textarea
                                                value={editFormData.description}
                                                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                                                rows={3}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#26cf71] focus:border-transparent"
                                                placeholder="Job Description"
                                            />
                                            <div className="grid grid-cols-3 gap-4">
                                                <input
                                                    type="text"
                                                    value={editFormData.location}
                                                    onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#26cf71] focus:border-transparent"
                                                    placeholder="Location"
                                                />
                                                <input
                                                    type="number"
                                                    value={editFormData.budget}
                                                    onChange={(e) => setEditFormData({ ...editFormData, budget: Number(e.target.value) })}
                                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#26cf71] focus:border-transparent"
                                                    placeholder="Budget"
                                                />
                                                <select
                                                    value={editFormData.category}
                                                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#26cf71] focus:border-transparent"
                                                >
                                                    <option value="Home Repairs">Home Repairs</option>
                                                    <option value="Automobile">Automobile</option>
                                                    <option value="Technology">Technology</option>
                                                    <option value="Health & Wellness">Health & Wellness</option>
                                                    <option value="Personal Care">Personal Care</option>
                                                    <option value="Professional Services">Professional Services</option>
                                                    <option value="Home Improvement">Home Improvement</option>
                                                    <option value="Professional Training">Professional Training</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => updateJob(job._id)}
                                                    className="px-6 py-2 bg-[#26cf71] text-white rounded-lg hover:bg-[#1eb863] transition font-semibold"
                                                >
                                                    Save Changes
                                                </button>
                                                <button
                                                    onClick={cancelEditJob}
                                                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-semibold"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex-1">
                                                    <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
                                                    <p className="text-gray-600 mt-2">{job.description}</p>
                                                </div>
                                                <div className="flex items-center gap-2 ml-4">
                                                    <select
                                                        value={job.status}
                                                        onChange={(e) => updateJobStatus(job._id, e.target.value)}
                                                        className={`px-3 py-1.5 text-sm font-semibold rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-[#26cf71] ${getStatusColor(job.status)}`}
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="accepted">Accepted</option>
                                                        <option value="confirmed">Confirmed</option>
                                                        <option value="completed">Completed</option>
                                                    </select>
                                                    <button
                                                        onClick={() => startEditJob(job)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                        title="Edit job"
                                                    >
                                                        <Edit2 className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => openDeleteConfirm(job._id, job.title)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                        title="Delete job"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-3">
                                                <span className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700 flex items-center gap-1">
                                                    <Tag className="w-4 h-4" />
                                                    {job.category}
                                                </span>
                                                <span className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700 flex items-center gap-1">
                                                    <MapPin className="w-4 h-4" />
                                                    {job.location}
                                                </span>
                                                <span className="px-3 py-1 bg-green-100 rounded-full text-sm font-semibold text-[#26cf71] flex items-center gap-1">
                                                    <DollarSign className="w-4 h-4" />
                                                    {job.budget}
                                                </span>
                                                {job.maxApplicants && (
                                                    <span className="px-3 py-1 bg-blue-100 rounded-full text-sm text-blue-700 flex items-center gap-1">
                                                        <Users className="w-4 h-4" />
                                                        {job.currentApplicants || 0}/{job.maxApplicants} applicants
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Applications */}
                                {applications.length > 0 && (
                                    <div className="p-6 bg-gray-50">
                                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <FileText className="w-5 h-5" />
                                            Applications ({applications.length})
                                        </h4>
                                        <div className="space-y-3">
                                            {applications.map((app) => (
                                                <div key={app._id} className="bg-white rounded-lg p-4 border border-gray-200">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <div className="w-10 h-10 rounded-full bg-[#26cf71] flex items-center justify-center text-white font-semibold">
                                                                    {app.worker?.name?.charAt(0).toUpperCase() || 'W'}
                                                                </div>
                                                                <div>
                                                                    <p className="font-semibold text-gray-900">{app.worker?.name || 'Unknown Worker'}</p>
                                                                    <p className="text-sm text-gray-600">{app.worker?.email || 'N/A'}</p>
                                                                </div>
                                                            </div>
                                                            <p className="text-sm text-gray-700 mt-2">{app.message}</p>
                                                            <div className="flex items-center gap-1 mt-2 text-xs text-gray-600">
                                                                <MapPin className="w-3.5 h-3.5" />
                                                                {app.workerLocation}
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2 ml-4">
                                                            {app.status === 'requested' && (
                                                                <>
                                                                    <button
                                                                        onClick={() => updateApplicationStatus(app._id, 'approved')}
                                                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-semibold"
                                                                    >
                                                                        Approve
                                                                    </button>
                                                                    <button
                                                                        onClick={() => openRejectConfirm(app._id, app.worker?.name || 'Unknown Worker')}
                                                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-semibold"
                                                                    >
                                                                        Reject
                                                                    </button>
                                                                </>
                                                            )}
                                                            {app.status === 'approved' && (
                                                                <span className="px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-semibold">
                                                                    ✓ Approved
                                                                </span>
                                                            )}
                                                            {app.status === 'rejected' && (
                                                                <div className="flex items-center gap-2">
                                                                    <span className="px-4 py-2 bg-red-100 text-red-800 rounded-lg text-sm font-semibold">
                                                                        ✗ Rejected
                                                                    </span>
                                                                    <button
                                                                        onClick={() => updateApplicationStatus(app._id, 'requested')}
                                                                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm font-semibold"
                                                                        title="Undo rejection and restore to pending"
                                                                    >
                                                                        Undo
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={deleteConfirm.isOpen}
                onClose={closeDeleteConfirm}
                onConfirm={handleDeleteConfirm}
                title="Delete Job?"
                message={`Are you sure you want to delete "${deleteConfirm.jobTitle}"? This will also delete all applications. This action cannot be undone.`}
                confirmText="Delete Job"
                cancelText="Cancel"
                type="danger"
            />

            {/* Reject Confirmation Dialog */}
            <ConfirmDialog
                isOpen={rejectConfirm.isOpen}
                onClose={closeRejectConfirm}
                onConfirm={handleRejectConfirm}
                title="Reject Application?"
                message={`Are you sure you want to reject the application from "${rejectConfirm.workerName}"? This action cannot be undone.`}
                confirmText="Reject Application"
                cancelText="Cancel"
                type="danger"
            />
        </div>
    );
}
