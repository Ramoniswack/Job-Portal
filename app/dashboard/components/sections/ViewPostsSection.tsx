'use client';

import { useState, useEffect } from 'react';

interface Post {
    _id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    category: {
        _id: string;
        name: string;
        slug: string;
        icon: string;
        color: string;
    };
    author: {
        _id: string;
        name: string;
        email: string;
    };
    featuredImage?: {
        url: string;
        alt: string;
    };
    status: 'draft' | 'published' | 'archived';
    featured: boolean;
    views: number;
    createdAt: string;
    updatedAt: string;
}

interface ViewPostsSectionProps {
    token: string;
    onEditPost: (post: Post) => void;
}

export default function ViewPostsSection({ token, onEditPost }: ViewPostsSectionProps) {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadPosts();
    }, [filter]);

    const loadPosts = async () => {
        setLoading(true);
        try {
            let url = 'http://localhost:5000/api/posts';
            if (filter !== 'all') {
                url += `?status=${filter}`;
            }


            const response = await fetch(url);
            const data = await response.json();
            if (data.success) {
                setPosts(data.data);
            }
        } catch (error) {
            console.error('Error loading posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (postId: string) => {
        if (!confirm('Are you sure you want to delete this post?')) return;

        try {
            const response = await fetch(`http://localhost:5000/api/posts/${postId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();
            if (data.success) {
                loadPosts();
            }
        } catch (error) {
            console.error('Error deleting post:', error);
        }
    };

    const filteredPosts = posts.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusBadge = (status: string) => {
        const styles = {
            draft: 'bg-[#F1F3F5] text-gray-700',
            published: 'bg-[#F1F3F5] text-green-700',
            archived: 'bg-red-100 text-red-700'
        };
        return styles[status as keyof typeof styles] || styles.draft;
    };

    return (
        <div className="p-8">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">All Posts</h1>
                <p className="text-gray-600">Manage your blog posts</p>
            </div>


            {/* Filters and Search */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Search posts..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-lg font-medium transition ${filter === 'all' ? 'bg-[#FF6B35] text-white' : 'bg-[#F1F3F5] text-gray-700 hover:bg-[#E9ECEF]'
                                }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter('published')}
                            className={`px-4 py-2 rounded-lg font-medium transition ${filter === 'published' ? 'bg-[#FF6B35] text-white' : 'bg-[#F1F3F5] text-gray-700 hover:bg-[#E9ECEF]'
                                }`}
                        >
                            Published
                        </button>
                        <button
                            onClick={() => setFilter('draft')}
                            className={`px-4 py-2 rounded-lg font-medium transition ${filter === 'draft' ? 'bg-[#FF6B35] text-white' : 'bg-[#F1F3F5] text-gray-700 hover:bg-[#E9ECEF]'
                                }`}
                        >
                            Drafts
                        </button>
                    </div>
                </div>
            </div>

            {/* Posts List */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B35] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading posts...</p>
                </div>
            ) : filteredPosts.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                    <span className="material-symbols-outlined text-gray-300 text-6xl mb-4">article</span>
                    <p className="text-gray-600">No posts found</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredPosts.map((post) => (
                        <div key={post._id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition">
                            <div className="flex gap-4">

                                {post.featuredImage && (
                                    <img
                                        src={post.featuredImage.url}
                                        alt={post.featuredImage.alt || post.title}
                                        className="w-32 h-32 object-cover rounded-lg"
                                    />
                                )}
                                <div className="flex-1">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-1">{post.title}</h3>
                                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                                <span className="flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[16px]" style={{ color: post.category.color }}>
                                                        {post.category.icon}
                                                    </span>
                                                    {post.category.name}
                                                </span>
                                                <span>•</span>
                                                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[16px]">visibility</span>
                                                    {post.views} views
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(post.status)}`}>
                                                {post.status}
                                            </span>
                                            {post.featured && (
                                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                                                    Featured
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-gray-600 mb-4 line-clamp-2">{post.excerpt}</p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => onEditPost(post)}
                                            className="px-4 py-2 bg-[#FF6B35] text-white rounded-lg hover:bg-[#FF5722] transition flex items-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">edit</span>
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(post._id)}
                                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">delete</span>
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
