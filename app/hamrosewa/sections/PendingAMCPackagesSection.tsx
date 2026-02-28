'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

interface PricingTier {
    name: string;
    price: number;
    duration: string;
    features: string[];
}

interface AMCPackage {
    _id: string;
    title: string;
    category: string;
    description: string;
    cardImage: string;
    heroImage: string;
    pricingTiers: PricingTier[];
    approvalStatus: 'pending' | 'approved' | 'rejected';
    rejectionReason?: string;
    createdBy: {
        _id: string;
        name: string;
        email: string;
    };
    createdAt: string;
}

interface PendingAMCPackagesSectionProps {
    token: string;
}

export default function PendingAMCPackagesSection({ token }: PendingAMCPackagesSectionProps) {
    const [packages, setPackages] = useState<AMCPackage[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPackage, setSelectedPackage] = useState<AMCPackage | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [approvalAmount, setApprovalAmount] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchPendingPackages();
    }, []);

    const fetchPendingPackages = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/amc-packages/admin/pending', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setPackages(data.data);
            }
        } catch (error) {
            console.error('Error fetching pending packages:', error);
            toast.error('Failed to load pending packages');
        } finally {
            setLoading(false);
        }
    };

    const handleApproveClick = (pkg: AMCPackage) => {
        setSelectedPackage(pkg);
        setApprovalAmount('');
        setShowApprovalModal(true);
    };

    const handleApprove = async () => {
        if (!selectedPackage || !approvalAmount.trim()) {
            toast.error('Please enter an amount');
            return;
        }

        const amount = parseFloat(approvalAmount);
        if (isNaN(amount) || amount <= 0) {
            toast.error('Please enter a valid amount greater than 0');
            return;
        }

        setActionLoading(true);
        try {
            const response = await fetch(`http://localhost:5000/api/amc-packages/${selectedPackage._id}/approve`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ amount })
            });
            const data = await response.json();

            if (data.success) {
                toast.success('AMC Package approved successfully!');
                setShowApprovalModal(false);
                setApprovalAmount('');
                setSelectedPackage(null);
                fetchPendingPackages();
            } else {
                toast.error(data.message || 'Failed to approve package');
            }
        } catch (error) {
            console.error('Error approving package:', error);
            toast.error('Failed to approve package');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!selectedPackage || !rejectionReason.trim()) {
            toast.error('Please provide a rejection reason');
            return;
        }

        setActionLoading(true);
        try {
            const response = await fetch(`http://localhost:5000/api/amc-packages/${selectedPackage._id}/reject`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reason: rejectionReason })
            });
            const data = await response.json();

            if (data.success) {
                toast.success('AMC Package rejected');
                setShowModal(false);
                setRejectionReason('');
                setSelectedPackage(null);
                fetchPendingPackages();
            } else {
                toast.error(data.message || 'Failed to reject package');
            }
        } catch (error) {
            console.error('Error rejecting package:', error);
            toast.error('Failed to reject package');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B35]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Pending Packages</h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Review and approve user-submitted AMC packages
                    </p>
                </div>
                <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 px-4 py-2 rounded-lg">
                    <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    <span className="font-semibold text-yellow-900 dark:text-yellow-200">
                        {packages.length} Pending
                    </span>
                </div>
            </div>

            {packages.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        All Caught Up!
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        No pending packages to review at the moment.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {packages.map((pkg) => (
                        <div
                            key={pkg._id}
                            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
                        >
                            <div className="relative h-48">
                                <img
                                    src={pkg.cardImage}
                                    alt={pkg.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-3 right-3 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    Pending
                                </div>
                            </div>

                            <div className="p-6">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                    {pkg.title}
                                </h3>

                                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                                    <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                        {pkg.category}
                                    </span>
                                    <span>{pkg.pricingTiers.length} Pricing Tiers</span>
                                </div>

                                <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">
                                    {pkg.description}
                                </p>

                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 mb-4">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                        Pricing Tiers:
                                    </p>
                                    {pkg.pricingTiers.map((tier, idx) => (
                                        <div key={idx} className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                            • {tier.name}: NPR {tier.price.toLocaleString()}/{tier.duration}
                                        </div>
                                    ))}
                                </div>

                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 mb-4">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        <span className="font-semibold">Submitted by:</span> {pkg.createdBy.name}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        <span className="font-semibold">Email:</span> {pkg.createdBy.email}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        <span className="font-semibold">Date:</span>{' '}
                                        {new Date(pkg.createdAt).toLocaleDateString()}
                                    </p>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handleApproveClick(pkg)}
                                        disabled={actionLoading}
                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                                    >
                                        <CheckCircle className="w-5 h-5" />
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSelectedPackage(pkg);
                                            setShowModal(true);
                                        }}
                                        disabled={actionLoading}
                                        className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                                    >
                                        <XCircle className="w-5 h-5" />
                                        Reject
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Approval Modal */}
            {showApprovalModal && selectedPackage && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                    Approve AMC Package
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Enter transaction amount
                                </p>
                            </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-4">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                                {selectedPackage.title}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                by {selectedPackage.createdBy.name}
                            </p>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Amount (NPR) <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-semibold">
                                    NPR
                                </span>
                                <input
                                    type="number"
                                    value={approvalAmount}
                                    onChange={(e) => setApprovalAmount(e.target.value)}
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01"
                                    className="w-full pl-14 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-lg font-semibold"
                                    autoFocus
                                />
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                This amount will be recorded in the transaction history
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowApprovalModal(false);
                                    setApprovalAmount('');
                                    setSelectedPackage(null);
                                }}
                                disabled={actionLoading}
                                className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleApprove}
                                disabled={actionLoading || !approvalAmount.trim()}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {actionLoading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Approving...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-5 h-5" />
                                        Approve
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Rejection Modal */}
            {showModal && selectedPackage && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <AlertCircle className="w-6 h-6 text-red-600" />
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                Reject AMC Package
                            </h3>
                        </div>

                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Please provide a reason for rejecting "{selectedPackage.title}"
                        </p>

                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Enter rejection reason..."
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                            rows={4}
                        />

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setRejectionReason('');
                                    setSelectedPackage(null);
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={actionLoading || !rejectionReason.trim()}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
                            >
                                {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
