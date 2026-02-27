'use client';

import { useState, useEffect } from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

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

    useEffect(() => {
        fetchPackages();
    }, []);

    const fetchPackages = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/amc-packages?includeInactive=true', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setPackages(data.data);
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
        if (!confirm('Are you sure you want to delete this AMC package? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/amc-packages/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Package deleted successfully');
                fetchPackages();
            } else {
                toast.error(data.message || 'Could not delete the package');
            }
        } catch (error) {
            toast.error('An unexpected error occurred');
        }
    };

    const handleEdit = (pkg: AMCPackage) => {
        onEditPackage(pkg._id);
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
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">AMC Packages</h2>
                    <p className="text-gray-600 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500 mt-1">Manage annual maintenance contract packages</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {packages.map((pkg) => (
                    <div key={pkg._id} className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="h-48 overflow-hidden">
                            <img src={pkg.cardImage} alt={pkg.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="p-6">
                            <a
                                href={`/amc-packages/${pkg._id}`}
                                className="block hover:text-[#FF6B35] transition-colors"
                            >
                                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 cursor-pointer">{pkg.title}</h3>
                            </a>
                            <span className="inline-block px-3 py-1 bg-orange-100 text-orange-600 text-xs font-semibold rounded-full mb-3">
                                {pkg.category}
                            </span>
                            <p className="text-gray-600 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500 text-sm mb-4">{pkg.description}</p>

                            {pkg.createdBy ? (
                                <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
                                    <span className="font-medium">By:</span> {pkg.createdBy.name}
                                </p>
                            ) : (
                                <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
                                    <span className="font-medium">By:</span> Unknown
                                </p>
                            )}

                            <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">{pkg.pricingTiers.length} pricing tiers • {pkg.benefits.length} benefits</p>

                            {pkg.createdBy && pkg.createdBy._id === currentUserId && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(pkg)}
                                        className="flex-1 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(pkg._id)}
                                        className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
