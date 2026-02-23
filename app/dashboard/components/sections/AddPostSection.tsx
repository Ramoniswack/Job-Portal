'use client';

import { useState, useEffect } from 'react';

interface Category {
    _id: string;
    name: string;
    slug: string;
    icon: string;
    color: string;
}

interface Post {
    _id?: string;
    title: string;
    content: string;
    excerpt: string;
    category: string;
    featuredImage?: {
        url: string;
        alt: string;
    };
    tags: string[];
    status: 'draft' | 'published' | 'archived';
    featured: boolean;
}

interface AddPostSectionProps {
    token: string;
    editingPost?: any;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function AddPostSection({ token, editingPost, onSuccess, onCancel }: AddPostSectionProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [formData, setFormData] = useState<Post>({
        title: '',
        content: '',
        excerpt: '',
        category: '',
        tags: [],
        status: 'draft',
        featured: false
    });
    const [tagInput, setTagInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [imageAlt, setImageAlt] = useState('');


    useEffect(() => {
        loadCategories();
        if (editingPost) {
            setFormData({
                title: editingPost.title,
                content: editingPost.content,
                excerpt: editingPost.excerpt,
                category: editingPost.category._id,
                tags: editingPost.tags || [],
                status: editingPost.status,
                featured: editingPost.featured
            });
            if (editingPost.featuredImage) {
                setImageUrl(editingPost.featuredImage.url);
                setImageAlt(editingPost.featuredImage.alt || '');
            }
        }
    }, [editingPost]);

    const loadCategories = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/posts/categories');
            const data = await response.json();
            if (data.success) {
                setCategories(data.data);
            }
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const postData: any = { ...formData };

            if (imageUrl) {
                postData.featuredImage = {
                    url: imageUrl,
                    alt: imageAlt || formData.title
                };
            }

            const url = editingPost
                ? `http://localhost:5000/api/posts/${editingPost._id}`
                : 'http://localhost:5000/api/posts';

            const response = await fetch(url, {
                method: editingPost ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(postData)
            });

            const data = await response.json();
            if (data.success) {
                alert(editingPost ? 'Post updated successfully!' : 'Post created successfully!');
                onSuccess();
            } else {
                alert(data.message || 'Failed to save post');
            }
        } catch (error) {
            console.error('Error saving post:', error);
            alert('Failed to save post');
        } finally {
            setLoading(false);
        }
    };

    const addTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
            setTagInput('');
        }
    };

    const removeTag = (tag: string) => {
        setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
    };

    return (
        <div className="p-8">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        {editingPost ? 'Edit Post' : 'Create New Post'}
                    </h1>
                    <p className="text-gray-600">Fill in the details below</p>
                </div>
                <button
                    onClick={onCancel}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 flex items-center gap-2"
                >
                    <span className="material-symbols-outlined">close</span>
                    Cancel
                </button>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
                <div className="grid gap-6">

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Post Title *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                            placeholder="Enter post title"
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category *
                        </label>
                        <select
                            required
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                        >
                            <option value="">Select a category</option>
                            {categories.map((cat) => (
                                <option key={cat._id} value={cat._id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Excerpt */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Excerpt
                        </label>
                        <textarea
                            value={formData.excerpt}
                            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                            placeholder="Short description (optional, auto-generated if empty)"
                        />
                    </div>

                    {/* Content */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Content *
                        </label>
                        <textarea
                            required
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            rows={12}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                            placeholder="Write your post content here..."
                        />
                    </div>

                    {/* Featured Image */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Featured Image URL
                            </label>
                            <input
                                type="url"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                                placeholder="https://example.com/image.jpg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Image Alt Text
                            </label>
                            <input
                                type="text"
                                value={imageAlt}
                                onChange={(e) => setImageAlt(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                                placeholder="Describe the image"
                            />
                        </div>
                    </div>

                    {imageUrl && (
                        <div>
                            <img src={imageUrl} alt={imageAlt} className="w-full max-w-md h-48 object-cover rounded-lg" />
                        </div>
                    )}

                    {/* Tags */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tags
                        </label>
                        <div className="flex gap-2 mb-2">
                            <input
                                type="text"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                                placeholder="Add a tag"
                            />
                            <button
                                type="button"
                                onClick={addTag}
                                className="px-4 py-2 bg-[#F1F3F5] text-gray-700 rounded-lg hover:bg-[#E9ECEF]"
                            >
                                Add
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {formData.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="px-3 py-1 bg-[#FF6B35] text-white rounded-full text-sm flex items-center gap-2"
                                >
                                    {tag}
                                    <button
                                        type="button"
                                        onClick={() => removeTag(tag)}
                                        className="hover:text-red-200"
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Status and Featured */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Status *
                            </label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                            >
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>
                        <div className="flex items-center">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.featured}
                                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                                    className="w-5 h-5 text-[#FF6B35] border-gray-300 rounded focus:ring-[#FF6B35]"
                                />
                                <span className="text-sm font-medium text-gray-700">Mark as Featured</span>
                            </label>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-3 bg-[#FF6B35] text-white rounded-lg hover:bg-[#FF5722] transition disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <span className="animate-spin material-symbols-outlined">refresh</span>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined">save</span>
                                    {editingPost ? 'Update Post' : 'Create Post'}
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-6 py-3 bg-[#F1F3F5] text-gray-700 rounded-lg hover:bg-[#E9ECEF] transition"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
