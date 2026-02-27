'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import ConfirmDialog from '../../components/ConfirmDialog';
import Notification from '../../components/Notification';
import SimpleImageUpload from '../../components/SimpleImageUpload';

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
}

export default function AMCPackagesSection({ token }: AMCPackagesSectionProps) {
    const [packages, setPackages] = useState<AMCPackage[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingPackage, setEditingPackage] = useState<AMCPackage | null>(null);
    const [categories, setCategories] = useState<any[]>([]);
    const [sectionHeading, setSectionHeading] = useState('AMC Packages');
    const [editingHeading, setEditingHeading] = useState(false);
    const [tempHeading, setTempHeading] = useState('AMC Packages');
    const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; packageId: string | null }>({
        isOpen: false,
        packageId: null
    });
    const [notification, setNotification] = useState<{
        isOpen: boolean;
        title: string;
        message?: string;
        type: 'success' | 'error' | 'warning';
    }>({
        isOpen: false,
        title: '',
        type: 'success'
    });
    const [formData, setFormData] = useState({
        title: '',
        category: '',
        cardImage: '',
        heroImage: '',
        description: '',
        pricingTiers: [
            { name: 'Basic', price: 0, duration: 'year', features: [''] }
        ],
        whyChooseHeading: 'Why Choose Our AMC Packages?',
        benefits: [
            { title: '', description: '' }
        ],
        isActive: true
    });

    useEffect(() => {
        fetchPackages();
        fetchHeading();
        loadCategories();
    }, []);

    // Debug: Log formData changes
    useEffect(() => {
        console.log('📦 FormData updated:', {
            cardImage: formData.cardImage ? '✅ Set' : '❌ Empty',
            heroImage: formData.heroImage ? '✅ Set' : '❌ Empty',
            cardImageUrl: formData.cardImage,
            heroImageUrl: formData.heroImage
        });
    }, [formData.cardImage, formData.heroImage]);

    const fetchHeading = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/site-content/amc_packages_heading');
            const data = await response.json();
            if (data.success) {
                setSectionHeading(data.data.value);
                setTempHeading(data.data.value);
            }
        } catch (error) {
            console.error('Failed to fetch heading:', error);
        }
    };

    const fetchPackages = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/amc-packages');
            const data = await response.json();
            if (data.success) {
                setPackages(data.data);
            }
        } catch (error) {
            setNotification({
                isOpen: true,
                title: 'Failed to Load',
                message: 'Could not fetch AMC packages.',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const loadCategories = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/categories/all');
            const data = await response.json();
            if (data) {
                const categoryList = Array.isArray(data) ? data : (data.data || []);
                // Filter only parent categories (no parent field)
                const parentCategories = categoryList.filter((cat: any) => !cat.parent || cat.parent === null);
                setCategories(parentCategories);
                // Set default category if available
                if (parentCategories.length > 0 && !formData.category) {
                    setFormData(prev => ({ ...prev, category: parentCategories[0].name }));
                }
            }
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate that both images are uploaded
        if (!formData.cardImage) {
            setNotification({
                isOpen: true,
                title: 'Missing Card Image',
                message: 'Please upload a card image before submitting.',
                type: 'error'
            });
            return;
        }

        if (!formData.heroImage) {
            setNotification({
                isOpen: true,
                title: 'Missing Hero Image',
                message: 'Please upload a hero image before submitting.',
                type: 'error'
            });
            return;
        }

        try {
            const url = editingPackage
                ? `http://localhost:5000/api/amc-packages/${editingPackage._id}`
                : 'http://localhost:5000/api/amc-packages';

            const method = editingPackage ? 'PUT' : 'POST';

            console.log('📦 Submitting AMC Package:', formData);

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                setNotification({
                    isOpen: true,
                    title: editingPackage ? 'Package Updated!' : 'Package Created!',
                    message: editingPackage ? 'The package has been updated successfully.' : 'The package has been created successfully.',
                    type: 'success'
                });
                fetchPackages();
                handleCloseModal();
            } else {
                setNotification({
                    isOpen: true,
                    title: 'Failed to Save',
                    message: data.message || 'Could not save the package.',
                    type: 'error'
                });
            }
        } catch (error) {
            setNotification({
                isOpen: true,
                title: 'Error',
                message: 'An unexpected error occurred.',
                type: 'error'
            });
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
                setNotification({
                    isOpen: true,
                    title: 'Package Deleted!',
                    message: 'The package has been deleted successfully.',
                    type: 'success'
                });
                fetchPackages();
            } else {
                setNotification({
                    isOpen: true,
                    title: 'Failed to Delete',
                    message: data.message || 'Could not delete the package.',
                    type: 'error'
                });
            }
        } catch (error) {
            setNotification({
                isOpen: true,
                title: 'Error',
                message: 'An unexpected error occurred.',
                type: 'error'
            });
        }
    };

    const handleEdit = (pkg: AMCPackage) => {
        setEditingPackage(pkg);
        setFormData({
            title: pkg.title,
            category: pkg.category,
            cardImage: pkg.cardImage,
            heroImage: pkg.heroImage,
            description: pkg.description,
            pricingTiers: pkg.pricingTiers,
            whyChooseHeading: pkg.whyChooseHeading,
            benefits: pkg.benefits,
            isActive: pkg.isActive
        });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingPackage(null);
        setFormData({
            title: '',
            category: categories.length > 0 ? categories[0].name : '',
            cardImage: '',
            heroImage: '',
            description: '',
            pricingTiers: [
                { name: 'Basic', price: 0, duration: 'year', features: [''] }
            ],
            whyChooseHeading: 'Why Choose Our AMC Packages?',
            benefits: [
                { title: '', description: '' }
            ],
            isActive: true
        });
    };

    const addTier = () => {
        setFormData({
            ...formData,
            pricingTiers: [...formData.pricingTiers, { name: '', price: 0, duration: 'year', features: [''] }]
        });
    };

    const removeTier = (index: number) => {
        const newTiers = formData.pricingTiers.filter((_, i) => i !== index);
        setFormData({ ...formData, pricingTiers: newTiers });
    };

    const updateTier = (index: number, field: string, value: any) => {
        const newTiers = [...formData.pricingTiers];
        (newTiers[index] as any)[field] = value;
        setFormData({ ...formData, pricingTiers: newTiers });
    };

    const addFeature = (tierIndex: number) => {
        const newTiers = [...formData.pricingTiers];
        newTiers[tierIndex].features.push('');
        setFormData({ ...formData, pricingTiers: newTiers });
    };

    const removeFeature = (tierIndex: number, featureIndex: number) => {
        const newTiers = [...formData.pricingTiers];
        newTiers[tierIndex].features = newTiers[tierIndex].features.filter((_, i) => i !== featureIndex);
        setFormData({ ...formData, pricingTiers: newTiers });
    };

    const updateFeature = (tierIndex: number, featureIndex: number, value: string) => {
        const newTiers = [...formData.pricingTiers];
        newTiers[tierIndex].features[featureIndex] = value;
        setFormData({ ...formData, pricingTiers: newTiers });
    };

    const addBenefit = () => {
        setFormData({
            ...formData,
            benefits: [...formData.benefits, { title: '', description: '' }]
        });
    };

    const removeBenefit = (index: number) => {
        const newBenefits = formData.benefits.filter((_, i) => i !== index);
        setFormData({ ...formData, benefits: newBenefits });
    };

    const updateBenefit = (index: number, field: 'title' | 'description', value: string) => {
        const newBenefits = [...formData.benefits];
        newBenefits[index][field] = value;
        setFormData({ ...formData, benefits: newBenefits });
    };

    const handleSaveHeading = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/site-content/amc_packages_heading', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ value: tempHeading })
            });

            const data = await response.json();

            if (data.success) {
                setSectionHeading(tempHeading);
                setEditingHeading(false);
                setNotification({
                    isOpen: true,
                    title: 'Heading Updated!',
                    message: 'Section heading has been updated successfully.',
                    type: 'success'
                });
            } else {
                setNotification({
                    isOpen: true,
                    title: 'Failed to Update',
                    message: data.message || 'Could not update heading.',
                    type: 'error'
                });
            }
        } catch (error) {
            setNotification({
                isOpen: true,
                title: 'Error',
                message: 'An unexpected error occurred.',
                type: 'error'
            });
        }
    };

    const handleCancelHeading = () => {
        setTempHeading(sectionHeading);
        setEditingHeading(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B35]"></div>
            </div>
        );
    }

    return (
        <div>
            {/* Section Heading Editor */}
            <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Section Heading (displayed on homepage)
                        </label>
                        {editingHeading ? (
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={tempHeading}
                                    onChange={(e) => setTempHeading(e.target.value)}
                                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-[#FF6B35]"
                                    placeholder="e.g., AMC Packages"
                                />
                                <button
                                    onClick={handleSaveHeading}
                                    className="px-4 py-2 bg-[#FF6B35] hover:bg-green-600 text-white rounded-lg transition-colors"
                                >
                                    Save
                                </button>
                                <button
                                    onClick={handleCancelHeading}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-900 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{sectionHeading}</p>
                                <button
                                    onClick={() => setEditingHeading(true)}
                                    className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                                >
                                    Edit
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">AMC Packages</h2>
                    <p className="text-gray-600 dark:text-gray-400 dark:text-gray-400 mt-1">Manage annual maintenance contract packages</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-[#FF6B35] hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Add Package
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {packages.map((pkg) => (
                    <div key={pkg._id} className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="h-48 overflow-hidden">
                            <img src={pkg.cardImage} alt={pkg.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{pkg.title}</h3>
                            <span className="inline-block px-3 py-1 bg-orange-100 text-orange-600 text-xs font-semibold rounded-full mb-3">
                                {pkg.category}
                            </span>
                            <p className="text-gray-600 dark:text-gray-400 dark:text-gray-400 text-sm mb-4">{pkg.description}</p>

                            {pkg.createdBy ? (
                                <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
                                    <span className="font-medium">By:</span> {pkg.createdBy.name}
                                </p>
                            ) : (
                                <p className="text-sm text-gray-400 mb-4">
                                    <span className="font-medium">By:</span> Unknown
                                </p>
                            )}

                            <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">{pkg.pricingTiers.length} pricing tiers • {pkg.benefits.length} benefits</p>

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
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                {editingPackage ? 'Edit Package' : 'Add New Package'}
                            </h3>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 dark:text-gray-400">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Basic Info */}
                            <div className="bg-gray-50 dark:bg-gray-900 dark:bg-gray-900 p-4 rounded-lg space-y-4">
                                <h4 className="font-semibold text-gray-900 dark:text-gray-100">Basic Information</h4>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Package Title</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-[#FF6B35]"
                                        placeholder="e.g., Plumbing AMC Packages"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-[#FF6B35]"
                                        required
                                    >
                                        <option value="">Select a category</option>
                                        {categories.map((cat) => (
                                            <option key={cat._id} value={cat.name}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-[#FF6B35]"
                                        rows={2}
                                        placeholder="Brief description of the package"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Card Image <span className="text-red-500">*</span>
                                    </label>
                                    <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">For homepage card display</p>

                                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-[#FF6B35] transition-colors">
                                        <input
                                            type="file"
                                            id="card-image-upload"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;

                                                const formDataUpload = new FormData();
                                                formDataUpload.append('image', file);

                                                try {
                                                    const response = await fetch('/api/upload/single', {
                                                        method: 'POST',
                                                        headers: { 'Authorization': `Bearer ${token}` },
                                                        body: formDataUpload
                                                    });

                                                    const data = await response.json();

                                                    if (!response.ok) {
                                                        throw new Error(data.message || `Upload failed with status: ${response.status}`);
                                                    }

                                                    if (data.success && data.data?.url) {
                                                        console.log('📦 CARD IMAGE uploaded:', data.data.url);
                                                        setFormData(prev => {
                                                            const updated = { ...prev, cardImage: data.data.url };
                                                            console.log('📦 CARD IMAGE - Updated formData:', updated);
                                                            return updated;
                                                        });
                                                        setNotification({
                                                            isOpen: true,
                                                            title: 'Card Image Uploaded!',
                                                            message: 'Card image uploaded successfully.',
                                                            type: 'success'
                                                        });
                                                    } else {
                                                        throw new Error(data.message || 'Failed to upload card image');
                                                    }
                                                } catch (error: any) {
                                                    console.error('Card image upload error:', error);
                                                    setNotification({
                                                        isOpen: true,
                                                        title: 'Upload Failed',
                                                        message: error.message || 'Failed to upload card image.',
                                                        type: 'error'
                                                    });
                                                }
                                            }}
                                        />
                                        <label htmlFor="card-image-upload" className="cursor-pointer flex flex-col items-center justify-center">
                                            <svg className="h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                            <p className="text-gray-600 dark:text-gray-400 dark:text-gray-400 mb-2">Click to upload card image</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-500">PNG, JPG, GIF, WebP</p>
                                        </label>
                                    </div>

                                    {formData.cardImage && (
                                        <div className="mt-2">
                                            <img src={formData.cardImage} alt="Card preview" className="w-full h-32 object-cover rounded-lg border-2 border-green-500" />
                                            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                Card image uploaded
                                            </p>
                                        </div>
                                    )}
                                    {!formData.cardImage && (
                                        <p className="text-xs text-red-500 mt-2">⚠️ Card image is required</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Hero Image <span className="text-red-500">*</span>
                                    </label>
                                    <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">For detail page banner</p>

                                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-[#FF6B35] transition-colors">
                                        <input
                                            type="file"
                                            id="hero-image-upload"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;

                                                const formDataUpload = new FormData();
                                                formDataUpload.append('image', file);

                                                try {
                                                    const response = await fetch('/api/upload/single', {
                                                        method: 'POST',
                                                        headers: { 'Authorization': `Bearer ${token}` },
                                                        body: formDataUpload
                                                    });

                                                    const data = await response.json();

                                                    if (!response.ok) {
                                                        throw new Error(data.message || `Upload failed with status: ${response.status}`);
                                                    }

                                                    if (data.success && data.data?.url) {
                                                        console.log('📦 HERO IMAGE uploaded:', data.data.url);
                                                        setFormData(prev => {
                                                            const updated = { ...prev, heroImage: data.data.url };
                                                            console.log('📦 HERO IMAGE - Updated formData:', updated);
                                                            return updated;
                                                        });
                                                        setNotification({
                                                            isOpen: true,
                                                            title: 'Hero Image Uploaded!',
                                                            message: 'Hero image uploaded successfully.',
                                                            type: 'success'
                                                        });
                                                    } else {
                                                        throw new Error(data.message || 'Failed to upload hero image');
                                                    }
                                                } catch (error: any) {
                                                    console.error('Hero image upload error:', error);
                                                    setNotification({
                                                        isOpen: true,
                                                        title: 'Upload Failed',
                                                        message: error.message || 'Failed to upload hero image.',
                                                        type: 'error'
                                                    });
                                                }
                                            }}
                                        />
                                        <label htmlFor="hero-image-upload" className="cursor-pointer flex flex-col items-center justify-center">
                                            <svg className="h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                            <p className="text-gray-600 dark:text-gray-400 dark:text-gray-400 mb-2">Click to upload hero image</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-500">PNG, JPG, GIF, WebP</p>
                                        </label>
                                    </div>

                                    {formData.heroImage && (
                                        <div className="mt-2">
                                            <img src={formData.heroImage} alt="Hero preview" className="w-full h-32 object-cover rounded-lg border-2 border-green-500" />
                                            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                Hero image uploaded
                                            </p>
                                        </div>
                                    )}
                                    {!formData.heroImage && (
                                        <p className="text-xs text-red-500 mt-2">⚠️ Hero image is required</p>
                                    )}
                                </div>
                            </div>

                            {/* Pricing Tiers */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">Pricing Tiers</h4>
                                    <button
                                        type="button"
                                        onClick={addTier}
                                        className="flex items-center gap-2 text-[#FF6B35] hover:text-green-600 font-medium text-sm"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Tier
                                    </button>
                                </div>

                                {formData.pricingTiers.map((tier, tierIndex) => (
                                    <div key={tierIndex} className="bg-gray-50 dark:bg-gray-900 dark:bg-gray-900 p-4 rounded-lg space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h5 className="font-medium text-gray-900 dark:text-gray-100">Tier {tierIndex + 1}</h5>
                                            {formData.pricingTiers.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeTier(tierIndex)}
                                                    className="text-red-500 hover:text-red-600"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-3 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Tier Name</label>
                                                <input
                                                    type="text"
                                                    value={tier.name}
                                                    onChange={(e) => updateTier(tierIndex, 'name', e.target.value)}
                                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-[#FF6B35]"
                                                    placeholder="Basic"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Price (NPR)</label>
                                                <input
                                                    type="number"
                                                    value={tier.price}
                                                    onChange={(e) => updateTier(tierIndex, 'price', Number(e.target.value))}
                                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-[#FF6B35]"
                                                    required
                                                    min="0"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Duration</label>
                                                <select
                                                    value={tier.duration}
                                                    onChange={(e) => updateTier(tierIndex, 'duration', e.target.value)}
                                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-[#FF6B35]"
                                                >
                                                    <option value="year">Year</option>
                                                    <option value="month">Month</option>
                                                    <option value="quarter">Quarter</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Features</label>
                                            <div className="space-y-2">
                                                {tier.features.map((feature, featureIndex) => (
                                                    <div key={featureIndex} className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            value={feature}
                                                            onChange={(e) => updateFeature(tierIndex, featureIndex, e.target.value)}
                                                            className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-[#FF6B35]"
                                                            placeholder="Enter feature"
                                                            required
                                                        />
                                                        {tier.features.length > 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => removeFeature(tierIndex, featureIndex)}
                                                                className="px-2 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                                <button
                                                    type="button"
                                                    onClick={() => addFeature(tierIndex)}
                                                    className="flex items-center gap-2 text-[#FF6B35] hover:text-green-600 font-medium text-sm"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    Add Feature
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Why Choose Section */}
                            <div className="bg-gray-50 dark:bg-gray-900 dark:bg-gray-900 p-4 rounded-lg space-y-4">
                                <h4 className="font-semibold text-gray-900 dark:text-gray-100">Why Choose Section</h4>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Section Heading</label>
                                    <input
                                        type="text"
                                        value={formData.whyChooseHeading}
                                        onChange={(e) => setFormData({ ...formData, whyChooseHeading: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-[#FF6B35]"
                                        placeholder="e.g., Why Choose Our AMC Packages?"
                                        required
                                    />
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Benefits</label>
                                        <button
                                            type="button"
                                            onClick={addBenefit}
                                            className="flex items-center gap-2 text-[#FF6B35] hover:text-green-600 font-medium text-sm"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Add Benefit
                                        </button>
                                    </div>

                                    {formData.benefits.map((benefit, index) => (
                                        <div key={index} className="bg-white dark:bg-gray-800 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Benefit {index + 1}</span>
                                                {formData.benefits.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeBenefit(index)}
                                                        className="text-red-500 hover:text-red-600"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                            <input
                                                type="text"
                                                value={benefit.title}
                                                onChange={(e) => updateBenefit(index, 'title', e.target.value)}
                                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-[#FF6B35]"
                                                placeholder="Benefit title (e.g., Professional Service)"
                                                required
                                            />
                                            <textarea
                                                value={benefit.description}
                                                onChange={(e) => updateBenefit(index, 'description', e.target.value)}
                                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-[#FF6B35]"
                                                rows={2}
                                                placeholder="Benefit description"
                                                required
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="w-4 h-4 text-[#FF6B35] border-gray-300 dark:border-gray-600 rounded focus:ring-green-200"
                                />
                                <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Active Package
                                </label>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-900 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!formData.cardImage || !formData.heroImage}
                                    className={`flex-1 px-4 py-2 rounded-lg transition-colors ${formData.cardImage && formData.heroImage
                                        ? 'bg-[#FF6B35] hover:bg-green-600 text-white'
                                        : 'bg-gray-300 text-gray-500 dark:text-gray-500 cursor-not-allowed'
                                        }`}
                                    title={!formData.cardImage || !formData.heroImage ? 'Please upload both card and hero images' : ''}
                                >
                                    {editingPackage ? 'Update Package' : 'Create Package'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={deleteConfirm.isOpen}
                onClose={() => setDeleteConfirm({ isOpen: false, packageId: null })}
                onConfirm={confirmDelete}
                title="Delete Package"
                message="Are you sure you want to delete this AMC package? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                type="danger"
            />

            {/* Notification */}
            <Notification
                isOpen={notification.isOpen}
                onClose={() => setNotification({ ...notification, isOpen: false })}
                title={notification.title}
                message={notification.message}
                type={notification.type}
            />
        </div>
    );
}
