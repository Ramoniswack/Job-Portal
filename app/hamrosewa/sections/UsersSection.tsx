'use client';

import React, { useState, useEffect } from 'react';
import ConfirmDialog from '@/app/components/ConfirmDialog';

interface User {
    _id: string;
    name: string;
    email: string;
    role: 'worker' | 'client' | 'admin';
    originalRole?: 'worker' | 'client';
    createdAt: string;
}

interface UsersSectionProps {
    token: string;
}

export default function UsersSection({ token }: UsersSectionProps) {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; userId: string | null; userName: string }>({
        isOpen: false,
        userId: null,
        userName: ''
    });
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'client' as 'worker' | 'client' | 'admin'
    });

    useEffect(() => {
        if (token) {
            loadUsers();
        }
    }, [token]);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/users', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error('Error loading users:', error);
            alert('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'admin':
                return 'bg-purple-100 text-purple-700';
            case 'worker':
                return 'bg-blue-100 text-blue-700';
            case 'client':
                return 'bg-[#F1F3F5] text-green-700';
            default:
                return 'bg-[#F1F3F5] text-gray-700 dark:text-gray-300';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            role: user.role
        });
        setShowEditModal(true);
    };

    const getAvailableRoles = (user: User | null) => {
        if (!user) return ['client', 'worker', 'admin'];

        // Rule: If user is currently admin, they can only stay admin
        if (user.role === 'admin') {
            return ['admin'];
        }

        // Non-admin users can be their current role or become admin
        return [user.role, 'admin'];
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;

        try {
            const response = await fetch(`http://localhost:5000/api/users/${editingUser._id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update user');
            }

            // Update users list
            setUsers(users.map(u => u._id === editingUser._id ? data.user : u));
            setShowEditModal(false);
            setEditingUser(null);
            alert('User updated successfully');
        } catch (error: any) {
            console.error('Error updating user:', error);
            alert(error.message || 'Failed to update user');
        }
    };

    const handleDelete = async (userId: string) => {
        try {
            const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete user');
            }

            // Remove user from list
            setUsers(users.filter(u => u._id !== userId));
            alert('User deleted successfully');
        } catch (error: any) {
            console.error('Error deleting user:', error);
            alert(error.message || 'Failed to delete user');
        } finally {
            setDeleteConfirm({ isOpen: false, userId: null, userName: '' });
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Users Management</h2>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">
                                search
                            </span>
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                            />
                        </div>
                    </div>
                    <div>
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                        >
                            <option value="all">All Roles</option>
                            <option value="admin">Admin</option>
                            <option value="worker">Worker</option>
                            <option value="client">Client</option>
                        </select>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                    <div className="bg-gray-50 dark:bg-gray-900 dark:bg-gray-900 rounded-lg p-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{users.length}</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                        <p className="text-sm text-purple-600">Admins</p>
                        <p className="text-2xl font-bold text-purple-700">{users.filter(u => u.role === 'admin').length}</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                        <p className="text-sm text-blue-600">Workers</p>
                        <p className="text-2xl font-bold text-blue-700">{users.filter(u => u.role === 'worker').length}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900 dark:bg-gray-900 rounded-lg p-4">
                        <p className="text-sm text-green-600">Clients</p>
                        <p className="text-2xl font-bold text-green-700">{users.filter(u => u.role === 'client').length}</p>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B35] mx-auto"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading users...</p>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="p-12 text-center">
                        <span className="material-symbols-outlined text-gray-300 text-[64px]">
                            person_off
                        </span>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">No users found</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-900 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                    User
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                    Role
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                    Joined
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredUsers.map((user) => (
                                <tr key={user._id} className="hover:bg-gray-50 dark:bg-gray-900 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-[#FF6B35] flex items-center justify-center text-white font-semibold">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900 dark:text-gray-100">{user.name}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <p className="text-gray-600 dark:text-gray-400 dark:text-gray-400">{user.email}</p>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getRoleBadgeColor(user.role)}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <p className="text-gray-600 dark:text-gray-400 dark:text-gray-400">{formatDate(user.createdAt)}</p>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleEdit(user)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Edit user"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">edit</span>
                                            </button>
                                            <button
                                                onClick={() => setDeleteConfirm({ isOpen: true, userId: user._id, userName: user.name })}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete user"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Footer */}
            {!loading && filteredUsers.length > 0 && (
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Showing {filteredUsers.length} of {users.length} users
                    </p>
                </div>
            )}

            {/* Edit User Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Edit User</h3>
                        </div>
                        <form onSubmit={handleUpdate} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Role
                                </label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value as 'worker' | 'client' | 'admin' })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                                    required
                                >
                                    {getAvailableRoles(editingUser).map(role => (
                                        <option key={role} value={role}>
                                            {role.charAt(0).toUpperCase() + role.slice(1)}
                                        </option>
                                    ))}
                                </select>
                                {editingUser && editingUser.role === 'admin' && (
                                    <p className="text-xs text-red-500 mt-1">
                                        Admin users cannot be changed back to worker or client
                                    </p>
                                )}
                                {editingUser && editingUser.role !== 'admin' && (
                                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                        User can be {editingUser.role} or promoted to admin (permanent)
                                    </p>
                                )}
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setEditingUser(null);
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-900 transition-colors font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-[#FF6B35] text-white rounded-lg hover:bg-[#FF5722] transition-colors font-semibold"
                                >
                                    Update User
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={deleteConfirm.isOpen}
                onClose={() => setDeleteConfirm({ isOpen: false, userId: null, userName: '' })}
                onConfirm={() => deleteConfirm.userId && handleDelete(deleteConfirm.userId)}
                title="Delete User"
                message={`Are you sure you want to delete user "${deleteConfirm.userName}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                type="danger"
            />
        </div>
    );
}
