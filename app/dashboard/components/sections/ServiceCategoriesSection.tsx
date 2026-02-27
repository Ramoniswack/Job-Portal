'use client';

import React, { useState, useEffect } from 'react';
import ImageUpload from '@/app/components/ImageUpload';

interface ServiceCategory {
    _id: string;
    name: string;
    slug: string;
    description: string;
    image: string;
    parent: any;
    createdBy?: {
        _id: string;
        name: string;
        email: string;
    };
    createdAt: string;
}

interface ServiceCategoriesSectionProps {
    token: string;
}

export default function ServiceCategoriesSection({ token }: ServiceCategoriesSectionProps) {
    const [categories, setCategories] = useState<ServiceCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
    const [currentUserId, setCurrentUserId] = useState<string>('');
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        image: '',
        parent: ''
    });

    // Get current user ID
    useEffect(() => {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setCurrentUserId(user.id);
        }
    }, []);

    // Check if user can edit/delete a category
    const canModifyCategory = (category: ServiceCategory): boolean => {
        // Get current user from localStorage
        const storedUser = localStorage.getItem('currentUser');
        if (!storedUser) return false;

        const user = JSON.parse(storedUser);

        // Admin can modify everything
        if (user.role === 'admin') return true;

        // If category has no creator, only admin can modify
        if (!category.createdBy) return false;

        // User can only modify their own categories
        return category.createdBy._id === user.id;
    };

    useEffect(() => {
        if (token) {
            loadCategories();
        }
    }, [token]);

    const loadCategories = async () => {
        setLoading(true);
        try {
            console.log('=== LOADING CATEGORIES ===');
            console.log('Token exists:', !!token);
            console.log('Token length:', token?.length);
            console.log('API URL:', 'http://localhost:5000/api/categories');

            const response = await fetch('http://localhost:5000/api/categories', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);

            if (!response.ok) {
                const responseText = await response.text();
                console.error('Error response text:', responseText);

                let errorData;
                try {
                    errorData = JSON.parse(responseText);
                } catch (e) {
                    errorData = { message: responseText || 'Failed to parse error response' };
                }

                // If token is invalid, redirect to login
                if (response.status === 401 || errorData.message?.includes('Token is not valid')) {
                    console.error('Token is invalid, redirecting to login...');
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('currentUser');
                    alert('Your session has expired. Please login again.');
                    window.location.href = '/login';
                    return;
                }

                console.error('Parsed error data:', errorData);
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || 'Unknown error'}`);
            }

            const data = await response.json();
            console.log('Categories response:', data);

            if (data.success) {
                setCategories(data.data);
                console.log('✅ Categories loaded successfully:', data.data.length);
            } else {
                console.error('Failed to load categories:', data);
            }
        } catch (error) {
            console.error('Error loading categories:', error);
            // Don't show alert if we're redirecting to login
            if (!error.message?.includes('Token is not valid')) {
                alert(`Failed to load categories: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const url = editingCategory
                ? `http://localhost:5000/api/categories/${editingCategory._id}`
                : 'http://localhost:5000/api/categories';

            // Prepare data - convert empty parent to null
            const submitData = {
                ...formData,
                parent: formData.parent || null
            };

            console.log('=== SUBMITTING CATEGORY ===');
            console.log('Submitting to:', url);
            console.log('Method:', editingCategory ? 'PUT' : 'POST');
            console.log('Data:', submitData);
            console.log('Token exists:', !!token);
            console.log('Token length:', token?.length);

            const response = await fetch(url, {
                method: editingCategory ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(submitData)
            });

            console.log('Response status:', response.status);
            console.log('Response statusText:', response.statusText);
            console.log('Response ok:', response.ok);
            console.log('Response headers:', Object.fromEntries(response.headers.entries()));

            const text = await response.text();
            console.log('Response text length:', text.length);
            console.log('Response text:', text);

            if (!text) {
                console.error('❌ Empty response from server');
                alert('Server error: Empty response. Please check if backend is running.');
                return;
            }

            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                console.error('Failed to parse JSON:', text);
                alert('Server error: Invalid response format');
                return;
            }

            console.log('Parsed data:', data);

            if (data.success) {
                alert(editingCategory ? 'Category updated!' : 'Category created!');
                resetForm();
                loadCategories();
            } else {
                alert(data.message || 'Failed to save category');
                console.error('Error response:', data);
            }
        } catch (error) {
            console.error('Error saving category:', error);
            alert('Failed to save category: ' + error);
        }
    };

    const handleEdit = (category: ServiceCategory) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            slug: category.slug,
            description: category.description || '',
            image: category.image || '',
            parent: category.parent?._id || category.parent || ''
        });
    };

    const handleDelete = async (categoryId: string) => {
        if (!confirm('Are you sure you want to delete this category?')) return;

        try {
            const response = await fetch(`http://localhost:5000/api/categories/${categoryId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();
            if (data.success) {
                loadCategories();
            } else {
                alert(data.message || 'Failed to delete category');
            }
        } catch (error) {
            console.error('Error deleting category:', error);
            alert('Failed to delete category');
        }
    };

    const resetForm = () => {
        setEditingCategory(null);
        setFormData({
            name: '',
            slug: '',
            description: '',
            image: '',
            parent: ''
        });
    };

    const parentCategories = categories.filter(cat => !cat.parent);
    const getSubcategories = (parentId: string) => {
        return categories.filter(cat => cat.parent === parentId || cat.parent?._id === parentId);
    };

    const getCategoryCount = (categoryId: string) => {
        return getSubcategories(categoryId).length;
    };

    const toggleCategory = (categoryId: string) => {
        const newExpanded = new Set(expandedCategories);
        if (newExpanded.has(categoryId)) {
            newExpanded.delete(categoryId);
        } else {
            newExpanded.add(categoryId);
        }
        setExpandedCategories(newExpanded);
    };

    // Separate categories with and without subcategories
    const categoriesWithSubs = parentCategories.filter(cat => getCategoryCount(cat._id) > 0);
    const categoriesWithoutSubs = categories.filter(cat => !cat.parent && getCategoryCount(cat._id) === 0);

    // Combine: categories with subs first, then without subs
    const sortedCategories = [...categoriesWithSubs, ...categoriesWithoutSubs];

    const filteredCategories = sortedCategories.filter(cat =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-8">
            <div className="grid grid-cols-[350px_1fr] gap-6">
                {/* Left Side - Add/Edit Form */}
                <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-colors duration-300 ">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 transition-colors duration-300 ">
                        {editingCategory ? 'Edit Category' : 'Add Category'}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300 ">
                                Name *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[#26cf71] focus:border-transparent text-sm transition-colors duration-300 "
                                placeholder="Category name"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 transition-colors duration-300 ">The name is how it appears on your site.</p>
                        </div>

                        {/* Slug */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300 ">
                                Slug
                            </label>
                            <input
                                type="text"
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[#26cf71] focus:border-transparent text-sm transition-colors duration-300 "
                                placeholder="category-slug"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 transition-colors duration-300 ">
                                The "slug" is the URL-friendly version of the name.
                            </p>
                        </div>

                        {/* Parent Category */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300 ">
                                Parent Category
                            </label>
                            <select
                                value={formData.parent}
                                onChange={(e) => setFormData({ ...formData, parent: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[#26cf71] focus:border-transparent text-sm transition-colors duration-300 "
                            >
                                <option value="">None</option>
                                {parentCategories.map((cat) => (
                                    <option key={cat._id} value={cat._id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 transition-colors duration-300 ">
                                Categories can have a hierarchy.
                            </p>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300 ">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[#26cf71] focus:border-transparent text-sm transition-colors duration-300 "
                                placeholder="Category description"
                            />
                        </div>

                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300 ">
                                Category Image *
                            </label>

                            <ImageUpload
                                token={token}
                                multiple={false}
                                onUploadComplete={(imageUrl) => {
                                    setFormData({ ...formData, image: imageUrl });
                                }}
                            />

                            {/* Image Preview */}
                            {formData.image && (
                                <div className="mt-3">
                                    <p className="text-xs text-gray-500 dark:text-gray-500 mb-2 transition-colors duration-300 ">Preview:</p>
                                    <img
                                        src={formData.image}
                                        alt="Category preview"
                                        className="w-full h-40 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700 transition-colors duration-300 "
                                    />
                                </div>
                            )}
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-2 pt-2">
                            <button
                                type="submit"
                                disabled={!formData.image}
                                className="flex-1 px-4 py-2 bg-[#26cf71] text-white rounded-md hover:bg-[#1fb35f] transition text-sm font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                {editingCategory ? 'Update' : 'Add New Category'}
                            </button>
                            {editingCategory && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-4 py-2 bg-[#F1F3F5] text-gray-700 dark:text-gray-300 rounded-md hover:bg-[#E9ECEF] transition text-sm transition-colors duration-300 "
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Right Side - Categories Table */}
                <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-lg shadow-sm transition-colors duration-300 ">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between transition-colors duration-300 ">
                        <div className="flex items-center gap-4">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 transition-colors duration-300 ">Categories</h2>
                            <span className="text-sm text-gray-500 dark:text-gray-500 transition-colors duration-300 ">{categories.length} items</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                placeholder="Search Categories"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:ring-2 focus:ring-[#26cf71] focus:border-transparent transition-colors duration-300 "
                            />
                        </div>
                    </div>

                    {/* Table */}
                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#26cf71] mx-auto"></div>
                            <p className="mt-4 text-gray-600 dark:text-gray-400 dark:text-gray-500 transition-colors duration-300 ">Loading categories...</p>
                        </div>
                    ) : filteredCategories.length === 0 ? (
                        <div className="p-12 text-center">
                            <span className="material-symbols-outlined text-gray-300 text-6xl">category</span>
                            <p className="mt-4 text-gray-600 dark:text-gray-400 dark:text-gray-500 transition-colors duration-300 ">No categories found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-900 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300 ">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider transition-colors duration-300 ">
                                            <input type="checkbox" className="rounded" />
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider transition-colors duration-300 ">
                                            Name
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider transition-colors duration-300 ">
                                            Description
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider transition-colors duration-300 ">
                                            Slug
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider transition-colors duration-300 ">
                                            Count
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 dark:bg-gray-800 divide-y divide-gray-200 transition-colors duration-300 ">
                                    {filteredCategories.map((category) => {
                                        const subcats = getSubcategories(category._id);
                                        const hasSubcategories = subcats.length > 0;
                                        const isExpanded = expandedCategories.has(category._id);

                                        return (
                                            <React.Fragment key={category._id}>
                                                <tr className="hover:bg-gray-50 dark:bg-gray-900 transition-colors duration-300 ">
                                                    <td className="px-4 py-3">
                                                        <input type="checkbox" className="rounded" />
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            {hasSubcategories && (
                                                                <button
                                                                    onClick={() => toggleCategory(category._id)}
                                                                    className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:text-gray-500 transition-colors duration-300 "
                                                                >
                                                                    <span className="material-symbols-outlined text-[18px]">
                                                                        {isExpanded ? 'expand_more' : 'chevron_right'}
                                                                    </span>
                                                                </button>
                                                            )}
                                                            {canModifyCategory(category) ? (
                                                                <a
                                                                    href="#"
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        handleEdit(category);
                                                                    }}
                                                                    className="text-blue-600 hover:text-blue-800 font-medium"
                                                                >
                                                                    {category.name}
                                                                </a>
                                                            ) : (
                                                                <span className="font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300 ">{category.name}</span>
                                                            )}
                                                            {hasSubcategories && (
                                                                <span className="text-xs text-gray-500 dark:text-gray-500 bg-[#F1F3F5] px-2 py-0.5 rounded-full transition-colors duration-300 ">
                                                                    {subcats.length}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {canModifyCategory(category) && (
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <button
                                                                    onClick={() => handleEdit(category)}
                                                                    className="text-xs text-blue-600 hover:text-blue-800"
                                                                >
                                                                    Edit
                                                                </button>
                                                                <span className="text-gray-300">|</span>
                                                                <button
                                                                    onClick={() => handleDelete(category._id)}
                                                                    className="text-xs text-red-600 hover:text-red-800"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500 transition-colors duration-300 ">
                                                        {category.description || '—'}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500 transition-colors duration-300 ">
                                                        {category.slug}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500 transition-colors duration-300 ">
                                                        {hasSubcategories ? subcats.length : '—'}
                                                    </td>
                                                </tr>
                                                {/* Subcategories - Only show when expanded */}
                                                {hasSubcategories && isExpanded && subcats.map((subcat) => (
                                                    <tr key={subcat._id} className="hover:bg-gray-50 dark:bg-gray-900 bg-blue-50/30 transition-colors duration-300 ">
                                                        <td className="px-4 py-3">
                                                            <input type="checkbox" className="rounded" />
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-2 pl-8">
                                                                <span className="text-gray-400 dark:text-gray-500 transition-colors duration-300 ">└─</span>
                                                                {canModifyCategory(subcat) ? (
                                                                    <a
                                                                        href="#"
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            handleEdit(subcat);
                                                                        }}
                                                                        className="text-blue-600 hover:text-blue-800 font-medium"
                                                                    >
                                                                        {subcat.name}
                                                                    </a>
                                                                ) : (
                                                                    <span className="font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300 ">{subcat.name}</span>
                                                                )}
                                                            </div>
                                                            {canModifyCategory(subcat) && (
                                                                <div className="flex items-center gap-2 mt-1 pl-8">
                                                                    <button
                                                                        onClick={() => handleEdit(subcat)}
                                                                        className="text-xs text-blue-600 hover:text-blue-800"
                                                                    >
                                                                        Edit
                                                                    </button>
                                                                    <span className="text-gray-300">|</span>
                                                                    <button
                                                                        onClick={() => handleDelete(subcat._id)}
                                                                        className="text-xs text-red-600 hover:text-red-800"
                                                                    >
                                                                        Delete
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500 transition-colors duration-300 ">
                                                            {subcat.description || '—'}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500 transition-colors duration-300 ">
                                                            {subcat.slug}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500 transition-colors duration-300 ">
                                                            —
                                                        </td>
                                                    </tr>
                                                ))}
                                            </React.Fragment>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

