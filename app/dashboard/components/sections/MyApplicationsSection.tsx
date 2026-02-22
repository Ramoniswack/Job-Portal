'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Eye, X, Briefcase, MapPin, DollarSign, Tag, Calendar, User as UserIcon, Mail, Phone, FileText } from 'lucide-react';
import { User, Application } from '../DashboardLayout';
import ConfirmDialog from '@/app/components/ConfirmDialog';

interface MyApplicationsSectionProps {
    myApplications: Application[];
    currentUser: User | null;
    token: string;
    loadingApplications: boolean;
    onLoadApplications: () => void;
    onRefresh: () => void;
}

export default function MyApplicationsSection({
    myApplications,
    currentUser,
    token,
    loadingApplications,
    onLoadApplications,
    onRefresh,
}: MyApplicationsSectionProps) {
    const [cancelConfirm, setCancelConfirm] = useState<{ isOpen: boolean; appId: string | null; jobTitle: string }>({
        isOpen: false,
        appId: null,
        jobTitle: ''
    });
    const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    const openDetailsModal = (application: Application) => {
        setSelectedApplication(application);
        setShowDetailsModal(true);
    };

    const closeDetailsModal = () => {
        setShowDetailsModal(false);
        setSelectedApplication(null);
    };

    const cancelApplication = async (applicationId: string) => {
        try {
            const response = await fetch(`http://localhost:5000/api/applications/${applicationId}`, {
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

    const openCancelConfirm = (appId: string, jobTitle: string) => {
        setCancelConfirm({ isOpen: true, appId, jobTitle });
    };

    const closeCancelConfirm = () => {
        setCancelConfirm({ isOpen: false, appId: null, jobTitle: '' });
    };

    const handleCancelConfirm = () => {
        if (cancelConfirm.appId) {
            cancelApplication(cancelConfirm.appId);
        }
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">My Applications</h2>
                    <p className="text-sm text-gray-500">Track your job applications and their status</p>
                </div>
                <button
                    onClick={onLoadApplications}
                    disabled={loadingApplications}
                    className="bg-[#26cf71] text-white px-5 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition-all disabled:opacity-50"
                >
                    {loadingApplications ? 'Loading...' : 'Refresh'}
                </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {myApplications.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job Title</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Budget</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applied Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {myApplications.map((application) => (
                                    <tr key={application._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">{application.job.title}</div>
                                            <div className="text-sm text-gray-500">{application.job.location}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{application.job.category}</td>
                                        <td className="px-6 py-4 text-sm font-semibold text-[#26cf71]">${application.job.budget}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${application.status === 'requested' ? 'bg-yellow-100 text-yellow-800' :
                                                application.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(application.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => openDetailsModal(application)}
                                                    className="px-3 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded text-xs font-bold transition-all flex items-center gap-1"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    View
                                                </button>
                                                {application.status === 'requested' && (
                                                    <button
                                                        onClick={() => openCancelConfirm(application._id, application.job.title)}
                                                        className="px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded text-xs font-bold transition-all"
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <span className="material-symbols-outlined text-gray-300 text-[64px]">description</span>
                        <p className="text-gray-500 mt-4">No applications found. Start applying for jobs!</p>
                    </div>
                )}
            </div>

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

            {/* Application Details Modal */}
            {showDetailsModal && selectedApplication && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Application Details</h2>
                                <p className="text-sm text-gray-500 mt-1">Complete information about your application</p>
                            </div>
                            <button
                                onClick={closeDetailsModal}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-6 h-6 text-gray-500" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Application Status */}
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Application Status</p>
                                        <span className={`inline-flex px-4 py-2 text-sm font-semibold rounded-lg ${selectedApplication.status === 'requested' ? 'bg-yellow-100 text-yellow-800' :
                                                selectedApplication.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                    'bg-red-100 text-red-800'
                                            }`}>
                                            {selectedApplication.status.charAt(0).toUpperCase() + selectedApplication.status.slice(1)}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-600 mb-1">Applied On</p>
                                        <p className="text-sm font-semibold text-gray-900">
                                            {new Date(selectedApplication.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Job Details */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Briefcase className="w-5 h-5 text-[#26cf71]" />
                                    Job Details
                                </h3>
                                <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
                                    <div>
                                        <h4 className="text-xl font-bold text-gray-900 mb-2">{selectedApplication.job.title}</h4>
                                        <p className="text-gray-600">{selectedApplication.job.description}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Tag className="w-4 h-4 text-gray-400" />
                                            <span className="text-gray-600">Category:</span>
                                            <span className="font-semibold text-gray-900">{selectedApplication.job.category}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <MapPin className="w-4 h-4 text-gray-400" />
                                            <span className="text-gray-600">Location:</span>
                                            <span className="font-semibold text-gray-900">{selectedApplication.job.location}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <DollarSign className="w-4 h-4 text-gray-400" />
                                            <span className="text-gray-600">Budget:</span>
                                            <span className="font-semibold text-[#26cf71]">${selectedApplication.job.budget}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Calendar className="w-4 h-4 text-gray-400" />
                                            <span className="text-gray-600">Status:</span>
                                            <span className="font-semibold text-gray-900">{selectedApplication.job.status}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Client Information */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <UserIcon className="w-5 h-5 text-[#26cf71]" />
                                    Client Information
                                </h3>
                                <div className="bg-white border border-gray-200 rounded-xl p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-16 h-16 bg-gradient-to-br from-[#26cf71] to-[#1eb863] rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                            {typeof selectedApplication.job.client === 'object'
                                                ? selectedApplication.job.client.name.charAt(0).toUpperCase()
                                                : 'C'}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-lg font-bold text-gray-900 mb-3">
                                                {typeof selectedApplication.job.client === 'object'
                                                    ? selectedApplication.job.client.name
                                                    : 'Client'}
                                            </h4>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Mail className="w-4 h-4 text-gray-400" />
                                                    <span className="text-gray-600">
                                                        {typeof selectedApplication.job.client === 'object'
                                                            ? selectedApplication.job.client.email
                                                            : 'N/A'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Your Application */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-[#26cf71]" />
                                    Your Application
                                </h3>
                                <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-2">Message</p>
                                        <p className="text-gray-900">{selectedApplication.message}</p>
                                    </div>
                                    <div className="grid grid-cols-1 gap-3">
                                        <div className="flex items-center gap-2 text-sm">
                                            <MapPin className="w-4 h-4 text-gray-400" />
                                            <span className="text-gray-600">Your Location:</span>
                                            <span className="font-semibold text-gray-900">{selectedApplication.workerLocation}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex justify-end gap-3">
                            <button
                                onClick={closeDetailsModal}
                                className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                            >
                                Close
                            </button>
                            {selectedApplication.status === 'requested' && (
                                <button
                                    onClick={() => {
                                        closeDetailsModal();
                                        openCancelConfirm(selectedApplication._id, selectedApplication.job.title);
                                    }}
                                    className="px-6 py-2.5 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all"
                                >
                                    Cancel Application
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

