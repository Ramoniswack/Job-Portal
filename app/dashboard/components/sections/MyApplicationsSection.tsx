'use client';

import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { Eye, X, Briefcase, MapPin, DollarSign, Tag, Calendar, User as UserIcon, Mail, Phone, FileText, Search } from 'lucide-react';
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
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Filter applications based on search
    const filteredApplications = useMemo(() => {
        if (!debouncedSearch.trim()) {
            return myApplications;
        }

        const query = debouncedSearch.toLowerCase();
        return myApplications.filter(app =>
            app.job.title.toLowerCase().includes(query) ||
            app.job.description.toLowerCase().includes(query) ||
            app.job.category.toLowerCase().includes(query) ||
            app.job.location.toLowerCase().includes(query)
        );
    }, [myApplications, debouncedSearch]);

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
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">My Applications</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-500">Track your job applications and their status</p>
                </div>
                <button
                    onClick={onLoadApplications}
                    disabled={loadingApplications}
                    className="bg-[#FF6B35] text-white px-5 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition-all disabled:opacity-50"
                >
                    {loadingApplications ? 'Loading...' : 'Refresh'}
                </button>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search applications by job title, description, category, or location..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent transition-all"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:text-gray-500"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                {filteredApplications.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 dark:bg-gray-900 dark:bg-gray-900">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-500 uppercase">Job Title</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-500 uppercase">Category</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-500 uppercase">Budget</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-500 uppercase">Applied Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 dark:bg-gray-800 divide-y divide-gray-200">
                                {filteredApplications.map((application) => (
                                    <tr key={application._id} className="hover:bg-gray-50 dark:bg-gray-900">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{application.job.title}</div>
                                            <div className="text-sm text-gray-500 dark:text-gray-500">{application.job.location}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{application.job.category}</td>
                                        <td className="px-6 py-4 text-sm font-semibold text-[#FF6B35]">${application.job.budget}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${application.status === 'requested' ? 'bg-yellow-100 text-yellow-800' :
                                                application.status === 'approved' ? 'bg-[#F1F3F5] text-green-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-500">
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
                        <p className="text-gray-500 dark:text-gray-500 mt-4">
                            {debouncedSearch ? 'No matching applications found. Try adjusting your search terms.' : 'No applications found. Start applying for jobs!'}
                        </p>
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
                    <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Application Details</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Complete information about your application</p>
                            </div>
                            <button
                                onClick={closeDetailsModal}
                                className="p-2 hover:bg-[#F1F3F5] rounded-lg transition-colors"
                            >
                                <X className="w-6 h-6 text-gray-500 dark:text-gray-500" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Application Status */}
                            <div className="bg-gray-50 dark:bg-gray-900 dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500 mb-1">Application Status</p>
                                        <span className={`inline-flex px-4 py-2 text-sm font-semibold rounded-lg ${selectedApplication.status === 'requested' ? 'bg-yellow-100 text-yellow-800' :
                                            selectedApplication.status === 'approved' ? 'bg-[#F1F3F5] text-green-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                            {selectedApplication.status.charAt(0).toUpperCase() + selectedApplication.status.slice(1)}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500 mb-1">Applied On</p>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
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
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                    <Briefcase className="w-5 h-5 text-[#FF6B35]" />
                                    Job Details
                                </h3>
                                <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 space-y-4">
                                    <div>
                                        <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{selectedApplication.job.title}</h4>
                                        <p className="text-gray-600 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500">{selectedApplication.job.description}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Tag className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                            <span className="text-gray-600 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500">Category:</span>
                                            <span className="font-semibold text-gray-900 dark:text-gray-100">{selectedApplication.job.category}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                            <span className="text-gray-600 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500">Location:</span>
                                            <span className="font-semibold text-gray-900 dark:text-gray-100">{selectedApplication.job.location}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <DollarSign className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                            <span className="text-gray-600 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500">Budget:</span>
                                            <span className="font-semibold text-[#FF6B35]">${selectedApplication.job.budget}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                            <span className="text-gray-600 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500">Status:</span>
                                            <span className="font-semibold text-gray-900 dark:text-gray-100">{selectedApplication.job.status}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Client Information */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                    <UserIcon className="w-5 h-5 text-[#FF6B35]" />
                                    Client Information
                                </h3>
                                <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-16 h-16 bg-gradient-to-br from-[#FF6B35] to-[#FF5722] rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                            {typeof selectedApplication.job.client === 'object'
                                                ? selectedApplication.job.client.name.charAt(0).toUpperCase()
                                                : 'C'}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">
                                                {typeof selectedApplication.job.client === 'object'
                                                    ? selectedApplication.job.client.name
                                                    : 'Client'}
                                            </h4>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Mail className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                                    <span className="text-gray-600 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500">
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
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-[#FF6B35]" />
                                    Your Application
                                </h3>
                                <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 space-y-4">
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500 mb-2">Message</p>
                                        <p className="text-gray-900 dark:text-gray-100 dark:text-gray-100">{selectedApplication.message}</p>
                                    </div>
                                    <div className="grid grid-cols-1 gap-3">
                                        <div className="flex items-center gap-2 text-sm">
                                            <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                            <span className="text-gray-600 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500">Your Location:</span>
                                            <span className="font-semibold text-gray-900 dark:text-gray-100">{selectedApplication.workerLocation}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-6 flex justify-end gap-3">
                            <button
                                onClick={closeDetailsModal}
                                className="px-6 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:bg-gray-900 transition-all"
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

