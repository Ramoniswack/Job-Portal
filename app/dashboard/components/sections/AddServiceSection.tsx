'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import ImageUpload from '@/app/components/ImageUpload';

interface Category {
    _id: string;
    name: string;
    slug: string;
    parent: string | { _id: string; name: string } | null;
}

interface AddServiceSectionProps {
    token: string;
}

export default function AddServiceSection({ token }: AddServiceSectionProps) {
    const router = useRouter();
    const [allCategories, setAllCategories] = useState<Category[]>([]);
    const [parentCategories, setParentCategories] = useState<Category[]>([]);
    const [subCategories, setSubCategories] = useState<Category[]>([]);
    const [selectedParent, setSelectedParent] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        shortDescription: '',
        category: '',
        subCategory: '',
        location: 'Kathmandu',
        price: '',
        originalPrice: '',
        discount: '0',
        priceUnit: 'fixed' as 'fixed' | 'hourly' | 'daily',
        rating: '0',
        images: ['', '', '', ''],
        features: [''],
        status: 'draft' as 'active' | 'inactive' | 'draft',
        featured: false,
        popular: false
    });

    useEffect(() => {
        loadCategories();
    }, []);

    useEffect(() => {
        // When parent category changes, update subcategories
        if (selectedParent) {
            const subs = allCategories.filter(cat => {
                // Handle both string and object parent
                if (cat.parent) {
                    const parentId = typeof cat.parent === 'object' ? cat.parent._id : cat.parent;
                    return parentId === selectedParent;
                }
                return false;
            });
            console.log('Selected parent:', selectedParent);
            console.log('Filtered subcategories:', subs);
            setSubCategories(subs);
            // Reset selected subcategory when parent changes
            setFormData(prev => ({ ...prev, category: '' }));
        } else {
            setSubCategories([]);
        }
    }, [selectedParent, allCategories]);

    const loadCategories = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/categories/all');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setAllCategories(data);

            // Separate parent and subcategories
            const parents = data.filter((cat: Category) => !cat.parent);
            setParentCategories(parents);
        } catch (error) {
            console.error('Error loading categories:', error);
            toast.error('Failed to Load Categories', {
                description: 'Make sure the backend server is running.',
                duration: 4000,
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const submitData = {
                title: formData.title,
                description: formData.description,
                shortDescription: formData.shortDescription,
                category: formData.category || null,
                subCategory: formData.subCategory || '',
                location: formData.location,
                price: parseFloat(formData.price),
                originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
                discount: parseFloat(formData.discount),
                priceUnit: formData.priceUnit,
                rating: parseFloat(formData.rating),
                images: formData.images
                    .filter(url => url.trim())
                    .map((url, index) => ({
                        url: url.trim(),
                        isPrimary: index === 0
                    })),
                features: formData.features.filter(f => f.trim()),
                status: formData.status,
                featured: formData.featured,
                popular: formData.popular
            };

            console.log('Creating service:', submitData);

            const response = await fetch('http://localhost:5000/api/services', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(submitData)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                toast.success('Service Created!', {
                    description: 'Your service has been created successfully and is now live.',
                    duration: 4000,
                });
                resetForm();
                // Optionally redirect to all services
                // router.push('/hamrosewa?section=services');
            } else {
                toast.error('Failed to Create Service', {
                    description: result.message || 'Please check your input and try again.',
                    duration: 4000,
                });
            }
        } catch (error) {
            console.error('Error creating service:', error);
            toast.error('Connection Error', {
                description: 'Failed to create service. Please check your connection and try again.',
                duration: 4000,
            });
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setSelectedParent('');
        setFormData({
            title: '',
            description: '',
            shortDescription: '',
            category: '',
            subCategory: '',
            location: 'Kathmandu',
            price: '',
            originalPrice: '',
            discount: '0',
            priceUnit: 'fixed',
            rating: '0',
            images: ['', '', '', ''],
            features: [''],
            status: 'draft',
            featured: false,
            popular: false
        });
    };

    const addFeature = () => {
        setFormData({ ...formData, features: [...formData.features, ''] });
    };

    const removeFeature = (index: number) => {
        const newFeatures = formData.features.filter((_, i) => i !== index);
        setFormData({ ...formData, features: newFeatures });
    };

    const updateFeature = (index: number, value: string) => {
        const newFeatures = [...formData.features];
        newFeatures[index] = value;
        setFormData({ ...formData, features: newFeatures });
    };

    const updateImage = (index: number, value: string) => {
        const newImages = [...formData.images];
        newImages[index] = value;
        setFormData({ ...formData, images: newImages });
    };

    const handleImageUpload = (imageUrl: string, publicId: string) => {
        setFormData(prev => ({
            ...prev,
            images: [...prev.images.filter(img => img), imageUrl]
        }));
    };

    const removeImage = (index: number) => {
        const newImages = [...formData.images];
        newImages.splice(index, 1);
        setFormData({ ...formData, images: newImages });
    };

    return (
        <div className="p-8">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Add New Service</h2>
                <p className="text-gray-500 mt-1">Create a new service offering for your platform</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#f97316]">info</span>
                        Basic Information
                    </h3>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Service Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-gray-900 focus:outline-none"
                            placeholder="e.g., Professional Home Cleaning Service"
                        />
                        <p className="text-xs text-gray-500 mt-1">A clear, descriptive title for your service</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Short Description
                        </label>
                        <input
                            type="text"
                            value={formData.shortDescription}
                            onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-gray-900 focus:outline-none"
                            placeholder="Brief one-line description"
                            maxLength={100}
                        />
                        <p className="text-xs text-gray-500 mt-1">Short summary shown in service cards (max 100 characters)</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            required
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={5}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-gray-900 focus:outline-none"
                            placeholder="Detailed description of the service, what's included, benefits, etc."
                        />
                        <p className="text-xs text-gray-500 mt-1">Comprehensive details about the service</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Parent Category <span className="text-red-500">*</span>
                            </label>
                            <select
                                required
                                value={selectedParent}
                                onChange={(e) => setSelectedParent(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-gray-900 focus:outline-none"
                            >
                                <option value="">Select Parent Category</option>
                                {parentCategories.map((cat) => (
                                    <option key={cat._id} value={cat._id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">Select the main category first</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Sub Category <span className="text-red-500">*</span>
                            </label>
                            <select
                                required
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                disabled={!selectedParent}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-gray-900 focus:outline-none disabled:bg-[#F1F3F5] disabled:cursor-not-allowed"
                            >
                                <option value="">
                                    {selectedParent ? 'Select Sub Category' : 'Select parent first'}
                                </option>
                                {subCategories.map((cat) => (
                                    <option key={cat._id} value={cat._id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                                {selectedParent
                                    ? 'Select the specific subcategory'
                                    : 'Choose a parent category first'}
                            </p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Location <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-gray-900 focus:outline-none"
                            placeholder="e.g., Kathmandu, Pokhara, Lalitpur"
                        />
                        <p className="text-xs text-gray-500 mt-1">Enter the city where this service is available</p>
                    </div>
                </div>

                {/* Pricing */}
                <div className="space-y-4 pt-6 border-t">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#f97316]">payments</span>
                        Pricing
                    </h3>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Price (NPR) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                required
                                min="0"
                                step="0.01"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-gray-900 focus:outline-none"
                                placeholder="0.00"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Original Price (NPR)
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.originalPrice}
                                onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-gray-900 focus:outline-none"
                                placeholder="0.00"
                            />
                            <p className="text-xs text-gray-500 mt-1">For showing discounts</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Discount (%)
                            </label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={formData.discount}
                                onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-gray-900 focus:outline-none"
                                placeholder="0"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Price Unit
                        </label>
                        <select
                            value={formData.priceUnit}
                            onChange={(e) => setFormData({ ...formData, priceUnit: e.target.value as any })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-gray-900 focus:outline-none"
                        >
                            <option value="fixed">Fixed Price</option>
                            <option value="hourly">Per Hour</option>
                            <option value="daily">Per Day</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">How the price is calculated</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Rating (0-5)
                        </label>
                        <input
                            type="number"
                            min="0"
                            max="5"
                            step="0.1"
                            value={formData.rating}
                            onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-gray-900 focus:outline-none"
                            placeholder="4.5"
                        />
                        <p className="text-xs text-gray-500 mt-1">Service rating (0 to 5 stars)</p>
                    </div>
                </div>

                {/* Images */}
                <div className="space-y-4 pt-6 border-t">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#f97316]">image</span>
                        Service Images
                    </h3>
                    <p className="text-sm text-gray-500">Upload up to 5 images. First image will be the primary/thumbnail image.</p>

                    <ImageUpload
                        onUploadComplete={handleImageUpload}
                        multiple={true}
                        maxFiles={5}
                        token={token}
                    />

                    {/* Display uploaded images */}
                    {formData.images.filter(img => img).length > 0 && (
                        <div className="mt-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">
                                Uploaded Images ({formData.images.filter(img => img).length})
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {formData.images.filter(img => img).map((imageUrl, index) => (
                                    <div key={index} className="relative group">
                                        <img
                                            src={imageUrl}
                                            alt={`Service ${index + 1}`}
                                            className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                                        />
                                        {index === 0 && (
                                            <div className="absolute top-2 left-2 bg-[#f97316] text-white text-xs px-2 py-1 rounded">
                                                Primary
                                            </div>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">close</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Features */}
                <div className="space-y-4 pt-6 border-t">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#f97316]">check_circle</span>
                            Features & Highlights
                        </h3>
                        <button
                            type="button"
                            onClick={addFeature}
                            className="flex items-center gap-1 text-sm text-[#f97316] hover:text-[#ea580c] font-medium"
                        >
                            <span className="material-symbols-outlined text-[18px]">add</span>
                            Add Feature
                        </button>
                    </div>

                    {formData.features.map((feature, index) => (
                        <div key={index} className="flex gap-2">
                            <input
                                type="text"
                                value={feature}
                                onChange={(e) => updateFeature(index, e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:border-gray-900 focus:outline-none"
                                placeholder="e.g., Professional equipment included"
                            />
                            {formData.features.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeFeature(index)}
                                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition"
                                >
                                    <span className="material-symbols-outlined text-[20px]">delete</span>
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {/* Status & Settings */}
                <div className="space-y-4 pt-6 border-t">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#f97316]">settings</span>
                        Status & Settings
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                            </label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-gray-900 focus:outline-none"
                            >
                                <option value="draft">Draft (Not visible to public)</option>
                                <option value="active">Active (Live and visible)</option>
                                <option value="inactive">Inactive (Hidden)</option>
                            </select>
                        </div>

                        <div className="space-y-3 pt-7">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.featured}
                                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                                    className="w-4 h-4 text-[#f97316] border-gray-300 rounded focus:ring-gray-900"
                                />
                                <span className="text-sm font-medium text-gray-700">Featured Service</span>
                                <span className="text-xs text-gray-500">(Shows in Featured section)</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.popular}
                                    onChange={(e) => setFormData({ ...formData, popular: e.target.checked })}
                                    className="w-4 h-4 text-[#f97316] border-gray-300 rounded focus:ring-gray-900"
                                />
                                <span className="text-sm font-medium text-gray-700">Popular Service</span>
                                <span className="text-xs text-gray-500">(Shows in Popular section)</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3 pt-6 border-t">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-[#f97316] text-white hover:bg-[#ea580c] h-10 px-6 py-3"
                    >
                        {loading ? (
                            <>
                                <span className="material-symbols-outlined animate-spin">refresh</span>
                                Creating...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined">add_circle</span>
                                Create Service
                            </>
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={resetForm}
                        disabled={loading}
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-gray-300 bg-white hover:bg-gray-50 h-10 px-6 py-3"
                    >
                        Reset Form
                    </button>
                </div>
            </form>
        </div>
    );
}





