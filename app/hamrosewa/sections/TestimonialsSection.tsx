'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Image as ImageIcon, User } from 'lucide-react';
import { toast } from 'sonner';

interface Testimonial {
    _id?: string;
    text: string;
    name: string;
    position: string;
    avatar: string;
    isActive: boolean;
    order: number;
}

interface TestimonialsSectionProps {
    token: string;
}

interface SectionContent {
    _id?: string;
    title: string;
    description1: string;
    description2: string;
    videoImage: string;
}

export default function TestimonialsSection({ token }: TestimonialsSectionProps) {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [sectionContent, setSectionContent] = useState<SectionContent>({
        title: '',
        description1: '',
        description2: '',
        videoImage: ''
    });
    const [loading, setLoading] = useState(true);
    const [savingSection, setSavingSection] = useState(false);
    const [uploadingVideo, setUploadingVideo] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
    const [formData, setFormData] = useState<Testimonial>({
        text: '',
        name: '',
        position: '',
        avatar: '',
        isActive: true,
        order: 0
    });

    useEffect(() => {
        fetchTestimonials();
        fetchSectionContent();
    }, []);

    const fetchSectionContent = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/testimonial-section');
            const data = await response.json();

            if (data.success && data.data) {
                console.log('Fetched section content:', data.data);
                setSectionContent({
                    _id: data.data._id,
                    title: data.data.title,
                    description1: data.data.description1,
                    description2: data.data.description2,
                    videoImage: data.data.videoImage
                });
            }
        } catch (error) {
            console.error('Error fetching section content:', error);
        }
    };

    const fetchTestimonials = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/testimonials');
            const data = await response.json();

            if (data.success) {
                setTestimonials(data.data);
            }
        } catch (error) {
            console.error('Error fetching testimonials:', error);
            toast.error('Failed to load testimonials');
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        setUploadingAvatar(true);

        try {
            const formDataUpload = new FormData();
            formDataUpload.append('image', file);

            console.log('🔼 Uploading avatar image...');

            const response = await fetch('/api/upload/single', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formDataUpload
            });

            console.log('🔼 Avatar upload response status:', response.status);

            let data;
            try {
                data = await response.json();
                console.log('🔼 Avatar upload response data:', data);
            } catch (parseError) {
                console.error('🔼 Failed to parse response:', parseError);
                throw new Error(`Upload failed with status: ${response.status}`);
            }

            if (!response.ok) {
                console.error('🔼 Upload failed. Response:', data);
                throw new Error(data.message || `Upload failed with status: ${response.status}`);
            }

            if (data.success && data.data?.url) {
                console.log('🔼 Avatar uploaded successfully:', data.data.url);
                setFormData(prev => ({ ...prev, avatar: data.data.url }));
                toast.success('Avatar uploaded successfully!');
            } else {
                console.error('🔼 Unexpected response structure:', data);
                throw new Error(data.message || 'Failed to upload avatar');
            }
        } catch (error: any) {
            console.error('🔼 Error uploading avatar:', error);
            toast.error(error.message || 'Failed to upload avatar');
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleVideoImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        setUploadingVideo(true);

        try {
            const formDataUpload = new FormData();
            formDataUpload.append('image', file);

            const response = await fetch('/api/upload/single', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formDataUpload
            });

            // Try to get error details even if response is not ok
            let data;
            try {
                data = await response.json();
            } catch (parseError) {
                throw new Error(`Upload failed with status: ${response.status}`);
            }

            if (!response.ok) {
                console.error('Upload failed. Response:', data);
                throw new Error(data.message || `Upload failed with status: ${response.status}`);
            }

            if (data.success && data.data?.url) {
                setSectionContent(prev => ({ ...prev, videoImage: data.data.url }));
                toast.success('Video thumbnail uploaded successfully!', {
                    duration: 3000,
                });
            } else {
                console.error('Upload response:', data);
                toast.error(data.message || 'Failed to upload video thumbnail');
            }
        } catch (error: any) {
            console.error('Error uploading video thumbnail:', error);
            toast.error(error.message || 'Failed to upload video thumbnail');
        } finally {
            setUploadingVideo(false);
        }
    };

    const handleSaveSectionContent = async () => {
        setSavingSection(true);

        try {
            const response = await fetch('http://localhost:5000/api/testimonial-section', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(sectionContent)
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Section content updated successfully!');
                setSectionContent(data.data);
            } else {
                toast.error(data.message || 'Failed to update section content');
            }
        } catch (error) {
            console.error('Error updating section content:', error);
            toast.error('Failed to update section content');
        } finally {
            setSavingSection(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.avatar) {
            toast.error('Please upload an avatar image');
            return;
        }

        try {
            const url = editingTestimonial
                ? `http://localhost:5000/api/testimonials/${editingTestimonial._id}`
                : 'http://localhost:5000/api/testimonials';

            const response = await fetch(url, {
                method: editingTestimonial ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                toast.success(`Testimonial ${editingTestimonial ? 'updated' : 'created'} successfully!`);
                fetchTestimonials();
                handleCloseModal();
            } else {
                toast.error(data.message || 'Failed to save testimonial');
            }
        } catch (error) {
            console.error('Error saving testimonial:', error);
            toast.error('Failed to save testimonial');
        }
    };

    const handleEdit = (testimonial: Testimonial) => {
        setEditingTestimonial(testimonial);
        setFormData(testimonial);
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this testimonial?')) return;

        try {
            const response = await fetch(`http://localhost:5000/api/testimonials/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Testimonial deleted successfully!');
                fetchTestimonials();
            } else {
                toast.error(data.message || 'Failed to delete testimonial');
            }
        } catch (error) {
            console.error('Error deleting testimonial:', error);
            toast.error('Failed to delete testimonial');
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingTestimonial(null);
        setFormData({
            text: '',
            name: '',
            position: '',
            avatar: '',
            isActive: true,
            order: testimonials.length + 1 // Set order to next available number
        });
    };

    const handleOpenAddModal = () => {
        setFormData({
            text: '',
            name: '',
            position: '',
            avatar: '',
            isActive: true,
            order: testimonials.length + 1
        });
        setShowModal(true);
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-8">
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B35]"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Testimonials</h2>
                        <p className="text-gray-600 mt-1">Manage customer testimonials and reviews</p>
                    </div>
                    <button
                        onClick={handleOpenAddModal}
                        className="flex items-center gap-2 px-4 py-2 bg-[#FF6B35] hover:bg-[#FF5722] text-white rounded-lg transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Add Testimonial
                    </button>
                </div>
            </div>

            {/* Section Content Editor */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Section Content</h3>
                <div className="space-y-4">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Section Title
                        </label>
                        <input
                            type="text"
                            value={sectionContent.title}
                            onChange={(e) => setSectionContent({ ...sectionContent, title: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                            placeholder="See what our clients say about us"
                        />
                    </div>

                    {/* Description 1 */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Description Paragraph 1
                        </label>
                        <textarea
                            value={sectionContent.description1}
                            onChange={(e) => setSectionContent({ ...sectionContent, description1: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                            placeholder="First paragraph of description..."
                            rows={3}
                        />
                    </div>

                    {/* Description 2 */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Description Paragraph 2
                        </label>
                        <textarea
                            value={sectionContent.description2}
                            onChange={(e) => setSectionContent({ ...sectionContent, description2: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                            placeholder="Second paragraph of description..."
                            rows={3}
                        />
                    </div>

                    {/* Video Image */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <ImageIcon className="w-4 h-4 inline mr-2" />
                            Video Thumbnail Image
                        </label>

                        {sectionContent.videoImage && (
                            <div className="mb-3">
                                <img
                                    src={sectionContent.videoImage}
                                    alt="Video thumbnail preview"
                                    className="w-full max-w-md h-48 object-cover rounded-lg border-2 border-gray-300"
                                />
                            </div>
                        )}

                        <label className="block">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleVideoImageUpload}
                                className="hidden"
                                disabled={uploadingVideo}
                            />
                            <div className={`flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed ${sectionContent.videoImage ? 'border-green-300 bg-green-50' : 'border-gray-300'} rounded-lg cursor-pointer hover:border-[#FF6B35] hover:bg-[#FFF5F0] transition-colors ${uploadingVideo ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                {uploadingVideo ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#FF6B35]"></div>
                                        <span className="text-sm text-gray-600">Uploading...</span>
                                    </>
                                ) : (
                                    <>
                                        <ImageIcon className="w-5 h-5 text-[#FF6B35]" />
                                        <span className="text-sm font-medium text-gray-700">
                                            {sectionContent.videoImage ? 'Change Image' : 'Upload Image'}
                                        </span>
                                    </>
                                )}
                            </div>
                        </label>
                        <p className="text-xs text-gray-500 mt-2">Upload video thumbnail image</p>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end pt-4 border-t border-gray-200">
                        <button
                            onClick={handleSaveSectionContent}
                            disabled={savingSection}
                            className="flex items-center gap-2 px-6 py-3 bg-[#FF6B35] hover:bg-[#FF5722] text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {savingSection ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Save Section Content
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Testimonials Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {testimonials.map((testimonial) => (
                    <div key={testimonial._id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                            <img
                                src={testimonial.avatar}
                                alt={testimonial.name}
                                className="w-16 h-16 rounded-full border-2 border-gray-200"
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(testimonial)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(testimonial._id!)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <p className="text-gray-700 text-sm mb-4 line-clamp-3">{testimonial.text}</p>
                        <div>
                            <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                            <p className="text-xs text-gray-500">{testimonial.position}</p>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                            <span className={`text-xs px-2 py-1 rounded ${testimonial.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                {testimonial.isActive ? 'Active' : 'Inactive'}
                            </span>
                            <span className="text-xs text-gray-500">Order: {testimonial.order}</span>
                        </div>
                    </div>
                ))}
            </div>

            {testimonials.length === 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No testimonials yet</h3>
                    <p className="text-gray-600 mb-6">Add your first testimonial to get started</p>
                    <button
                        onClick={handleOpenAddModal}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF6B35] hover:bg-[#FF5722] text-white rounded-lg transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Add Testimonial
                    </button>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-900">
                                {editingTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}
                            </h3>
                            <button
                                onClick={handleCloseModal}
                                className="text-gray-400 hover:text-gray-600 transition"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Avatar Upload */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    <ImageIcon className="w-4 h-4 inline mr-2" />
                                    Avatar Image
                                </label>

                                {formData.avatar && (
                                    <div className="mb-3">
                                        <img
                                            src={formData.avatar}
                                            alt="Avatar preview"
                                            className="w-24 h-24 rounded-full object-cover border-2 border-gray-300 mx-auto"
                                        />
                                    </div>
                                )}

                                <label className="block">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarImageUpload}
                                        className="hidden"
                                        disabled={uploadingAvatar}
                                    />
                                    <div className={`flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed ${formData.avatar ? 'border-green-300 bg-green-50' : 'border-gray-300'} rounded-lg cursor-pointer hover:border-[#FF6B35] hover:bg-[#FFF5F0] transition-colors ${uploadingAvatar ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                        {uploadingAvatar ? (
                                            <>
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#FF6B35]"></div>
                                                <span className="text-sm text-gray-600">Uploading...</span>
                                            </>
                                        ) : (
                                            <>
                                                <ImageIcon className="w-5 h-5 text-[#FF6B35]" />
                                                <span className="text-sm font-medium text-gray-700">
                                                    {formData.avatar ? 'Change Avatar' : 'Upload Avatar'}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </label>
                                <p className="text-xs text-gray-500 mt-2">Upload a square image for best results</p>
                            </div>

                            {/* Name */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>

                            {/* Position */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Position/Company
                                </label>
                                <input
                                    type="text"
                                    value={formData.position}
                                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                                    placeholder="CEO at Company Name"
                                    required
                                />
                            </div>

                            {/* Testimonial Text */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Testimonial Text
                                </label>
                                <textarea
                                    value={formData.text}
                                    onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                                    placeholder="Write the testimonial here..."
                                    rows={5}
                                    required
                                />
                            </div>

                            {/* Order and Active Status */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Display Order
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.order}
                                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                                        min="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Status
                                    </label>
                                    <select
                                        value={formData.isActive ? 'active' : 'inactive'}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            {/* Submit Buttons */}
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 px-6 py-3 bg-[#FF6B35] hover:bg-[#FF5722] text-white rounded-lg font-semibold transition-colors"
                                >
                                    <Save className="w-4 h-4" />
                                    {editingTestimonial ? 'Update' : 'Create'} Testimonial
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
