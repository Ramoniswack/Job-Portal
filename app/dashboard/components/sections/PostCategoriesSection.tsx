'use client';

import { useState, useEffect } from 'react';

interface PostCategory {
    _id: string;
    name: string;
    slug: string;
    description: string;
    icon: string;
    color: string;
    status: 'active' | 'inactive';
}

interface PostCategoriesSectionProps {
    token: string;
}

export default function PostCategoriesSection({ token }: PostCategoriesSectionProps) {
    const [categories, setCategories] = useState<PostCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<PostCategory | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        icon: 'category',
        color: '#FF6B35',
        status: 'active' as 'active' | 'inactive'
    });

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        setLoading(true);
        try {
            console.log('🔍 Loading POST categories from: http://localhost:5000/api/posts/categories');
            const response = await fetch('http://localhost:5000/api/posts/categories');
            const data = await response.json();
            console.log('📦 POST Categories response:', data);
            if (data.success) {
                setCategories(data.data);
                console.log('✅ Loaded', data.data.length, 'POST categories');
            } else {
                console.error('❌ Failed to load categories:', data.message);
            }
        } catch (error) {
            console.error('❌ Error loading POST categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const url = editingCategory
                ? `http://localhost:5000/api/posts/categories/${editingCategory._id}`
                : 'http://localhost:5000/api/posts/categories';

            const response = await fetch(url, {
                method: editingCategory ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (data.success) {
                alert(editingCategory ? 'Category updated!' : 'Category created!');
                setShowModal(false);
                setEditingCategory(null);
                setFormData({ name: '', description: '', icon: 'category', color: '#FF6B35', status: 'active' });
                loadCategories();
            } else {
                alert(data.message || 'Failed to save category');
            }
        } catch (error) {
            console.error('Error saving category:', error);
            alert('Failed to save category');
        }
    };

    const handleEdit = (category: PostCategory) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            description: category.description,
            icon: category.icon,
            color: category.color,
            status: category.status
        });
        setShowModal(true);
    };

    const handleDelete = async (categoryId: string) => {
        if (!confirm('Are you sure you want to delete this category?')) return;

        try {
            const response = await fetch(`http://localhost:5000/api/posts/categories/${categoryId}`, {
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

    const closeModal = () => {
        setShowModal(false);
        setEditingCategory(null);
        setFormData({ name: '', description: '', icon: 'category', color: '#FF6B35', status: 'active' });
    };

    return (
        <div className="p-8">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 transition-colors duration-300 ">Post Categories</h1>
                    <p className="text-gray-600 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500 transition-colors duration-300 ">Manage blog post categories (not service categories)</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="px-4 py-2 bg-[#FF6B35] text-white rounded-lg hover:bg-[#FF5722] transition flex items-center gap-2"
                >
                    <span className="material-symbols-outlined">add</span>
                    Add Category
                </button>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B35] mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400 dark:text-gray-500 transition-colors duration-300 ">Loading categories...</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map((category) => (
                        <div key={category._id} className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition transition-colors duration-300 ">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <span
                                        className="material-symbols-outlined text-[32px]"
                                        style={{ color: category.color }}
                                    >
                                        {category.icon}
                                    </span>
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-gray-100 transition-colors duration-300 ">{category.name}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-500 transition-colors duration-300 ">{category.slug}</p>
                                    </div>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${category.status === 'active' ? 'bg-[#F1F3F5] text-green-700' : 'bg-[#F1F3F5] text-gray-700 dark:text-gray-300'
                                    }`}>
                                    {category.status}
                                </span>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500 text-sm mb-4 transition-colors duration-300 ">{category.description || 'No description'}</p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(category)}
                                    className="flex-1 px-3 py-2 bg-[#FF6B35] text-white rounded-lg hover:bg-[#FF5722] transition text-sm"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(category._id)}
                                    className="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-lg max-w-md w-full p-6 transition-colors duration-300 ">
                        <h2 className="text-xl font-bold mb-4">
                            {editingCategory ? 'Edit Category' : 'Add New Category'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300 ">Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent transition-colors duration-300 "
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300 ">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent transition-colors duration-300 "
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300 ">Icon</label>
                                    <input
                                        type="text"
                                        value={formData.icon}
                                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent transition-colors duration-300 "
                                        placeholder="category"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300 ">Color</label>
                                    <input
                                        type="color"
                                        value={formData.color}
                                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                        className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-lg transition-colors duration-300 "
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300 ">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent transition-colors duration-300 "
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                            <div className="flex gap-2 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-[#FF6B35] text-white rounded-lg hover:bg-[#FF5722] transition"
                                >
                                    {editingCategory ? 'Update' : 'Create'}
                                </button>
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 px-4 py-2 bg-[#F1F3F5] text-gray-700 dark:text-gray-300 rounded-lg hover:bg-[#E9ECEF] transition transition-colors duration-300 "
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
