'use client';

import React, { useState, useEffect } from 'react';

interface ServiceCategory {
    _id: string;
    name: string;
    slug: string;
    description: string;
    image: string;
    parent: any;
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
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        image: '',
        parent: ''
    });

    useEffect(() => {
        if (token) {
            loadCategories();
        }
    }, [token]);

    const loadCategories = async () => {
        setLoading(true);
        try {
            console.log('Loading categories with token:', token ? 'Token exists' : 'No token');
            console.log('Token length:', token?.length);

            const response = await fetch('http://localhost:5000/api/categories', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                // Handle authentication errors
                if (response.status === 401) {
                    alert('Your session has expired. Please log out and log back in.');
                    setCategories([]);
                    setLoading(false);
                    return;
                }

                let errorData;
                try {
                    const text = await response.text();
                    errorData = text ? JSON.parse(text) : { message: 'Empty error response' };
                } catch (e) {
                    errorData = { message: 'Failed to parse error response' };
                }
                console.error('Error response:', errorData);
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || 'Unknown error'}`);
            }

            const data = await response.json();
            console.log('Categories response:', data);

            if (data.success) {
                setCategories(data.data);
                console.log('Categories loaded successfully:', data.data.length);
            } else {
                console.error('Failed to load categories:', data);
            }
        } catch (error) {
            console.error('Error loading categories:', error);
            alert(`Failed to load categories: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

            console.log('Submitting to:', url);
            console.log('Method:', editingCategory ? 'PUT' : 'POST');
            console.log('Data:', submitData);

            const response = await fetch(url, {
                method: editingCategory ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(submitData)
            });

            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);

            const text = await response.text();
            console.log('Response text:', text);

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
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">
                        {editingCategory ? 'Edit Category' : 'Add Category'}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Name *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent text-sm"
                                placeholder="Category name"
                            />
                            <p className="text-xs text-gray-500 mt-1">The name is how it appears on your site.</p>
                        </div>

                        {/* Slug */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Slug
                            </label>
                            <input
                                type="text"
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent text-sm"
                                placeholder="category-slug"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                The "slug" is the URL-friendly version of the name.
                            </p>
                        </div>

                        {/* Parent Category */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Parent Category
                            </label>
                            <select
                                value={formData.parent}
                                onChange={(e) => setFormData({ ...formData, parent: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent text-sm"
                            >
                                <option value="">None</option>
                                {parentCategories.map((cat) => (
                                    <option key={cat._id} value={cat._id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                                Categories can have a hierarchy.
                            </p>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent text-sm"
                                placeholder="Category description"
                            />
                        </div>

                        {/* Image URL */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Image URL *
                            </label>
                            <input
                                type="url"
                                required
                                value={formData.image}
                                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent text-sm"
                                placeholder="https://example.com/image.jpg"
                            />
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-2 pt-2">
                            <button
                                type="submit"
                                className="flex-1 px-4 py-2 bg-[#FF6B35] text-white rounded-md hover:bg-[#FF5722] transition text-sm font-medium"
                            >
                                {editingCategory ? 'Update' : 'Add New Category'}
                            </button>
                            {editingCategory && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-4 py-2 bg-[#F1F3F5] text-gray-700 rounded-md hover:bg-[#E9ECEF] transition text-sm"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Right Side - Categories Table */}
                <div className="bg-white rounded-lg shadow-sm">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <h2 className="text-lg font-bold text-gray-900">Categories</h2>
                            <span className="text-sm text-gray-500">{categories.length} items</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                placeholder="Search Categories"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Table */}
                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B35] mx-auto"></div>
                            <p className="mt-4 text-gray-600">Loading categories...</p>
                        </div>
                    ) : filteredCategories.length === 0 ? (
                        <div className="p-12 text-center">
                            <span className="material-symbols-outlined text-gray-300 text-6xl">category</span>
                            <p className="mt-4 text-gray-600">No categories found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-[#F8F9FA] border-b border-gray-200">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            <input type="checkbox" className="rounded" />
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Description
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Slug
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Count
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredCategories.map((category) => {
                                        const subcats = getSubcategories(category._id);
                                        const hasSubcategories = subcats.length > 0;
                                        const isExpanded = expandedCategories.has(category._id);

                                        return (
                                            <React.Fragment key={category._id}>
                                                <tr className="hover:bg-[#F8F9FA]">
                                                    <td className="px-4 py-3">
                                                        <input type="checkbox" className="rounded" />
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            {hasSubcategories && (
                                                                <button
                                                                    onClick={() => toggleCategory(category._id)}
                                                                    className="text-gray-400 hover:text-gray-600"
                                                                >
                                                                    <span className="material-symbols-outlined text-[18px]">
                                                                        {isExpanded ? 'expand_more' : 'chevron_right'}
                                                                    </span>
                                                                </button>
                                                            )}
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
                                                            {hasSubcategories && (
                                                                <span className="text-xs text-gray-500 bg-[#F1F3F5] px-2 py-0.5 rounded-full">
                                                                    {subcats.length}
                                                                </span>
                                                            )}
                                                        </div>
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
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-600">
                                                        {category.description || '—'}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-600">
                                                        {category.slug}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-600">
                                                        {hasSubcategories ? subcats.length : '—'}
                                                    </td>
                                                </tr>
                                                {/* Subcategories - Only show when expanded */}
                                                {hasSubcategories && isExpanded && subcats.map((subcat) => (
                                                    <tr key={subcat._id} className="hover:bg-[#F8F9FA] bg-blue-50/30">
                                                        <td className="px-4 py-3">
                                                            <input type="checkbox" className="rounded" />
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-2 pl-8">
                                                                <span className="text-gray-400">└─</span>
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
                                                            </div>
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
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-600">
                                                            {subcat.description || '—'}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-600">
                                                            {subcat.slug}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-600">
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
