'use client';

import React, { useState, useEffect } from 'react';

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
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/categories/all');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setCategories(Array.isArray(data) ? data : (data.data || []));
        } catch (error) {
            console.error('Error loading categories:', error);
            alert('Failed to load categories');
        } finally {
            setLoading(false);
        }
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

    const categoriesWithSubs = parentCategories.filter(cat => getCategoryCount(cat._id) > 0);
    const categoriesWithoutSubs = categories.filter(cat => !cat.parent && getCategoryCount(cat._id) === 0);
    const sortedCategories = [...categoriesWithSubs, ...categoriesWithoutSubs];

    const filteredCategories = sortedCategories.filter(cat =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Service Categories</h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">View all service categories</p>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
                <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">
                        search
                    </span>
                    <input
                        type="text"
                        placeholder="Search categories..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                    />
                </div>
            </div>

            {/* Categories List */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B35] mx-auto"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading categories...</p>
                    </div>
                ) : filteredCategories.length === 0 ? (
                    <div className="p-12 text-center">
                        <span className="material-symbols-outlined text-gray-300 text-6xl">category</span>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">No categories found</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredCategories.map((category) => {
                            const subcategories = getSubcategories(category._id);
                            const hasSubcategories = subcategories.length > 0;
                            const isExpanded = expandedCategories.has(category._id);

                            return (
                                <div key={category._id} className="p-4">
                                    <div className="flex items-start gap-4">
                                        {/* Category Image */}
                                        {category.image && (
                                            <img
                                                src={category.image}
                                                alt={category.name}
                                                className="w-16 h-16 rounded-lg object-cover"
                                            />
                                        )}

                                        {/* Category Info */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                {hasSubcategories && (
                                                    <button
                                                        onClick={() => toggleCategory(category._id)}
                                                        className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]">
                                                            {isExpanded ? 'expand_more' : 'chevron_right'}
                                                        </span>
                                                    </button>
                                                )}
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                                    {category.name}
                                                </h3>
                                            </div>

                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                                                Slug: {category.slug}
                                            </p>

                                            {category.description && (
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                    {category.description}
                                                </p>
                                            )}

                                            {hasSubcategories && (
                                                <p className="text-xs text-gray-500 dark:text-gray-500">
                                                    {subcategories.length} subcategories
                                                </p>
                                            )}

                                            {/* Subcategories */}
                                            {isExpanded && hasSubcategories && (
                                                <div className="mt-3 ml-6 space-y-2 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
                                                    {subcategories.map((subcat) => (
                                                        <div key={subcat._id} className="flex items-start gap-3">
                                                            {subcat.image && (
                                                                <img
                                                                    src={subcat.image}
                                                                    alt={subcat.name}
                                                                    className="w-12 h-12 rounded-lg object-cover"
                                                                />
                                                            )}
                                                            <div className="flex-1">
                                                                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                                                    {subcat.name}
                                                                </h4>
                                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                    Slug: {subcat.slug}
                                                                </p>
                                                                {subcat.description && (
                                                                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                                                        {subcat.description}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Stats */}
            {!loading && categories.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Categories</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{parentCategories.length}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Subcategories</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                {categories.filter(cat => cat.parent).length}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
