'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import ConfirmDialog from '@/app/components/ConfirmDialog';
import ImageUpload from '@/app/components/ImageUpload';
import { Star } from 'lucide-react';

interface Category {
    _id: string;
    name: string;
    slug: string;
    parent: string | { _id: string; name: string } | null;
}

interface Service {
    _id: string;
    title: string;
    slug: string;
    description: string;
    shortDescription: string;
    category: Category | string | null;
    subCategory: string;
    price: number;
    originalPrice?: number;
    discount: number;
    currency: string;
    priceUnit: 'fixed' | 'hourly' | 'daily';
    priceLabel: string;
    rating: number;
    images: Array<{
        url: string;
        alt?: string;
        isPrimary: boolean;
    }>;
    features: string[];
    status: 'active' | 'inactive' | 'draft';
    featured: boolean;
    createdBy?: {
        _id: string;
        name: string;
        email: string;
    };
    createdAt: string;
}

interface ServicesSectionProps {
    token: string;
}

export default function ServicesSection({ token }: ServicesSectionProps) {
    const [services, setServices] = useState<Service[]>([]);
    const [allCategories, setAllCategories] = useState<Category[]>([]);
    const [parentCategories, setParentCategories] = useState<Category[]>([]);
    const [subCategories, setSubCategories] = useState<Category[]>([]);
    const [selectedParent, setSelectedParent] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; serviceId: string | null }>({
        isOpen: false,
        serviceId: null
    });

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
        loadServices();
        loadCategories();
    }, []);

    // Check if user can edit/delete a service
    const canModifyService = (service: Service): boolean => {
        // Get current user from localStorage
        const storedUser = localStorage.getItem('currentUser');
        if (!storedUser) return false;

        const user = JSON.parse(storedUser);

        // Admin can modify everything
        if (user.role === 'admin') return true;

        // If service has no creator, only admin can modify
        if (!service.createdBy) return false;

        // User can only modify their own services
        return service.createdBy._id === user.id;
    };

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
        } else {
            setSubCategories([]);
        }
    }, [selectedParent, allCategories]);

    const loadServices = async () => {
        setLoading(true);
        try {
            console.log('Loading services from:', 'http://localhost:5000/api/services');
            const response = await fetch('http://localhost:5000/api/services');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Services loaded:', data.length, 'services');
            console.log('Sample service category structure:', data[0]?.category);
            setServices(data);
        } catch (error) {
            console.error('Error loading services:', error);
            toast.error('Failed to Load Services', {
                description: 'Make sure backend server is running on port 5000.',
                duration: 4000,
            });
        } finally {
            setLoading(false);
        }
    };

    const loadCategories = async () => {
        try {
            console.log('Loading categories from:', 'http://localhost:5000/api/categories/all');
            const response = await fetch('http://localhost:5000/api/categories/all');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Categories loaded:', data.length, 'categories');
            setAllCategories(data);

            // Separate parent and subcategories
            const parents = data.filter((cat: Category) => !cat.parent);
            setParentCategories(parents);
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            // Validate required fields
            if (!formData.title || !formData.description || !formData.price) {
                toast.error('Missing Required Fields', {
                    description: 'Please fill in title, description, and price.',
                    duration: 4000,
                });
                return;
            }

            // Validate at least one image
            const validImages = formData.images.filter(url => url.trim());
            if (validImages.length === 0) {
                toast.error('Image Required', {
                    description: 'Please upload at least one service image.',
                    duration: 4000,
                });
                return;
            }

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
                images: validImages.map((url, index) => ({
                    url: url.trim(),
                    isPrimary: index === 0
                })),
                features: formData.features.filter(f => f.trim()),
                status: formData.status,
                featured: formData.featured,
                popular: formData.popular
            };

            console.log('Submitting service data:', submitData);

            const url = editingService
                ? `http://localhost:5000/api/services/${editingService._id}`
                : 'http://localhost:5000/api/services';

            const response = await fetch(url, {
                method: editingService ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(submitData)
            });

            console.log('Response status:', response.status);

            if (response.ok) {
                const result = await response.json();
                console.log('Success response:', result);

                toast.success(
                    editingService ? 'Service Updated!' : 'Service Created!',
                    {
                        description: editingService
                            ? 'Your service has been updated successfully.'
                            : 'Your service has been created successfully and is now live.',
                        duration: 4000,
                    }
                );
                resetForm();
                loadServices();
            } else {
                // Log the raw response text first
                const responseText = await response.text();
                console.error('Error response status:', response.status);
                console.error('Error response text:', responseText);

                let error;
                try {
                    error = JSON.parse(responseText);
                } catch (e) {
                    error = { message: `Server error (${response.status})` };
                }

                console.error('Parsed error response:', error);
                toast.error('Failed to Save Service', {
                    description: error.message || `Server error (${response.status}). Please check your input and try again.`,
                    duration: 4000,
                });
            }
        } catch (error) {
            console.error('Error saving service:', error);
            toast.error('Connection Error', {
                description: 'Failed to save service. Please check your connection and try again.',
                duration: 4000,
            });
        }
    };

    const handleEdit = (service: Service) => {
        setEditingService(service);

        // Find parent category if service has a category
        let parentId = '';
        if (service.category && typeof service.category === 'object') {
            const categoryId = service.category._id;
            const categoryObj = allCategories.find(cat => cat._id === categoryId);
            if (categoryObj && categoryObj.parent) {
                // Handle both string and object parent
                parentId = typeof categoryObj.parent === 'object' ? categoryObj.parent._id : categoryObj.parent;
            }
        }

        console.log('Editing service, parent ID:', parentId);
        setSelectedParent(parentId);

        setFormData({
            title: service.title,
            description: service.description,
            shortDescription: service.shortDescription || '',
            category: service.category && typeof service.category === 'object'
                ? service.category._id
                : service.category || '',
            subCategory: service.subCategory || '',
            location: (service as any).location || 'Kathmandu',
            price: service.price.toString(),
            originalPrice: service.originalPrice?.toString() || '',
            discount: service.discount.toString(),
            priceUnit: service.priceUnit,
            rating: service.rating?.toString() || '0',
            images: [
                service.images[0]?.url || '',
                service.images[1]?.url || '',
                service.images[2]?.url || '',
                service.images[3]?.url || ''
            ],
            features: service.features.length > 0 ? service.features : [''],
            status: service.status,
            featured: service.featured,
            popular: (service as any).popular || false
        });
        setShowForm(true);
    };

    const handleDelete = async (serviceId: string) => {
        setDeleteConfirm({ isOpen: true, serviceId });
    };

    const confirmDelete = async () => {
        if (!deleteConfirm.serviceId) return;

        try {
            const response = await fetch(`http://localhost:5000/api/services/${deleteConfirm.serviceId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                toast.success('Service Deleted', {
                    description: 'The service has been deleted successfully.',
                    duration: 4000,
                });
                loadServices();
            } else {
                const error = await response.json();
                toast.error('Failed to Delete', {
                    description: error.message || 'Unable to delete the service.',
                    duration: 4000,
                });
            }
        } catch (error) {
            console.error('Error deleting service:', error);
            toast.error('Connection Error', {
                description: 'Failed to delete service. Please try again.',
                duration: 4000,
            });
        } finally {
            setDeleteConfirm({ isOpen: false, serviceId: null });
        }
    };

    const resetForm = () => {
        setEditingService(null);
        setShowForm(false);
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

    const filteredServices = services.filter(service => {
        const matchesSearch = service.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'all' || service.status === filterStatus;

        // Handle category filtering with null checks
        let matchesCategory = filterCategory === 'all';
        if (!matchesCategory && service.category) {
            if (typeof service.category === 'object') {
                matchesCategory = service.category._id === filterCategory;
            } else {
                matchesCategory = service.category === filterCategory;
            }
        }

        // Debug logging
        if (filterCategory !== 'all') {
            console.log('Filtering service:', service.title);
            console.log('  Service category:', service.category);
            console.log('  Filter category:', filterCategory);
            console.log('  Matches:', matchesCategory);
        }

        return matchesSearch && matchesStatus && matchesCategory;
    });

    const getStatusBadge = (status: string) => {
        const styles = {
            active: 'bg-[#F1F3F5] text-green-800',
            inactive: 'bg-[#F1F3F5] text-gray-800 dark:text-gray-100',
            draft: 'bg-yellow-100 text-yellow-800'
        };
        return styles[status as keyof typeof styles] || styles.draft;
    };

    if (showForm) {
        return (
            <div className="p-8">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 transition-colors duration-300 ">
                            {editingService ? 'Edit Service' : 'Add New Service'}
                        </h2>
                        <p className="text-gray-500 dark:text-gray-500 mt-1 transition-colors duration-300 ">Fill in the service details below</p>
                    </div>
                    <button
                        onClick={resetForm}
                        className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:text-gray-100 transition-colors duration-300 "
                    >
                        <span className="material-symbols-outlined">close</span>
                        Cancel
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-lg shadow-sm p-6 space-y-6 transition-colors duration-300 ">
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 transition-colors duration-300 ">Basic Information</h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300 ">
                                Service Title *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[#26cf71] focus:border-transparent transition-colors duration-300 "
                                placeholder="e.g., Professional Home Cleaning"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300 ">
                                Short Description
                            </label>
                            <input
                                type="text"
                                value={formData.shortDescription}
                                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[#26cf71] focus:border-transparent transition-colors duration-300 "
                                placeholder="Brief one-line description"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300 ">
                                Full Description *
                            </label>
                            <textarea
                                required
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[#26cf71] focus:border-transparent transition-colors duration-300 "
                                placeholder="Detailed description of the service"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300 ">
                                    Parent Category *
                                </label>
                                <select
                                    required
                                    value={selectedParent}
                                    onChange={(e) => setSelectedParent(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[#26cf71] focus:border-transparent transition-colors duration-300 "
                                >
                                    <option value="">Select Parent Category</option>
                                    {parentCategories.map((cat) => (
                                        <option key={cat._id} value={cat._id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300 ">
                                    Sub Category *
                                </label>
                                <select
                                    required
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    disabled={!selectedParent}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[#26cf71] focus:border-transparent disabled:bg-[#F1F3F5] disabled:cursor-not-allowed transition-colors duration-300 "
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
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300 ">
                                Location *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[#26cf71] focus:border-transparent transition-colors duration-300 "
                                placeholder="e.g., Kathmandu, Pokhara, Lalitpur"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 transition-colors duration-300 ">Enter the city where this service is available</p>
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="space-y-4 pt-6 border-t">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 transition-colors duration-300 ">Pricing</h3>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300 ">
                                    Price (NPR) *
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[#26cf71] focus:border-transparent transition-colors duration-300 "
                                    placeholder="0.00"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300 ">
                                    Original Price (NPR)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.originalPrice}
                                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[#26cf71] focus:border-transparent transition-colors duration-300 "
                                    placeholder="0.00"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300 ">
                                    Discount (%)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={formData.discount}
                                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[#26cf71] focus:border-transparent transition-colors duration-300 "
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300 ">
                                Price Unit
                            </label>
                            <select
                                value={formData.priceUnit}
                                onChange={(e) => setFormData({ ...formData, priceUnit: e.target.value as any })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[#26cf71] focus:border-transparent transition-colors duration-300 "
                            >
                                <option value="fixed">Fixed Price</option>
                                <option value="hourly">Per Hour</option>
                                <option value="daily">Per Day</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300 ">
                                Rating (0-5)
                            </label>
                            <input
                                type="number"
                                min="0"
                                max="5"
                                step="0.1"
                                value={formData.rating}
                                onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[#26cf71] focus:border-transparent transition-colors duration-300 "
                                placeholder="4.5"
                            />
                        </div>
                    </div>

                    {/* Images */}
                    <div className="space-y-4 pt-6 border-t">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 transition-colors duration-300 ">Service Images</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-500 transition-colors duration-300 ">Upload up to 5 images. First image will be the primary/thumbnail image.</p>

                        <ImageUpload
                            onUploadComplete={handleImageUpload}
                            multiple={true}
                            maxFiles={5}
                            token={token}
                        />

                        {/* Display uploaded images */}
                        {formData.images.filter(img => img).length > 0 && (
                            <div className="mt-4">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300 ">
                                    Uploaded Images ({formData.images.filter(img => img).length})
                                </p>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {formData.images.filter(img => img).map((imageUrl, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={imageUrl}
                                                alt={`Service ${index + 1}`}
                                                className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700 transition-colors duration-300 "
                                            />
                                            {index === 0 && (
                                                <div className="absolute top-2 left-2 bg-[#26cf71] text-white text-xs px-2 py-1 rounded">
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
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 transition-colors duration-300 ">Features</h3>
                            <button
                                type="button"
                                onClick={addFeature}
                                className="flex items-center gap-1 text-sm text-[#26cf71] hover:text-[#1fb35f]"
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
                                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[#26cf71] focus:border-transparent transition-colors duration-300 "
                                    placeholder="Feature description"
                                />
                                {formData.features.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeFeature(index)}
                                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">delete</span>
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Status & Settings */}
                    <div className="space-y-4 pt-6 border-t">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 transition-colors duration-300 ">Status & Settings</h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300 ">
                                    Status
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[#26cf71] focus:border-transparent transition-colors duration-300 "
                                >
                                    <option value="draft">Draft</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>

                            <div className="space-y-2 pt-7">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.featured}
                                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                                        className="w-4 h-4 text-[#26cf71] border-gray-300 dark:border-gray-600 rounded focus:ring-[#26cf71] transition-colors duration-300 "
                                    />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300 ">Featured</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.popular}
                                        onChange={(e) => setFormData({ ...formData, popular: e.target.checked })}
                                        className="w-4 h-4 text-[#26cf71] border-gray-300 dark:border-gray-600 rounded focus:ring-[#26cf71] transition-colors duration-300 "
                                    />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300 ">Popular</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex gap-3 pt-6 border-t">
                        <button
                            type="submit"
                            className="flex-1 px-6 py-3 bg-[#f97316] text-white rounded-lg hover:bg-[#ea580c] transition font-medium"
                        >
                            {editingService ? 'Update Service' : 'Create Service'}
                        </button>
                        <button
                            type="button"
                            onClick={resetForm}
                            className="px-6 py-3 bg-[#F1F3F5] text-gray-700 dark:text-gray-300 rounded-lg hover:bg-[#E9ECEF] transition font-medium transition-colors duration-300 "
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 transition-colors duration-300 ">Services</h2>
                    <p className="text-gray-500 dark:text-gray-500 mt-1 transition-colors duration-300 ">Manage all services offered on the platform</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition font-medium transition-colors duration-300 "
                >
                    <span className="material-symbols-outlined">add</span>
                    Add Service
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6 transition-colors duration-300 ">
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <input
                            type="text"
                            placeholder="Search services..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[#26cf71] focus:border-transparent transition-colors duration-300 "
                        />
                    </div>
                    <div>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[#26cf71] focus:border-transparent transition-colors duration-300 "
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="draft">Draft</option>
                        </select>
                    </div>
                    <div>
                        <select
                            value={filterCategory}
                            onChange={(e) => {
                                console.log('Filter category changed to:', e.target.value);
                                setFilterCategory(e.target.value);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[#26cf71] focus:border-transparent transition-colors duration-300 "
                        >
                            <option value="all">All Categories</option>
                            {allCategories
                                .filter(cat => cat.parent) // Only show subcategories in filter
                                .map((cat) => (
                                    <option key={cat._id} value={cat._id}>
                                        {cat.name}
                                    </option>
                                ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Services List */}
            {loading ? (
                <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center transition-colors duration-300 ">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#26cf71] mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400 dark:text-gray-500 transition-colors duration-300 ">Loading services...</p>
                </div>
            ) : filteredServices.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center transition-colors duration-300 ">
                    <span className="material-symbols-outlined text-gray-300 text-6xl">inventory_2</span>
                    <p className="mt-4 text-gray-600 dark:text-gray-400 dark:text-gray-500 transition-colors duration-300 ">No services found</p>
                    <button
                        onClick={() => setShowForm(true)}
                        className="mt-4 text-[#26cf71] hover:text-[#1fb35f] font-medium"
                    >
                        Add your first service
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredServices.map((service) => (
                        <div key={service._id} className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition transition-colors duration-300 ">
                            {/* Image */}
                            <div className="relative h-48 bg-[#E9ECEF]">
                                {service.images[0]?.url && (
                                    <img
                                        src={service.images[0].url}
                                        alt={service.title}
                                        className="w-full h-full object-cover"
                                    />
                                )}
                                <div className="absolute top-2 right-2 flex gap-2">
                                    {service.featured && (
                                        <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-medium rounded">
                                            Featured
                                        </span>
                                    )}
                                    <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusBadge(service.status)}`}>
                                        {service.status}
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-4">
                                <a
                                    href={`/service/${service.slug}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-semibold text-gray-900 dark:text-gray-100 mb-1 line-clamp-1 transition-colors duration-300 hover:text-[#FF6B35] cursor-pointer block"
                                >
                                    {service.title}
                                </a>
                                {service.createdBy && (
                                    <p className="text-xs text-gray-500 dark:text-gray-500 mb-2 transition-colors duration-300 ">
                                        Posted by <span className="font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300 ">{service.createdBy.name}</span>
                                    </p>
                                )}
                                <p className="text-sm text-gray-500 dark:text-gray-500 mb-2 transition-colors duration-300 ">
                                    {service.category && typeof service.category === 'object'
                                        ? service.category.name
                                        : service.category
                                            ? 'Category'
                                            : 'No Category'}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500 line-clamp-2 mb-3 transition-colors duration-300 ">
                                    {service.shortDescription || service.description}
                                </p>

                                {/* Rating */}
                                {service.rating > 0 && (
                                    <div className="flex items-center gap-1 mb-2">
                                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300 ">{service.rating.toFixed(1)}</span>
                                    </div>
                                )}

                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-lg font-bold text-[#f97316]">
                                        {service.priceLabel}
                                    </span>
                                    {service.discount > 0 && (
                                        <span className="text-xs text-red-600 font-medium">
                                            {service.discount}% OFF
                                        </span>
                                    )}
                                </div>

                                {/* Actions */}
                                {canModifyService(service) && (
                                    <div className="flex gap-2 pt-3 border-t">
                                        <button
                                            onClick={() => handleEdit(service)}
                                            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded transition"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">edit</span>
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(service._id)}
                                            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded transition"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">delete</span>
                                            Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={deleteConfirm.isOpen}
                onClose={() => setDeleteConfirm({ isOpen: false, serviceId: null })}
                onConfirm={confirmDelete}
                title="Delete Service"
                message="Are you sure you want to delete this service? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                type="danger"
            />
        </div>
    );
}

