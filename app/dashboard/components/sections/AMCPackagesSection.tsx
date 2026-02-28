'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import ConfirmDialog from '@/app/components/ConfirmDialog';

interface PricingTier {
    name: string;
    price: number;
    duration: string;
    features: string[];
}

interface Benefit {
    title: string;
    description: string;
}

interface AMCPackage {
    _id: string;
    title: string;
    category: string;
    cardImage: string;
    heroImage: string;
    description: string;
    pricingTiers: PricingTier[];
    whyChooseHeading: string;
    benefits: Benefit[];
    isActive: boolean;
    approvalStatus?: 'pending' | 'approved' | 'rejected';
    rejectionReason?: string;
    createdBy?: {
        _id: string;
        name: string;
        email: string;
    };
}

interface AMCPackagesSectionProps {
    token: string;
    currentUserId: string;
    onEditPackage: (packageId: string) => void;
}

export default function AMCPackagesSection({ token, currentUserId, onEditPackage }: AMCPackagesSectionProps) {
    const [packages, setPackages] = useState<AMCPackage[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; packageId: string | null }>({
        isOpen: false,
        packageId: null
    });

    useEffect(() => {
        fetchPackages();
    }, []);

    const fetchPackages = async () => {
        try {
            const storedUser = localStorage.getItem('currentUser');

            const response = await fetch('http://localhost:5000/api/amc-packages?includeInactive=true', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                // Filter to show only packages created by the current user
                if (storedUser) {
                    const user = JSON.parse(storedUser);
                    const userPackages = data.data.filter((pkg: AMCPackage) =>
                        pkg.createdBy?._id === user.id
                    );
                    console.log('User packages filtered:', userPackages.length, 'packages');
                    setPackages(userPackages);
                } else {
                    setPackages(data.data);
                }
            } else {
                toast.error('Failed to load AMC packages');
            }
        } catch (error) {
            toast.error('Could not fetch AMC packages');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        setDeleteConfirm({ isOpen: true, packageId: id });
    };

    const confirmDelete = async () => {
        if (!deleteConfirm.packageId) return;

        try {
            const response = await fetch(`http://localhost:5000/api/amc-packages/${deleteConfirm.packageId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Package Deleted!', {
                    description: 'The AMC package has been deleted successfully.',
                    duration: 4000,
                });
                fetchPackages();
            } else {
                toast.error('Delete Failed', {
                    description: data.message || 'Could not delete the package',
                    duration: 4000,
                });
            }
        } catch (error) {
            toast.error('Connection Error', {
                description: 'An unexpected error occurred. Please try again.',
                duration: 4000,
            });
        } finally {
            setDeleteConfirm({ isOpen: false, packageId: null });
        }
    };

    const handleEdit = (pkg: AMCPackage) => {
        onEditPackage(pkg._id);
    };

    const getApprovalBadge = (approvalStatus?: string) => {
        if (!approvalStatus) {
            return 'bg-green-50 text-green-600 border border-green-200';
        }
        const styles = {
            pending: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
            approved: 'bg-green-50 text-green-600 border border-green-200',
            rejected: 'bg-red-50 text-red-600 border border-red-200'
        };
        return styles[approvalStatus as keyof typeof styles] || styles.pending;
    };

    const getApprovalText = (approvalStatus?: string) => {
        if (!approvalStatus) {
            return 'Active';
        }
        const texts = {
            pending: 'Inactive',
            approved: 'Active',
            rejected: 'Rejected'
        };
        return texts[approvalStatus as keyof typeof texts] || 'Inactive';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">AMC Package Status</h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">View and manage your posted AMC packages</p>
                </div>
                <button
                    onClick={() => onEditPackage('')}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition font-medium"
                >
                    <span className="material-symbols-outlined">add</span>
                    Add Package
                </button>
            </div>

            {packages.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
                    <span className="material-symbols-outlined text-gray-300 text-6xl">inventory_2</span>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">You haven't posted any AMC packages yet</p>
                    <button
                        onClick={() => onEditPackage('')}
                        className="mt-4 text-[#26cf71] hover:text-[#1fb35f] font-medium"
                    >
                        Add your first package
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {packages.map((pkg) => (
                        <div key={pkg._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition">
                            {/* Image with Status Badge Overlay */}
                            <div className="relative h-48 bg-gray-200">
                                <img src={pkg.cardImage} alt={pkg.title} className="w-full h-full object-cover" />
                                <div className="absolute top-2 right-2 flex gap-2">
                                    <span className={`px-2 py-1 text-xs font-medium rounded ${getApprovalBadge(pkg.approvalStatus)}`}>
                                        {getApprovalText(pkg.approvalStatus)}
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-4">
                                <a
                                    href={`/amc-packages/${pkg._id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-semibold text-gray-900 dark:text-gray-100 mb-1 line-clamp-1 hover:text-[#FF6B35] cursor-pointer block"
                                >
                                    {pkg.title}
                                </a>

                                {pkg.createdBy && (
                                    <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">
                                        Posted by <span className="font-medium text-gray-700 dark:text-gray-300">{pkg.createdBy.name}</span>
                                    </p>
                                )}

                                {pkg.approvalStatus === 'rejected' && pkg.rejectionReason && (
                                    <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded">
                                        <p className="text-xs text-red-600 font-medium mb-1">Rejection Reason:</p>
                                        <p className="text-xs text-red-700">{pkg.rejectionReason}</p>
                                    </div>
                                )}

                                <p className="text-sm text-gray-500 dark:text-gray-500 mb-2">
                                    {pkg.category}
                                </p>

                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                                    {pkg.description}
                                </p>

                                <p className="text-sm text-gray-500 dark:text-gray-500 mb-3">
                                    {pkg.pricingTiers.length} pricing tiers • {pkg.benefits.length} benefits
                                </p>

                                {/* Actions */}
                                <div className="flex gap-2 pt-3 border-t">
                                    <button
                                        onClick={() => handleEdit(pkg)}
                                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded transition"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">edit</span>
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(pkg._id)}
                                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded transition"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">delete</span>
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={deleteConfirm.isOpen}
                onClose={() => setDeleteConfirm({ isOpen: false, packageId: null })}
                onConfirm={confirmDelete}
                title="Delete AMC Package"
                message="Are you sure you want to delete this AMC package? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                type="danger"
            />
        </div>
    );
}
