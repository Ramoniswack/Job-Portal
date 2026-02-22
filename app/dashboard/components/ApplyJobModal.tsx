'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface ApplyJobModalProps {
    jobId: string;
    jobTitle: string;
    token: string;
    currentUserEmail: string;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ApplyJobModal({ jobId, jobTitle, token, currentUserEmail, onClose, onSuccess }: ApplyJobModalProps) {
    const [formData, setFormData] = useState({
        workerLocation: '',
        phone: '',
        email: currentUserEmail,
        qualification: '',
        message: '',
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setFormData(prev => ({ ...prev, email: currentUserEmail }));
    }, [currentUserEmail]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/applications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    jobId,
                    ...formData,
                }),
            });

            const data = await response.json();
            if (data.success) {
                toast.success('Application submitted successfully!', {
                    description: 'The client will review your application and contact you.'
                });
                onSuccess();
                onClose();
            } else {
                toast.error('Failed to submit application', {
                    description: data.message || 'Please try again.'
                });
            }
        } catch (error) {
            console.error('Error applying for job:', error);
            toast.error('Error submitting application', {
                description: 'Please check your connection and try again.'
            });
        } finally {
            setLoading(false);
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
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Apply for Job</h2>
                        <p className="text-sm text-gray-500 mt-1">{jobTitle}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Phone Number <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                                placeholder="+1 (555) 123-4567"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address <span className="text-gray-400">(Your Account Email)</span>
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                readOnly
                                disabled
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                                placeholder="your@email.com"
                            />
                            <p className="text-xs text-gray-500 mt-1">This is your registered email and cannot be changed</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Your Location <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.workerLocation}
                            onChange={(e) => setFormData({ ...formData, workerLocation: e.target.value })}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                            placeholder="e.g., New York, NY"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Qualification / Skills <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.qualification}
                            onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                            placeholder="e.g., 5 years experience in plumbing, Licensed electrician"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Cover Message <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            required
                            rows={4}
                            maxLength={1000}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                            placeholder="Tell the client why you're the best fit for this job..."
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            {formData.message.length}/1000 characters
                        </p>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-[#26cf71] text-white py-3 rounded-lg font-bold hover:opacity-90 transition-all disabled:opacity-50"
                        >
                            {loading ? 'Submitting...' : 'Submit Application'}
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

