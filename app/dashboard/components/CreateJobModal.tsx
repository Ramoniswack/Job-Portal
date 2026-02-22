'use client';

import { useState } from 'react';

interface CreateJobModalProps {
    token: string;
    onClose: () => void;
    onSuccess: () => void;
}

export default function CreateJobModal({ token, onClose, onSuccess }: CreateJobModalProps) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Home Repairs',
        location: '',
        budget: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:5000/api/jobs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...formData,
                    budget: Number(formData.budget),
                }),
            });

            const data = await response.json();
            if (data.success) {
                alert('Job created successfully!');
                onSuccess();
                onClose();
            } else {
                alert(data.message || 'Failed to create job');
            }
        } catch (error) {
            console.error('Error creating job:', error);
            alert('Error creating job');
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Create New Job</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                            placeholder="e.g., Need a Plumber"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            required
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                            placeholder="Describe the job requirements..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                            >
                                <option value="Home Repairs">Home Repairs</option>
                                <option value="Automobile">Automobile</option>
                                <option value="Technology">Technology</option>
                                <option value="Health & Wellness">Health & Wellness</option>
                                <option value="Personal Care">Personal Care</option>
                                <option value="Professional Services">Professional Services</option>
                                <option value="Home Improvement">Home Improvement</option>
                                <option value="Professional Training">Professional Training</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                            <input
                                type="text"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                                placeholder="e.g., New York, NY"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Budget ($)</label>
                        <input
                            type="number"
                            value={formData.budget}
                            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                            placeholder="150"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            className="flex-1 bg-[#26cf71] text-white py-3 rounded-lg font-bold hover:opacity-90 transition-all"
                        >
                            Create Job
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 border border-gray-300 rounded-lg font-bold hover:bg-gray-50 transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

