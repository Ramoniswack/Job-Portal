'use client';

import { useState } from 'react';
import { User, Job } from '../DashboardLayout';

interface Application {
    _id: string;
    worker: {
        _id: string;
        name: string;
        email: string;
    };
    workerLocation: string;
    phone: string;
    email: string;
    qualification: string;
    message: string;
    status: 'requested' | 'approved' | 'rejected';
    createdAt: string;
}

interface MyJobsSectionProps {
    myJobs: Job[];
    currentUser: User | null;
    token: string;
    loadingJobs: boolean;
    onLoadMyJobs: () => void;
    onRefresh: () => void;
}

export default function MyJobsSection({
    myJobs,
    token,
    loadingJobs,
    onLoadMyJobs,
    onRefresh,
}: MyJobsSectionProps) {
    const [editingJobId, setEditingJobId] = useState<string | null>(null);
    const [editJobData, setEditJobData] = useState({
        title: '',
        description: '',
        category: '',
        location: '',
        budget: '',
    });
    const [currentViewingJobId, setCurrentViewingJobId] = useState<string | null>(null);
    const [selectedJobApplications, setSelectedJobApplications] = useState<Application[]>([]);

    const startEditJob = (job: Job) => {
        setEditingJobId(job._id);
        setEditJobData({
            title: job.title,
            description: job.description,
            category: job.category,
            location: job.location,
            budget: job.budget.toString(),
        });
    };

    const cancelEditJob = () => {
        setEditingJobId(null);
        setEditJobData({
            title: '',
            description: '',
            category: '',
            location: '',
            budget: '',
        });
    };

    const updateJob = async (jobId: string) => {
        try {
            const response = await fetch(`http://localhost:5000/api/jobs/${jobId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...editJobData,
                    budget: Number(editJobData.budget),
                }),
            });

            const data = await response.json();
            if (data.success) {
                alert('Job updated successfully!');
                cancelEditJob();
                onRefresh();
            } else {
                alert(data.message || 'Failed to update job');
            }
        } catch (error) {
            console.error('Error updating job:', error);
            alert('Error updating job');
        }
    };

    const deleteJob = async (jobId: string) => {
        if (!confirm('Are you sure you want to delete this job? This will also delete all applications.')) return;

        try {
            const response = await fetch(`http://localhost:5000/api/jobs/${jobId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            const data = await response.json();
            if (data.success) {
                alert('Job deleted successfully!');
                onRefresh();
            } else {
                alert(data.message || 'Failed to delete job');
            }
        } catch (error) {
            console.error('Error deleting job:', error);
            alert('Error deleting job');
        }
    };

    const updateJobStatus = async (jobId: string, status: string) => {
        try {
            const response = await fetch(`http://localhost:5000/api/jobs/${jobId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ status }),
            });

            const data = await response.json();
            if (data.success) {
                onRefresh();
            } else {
                alert(data.message || 'Failed to update job status');
            }
        } catch (error) {
            console.error('Error updating job status:', error);
            alert('Error updating job status');
        }
    };

    const loadJobApplications = async (jobId: string) => {
        if (currentViewingJobId === jobId) {
            setCurrentViewingJobId(null);
            return;
        }

        setCurrentViewingJobId(jobId);
        try {
            const response = await fetch(`http://localhost:5000/api/applications/job/${jobId}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await response.json();
            if (data.success) {
                setSelectedJobApplications(data.data);
            } else {
                setSelectedJobApplications([]);
            }
        } catch (error) {
            console.error('Error loading job applications:', error);
            setSelectedJobApplications([]);
        }
    };

    const updateApplicationStatus = async (applicationId: string, status: string) => {
        try {
            const response = await fetch(`http://localhost:5000/api/applications/${applicationId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ status }),
            });

            const data = await response.json();
            if (data.success) {
                // Reload applications for current job
                if (currentViewingJobId) {
                    loadJobApplications(currentViewingJobId);
                }
                onRefresh();
            } else {
                alert(data.message || 'Failed to update application status');
            }
        } catch (error) {
            console.error('Error updating application status:', error);
            alert('Error updating application status');
        }
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">My Posted Jobs</h2>
                    <p className="text-sm text-gray-500">Manage jobs you've posted and review applications</p>
                </div>
                <button
                    onClick={onLoadMyJobs}
                    disabled={loadingJobs}
                    className="bg-[#FF6B35] text-white px-5 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition-all disabled:opacity-50"
                >
                    {loadingJobs ? 'Loading...' : 'Refresh'}
                </button>
            </div>

            <div className="space-y-4">
                {myJobs.map((job) => (
                    <div key={job._id} className="bg-white border border-gray-200 rounded-xl p-6">
                        {/* View Mode */}
                        {editingJobId !== job._id ? (
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-gray-900">{job.title}</h3>
                                        <p className="text-sm text-gray-600 mt-1">{job.description}</p>
                                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                            <span>{job.category}</span>
                                            <span>{job.location}</span>
                                            <span className="font-semibold text-[#FF6B35]">${job.budget}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <select
                                            value={job.status}
                                            onChange={(e) => updateJobStatus(job._id, e.target.value)}
                                            className="px-2 py-1 text-xs font-semibold rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="accepted">Accepted</option>
                                            <option value="confirmed">Confirmed</option>
                                            <option value="completed">Completed</option>
                                        </select>
                                        <button
                                            onClick={() => startEditJob(job)}
                                            className="px-3 py-1 bg-[#FF6B35] text-white text-xs rounded hover:bg-[#FF6B35]"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => deleteJob(job._id)}
                                            className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                                        >
                                            Delete
                                        </button>
                                        <button
                                            onClick={() => loadJobApplications(job._id)}
                                            className={`px-3 py-1 text-white text-xs rounded ${currentViewingJobId === job._id ? 'bg-[#F8F9FA]0' : 'bg-[#F8F9FA]0'
                                                }`}
                                        >
                                            {currentViewingJobId === job._id ? 'Hide' : 'View'} Applications
                                        </button>
                                    </div>
                                </div>

                                {/* Applications */}
                                {currentViewingJobId === job._id && (
                                    <div className="mt-4 border-t pt-4">
                                        {selectedJobApplications.length === 0 ? (
                                            <p className="text-sm text-gray-500 text-center py-4">No applications yet</p>
                                        ) : (
                                            <div className="space-y-3">
                                                {selectedJobApplications.map((application) => (
                                                    <div key={application._id} className="bg-[#F8F9FA] p-3 rounded-md flex justify-between items-start">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <span className="font-medium text-gray-900">{application.worker.name}</span>
                                                                <span
                                                                    className={`text-xs px-2 py-1 rounded-full ${application.status === 'requested' ? 'bg-yellow-100 text-yellow-800' :
                                                                        application.status === 'approved' ? 'bg-[#F1F3F5] text-green-800' :
                                                                            'bg-red-100 text-red-800'
                                                                        }`}
                                                                >
                                                                    {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-gray-600">{application.message}</p>
                                                            <p className="text-xs text-gray-500 mt-1">Location: {application.workerLocation}</p>
                                                            <p className="text-xs text-gray-500">Phone: {application.phone || 'N/A'}</p>
                                                            <p className="text-xs text-gray-500">Email: {application.email || 'N/A'}</p>
                                                            <p className="text-xs text-gray-500">Qualification: {application.qualification || 'N/A'}</p>
                                                        </div>
                                                        {application.status === 'requested' && (
                                                            <div className="flex gap-2 ml-4">
                                                                <button
                                                                    onClick={() => updateApplicationStatus(application._id, 'approved')}
                                                                    className="px-3 py-1 bg-[#F8F9FA]0 text-white text-xs rounded hover:bg-green-600"
                                                                >
                                                                    Approve
                                                                </button>
                                                                <button
                                                                    onClick={() => updateApplicationStatus(application._id, 'rejected')}
                                                                    className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                                                                >
                                                                    Reject
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* Edit Mode */
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    value={editJobData.title}
                                    onChange={(e) => setEditJobData({ ...editJobData, title: e.target.value })}
                                    placeholder="Job Title"
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600"
                                />
                                <textarea
                                    value={editJobData.description}
                                    onChange={(e) => setEditJobData({ ...editJobData, description: e.target.value })}
                                    rows={3}
                                    placeholder="Description"
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600"
                                />
                                <div className="grid grid-cols-3 gap-4">
                                    <select
                                        value={editJobData.category}
                                        onChange={(e) => setEditJobData({ ...editJobData, category: e.target.value })}
                                        className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600"
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
                                    <input
                                        type="text"
                                        value={editJobData.location}
                                        onChange={(e) => setEditJobData({ ...editJobData, location: e.target.value })}
                                        placeholder="Location"
                                        className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600"
                                    />
                                    <input
                                        type="number"
                                        value={editJobData.budget}
                                        onChange={(e) => setEditJobData({ ...editJobData, budget: e.target.value })}
                                        placeholder="Budget"
                                        className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => updateJob(job._id)}
                                        className="px-4 py-2 bg-[#F8F9FA]0 text-white rounded-lg hover:bg-green-600"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={cancelEditJob}
                                        className="px-4 py-2 bg-[#F8F9FA]0 text-white rounded-lg hover:bg-gray-600"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {myJobs.length === 0 && !loadingJobs && (
                <div className="text-center py-12">
                    <span className="material-symbols-outlined text-gray-300 text-[64px]">work_off</span>
                    <p className="text-gray-500 mt-4">No jobs posted yet. Create your first job!</p>
                </div>
            )}
        </div>
    );
}

