'use client';

import { useState, useEffect } from 'react';
import { Save, RefreshCw, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface HomeHeroData {
    _id?: string;
    title: string;
    highlightedText: string;
    subtitle: string;
    searchPlaceholder: string;
    locationPlaceholder: string;
    buttonText: string;
    backgroundImage: string;
    overlayOpacity: number;
}

interface HomeHeroSectionProps {
    token: string;
}

export default function HomeHeroSection({ token }: HomeHeroSectionProps) {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState<HomeHeroData>({
        title: 'Find Your Dream Job Today',
        highlightedText: 'Dream Job',
        subtitle: 'Search 27 live opportunities across Nepal • 100% Free',
        searchPlaceholder: 'Search by Job Title',
        locationPlaceholder: 'Location',
        buttonText: 'Search',
        backgroundImage: 'https://worknp.com/images/hero-bg.png',
        overlayOpacity: 0.4
    });

    useEffect(() => {
        fetchHomeHero();
    }, []);

    const fetchHomeHero = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/home-hero');
            const data = await response.json();

            if (data.success) {
                setFormData(data.data);
            }
        } catch (error) {
            console.error('Error fetching home hero:', error);
            toast.error('Failed to load home hero data');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate that background image is uploaded
        if (!formData.backgroundImage) {
            toast.error('Please upload a background image');
            return;
        }

        setSaving(true);

        try {
            const response = await fetch('http://localhost:5000/api/home-hero', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Home hero updated successfully!');
                setFormData(data.data);
            } else {
                toast.error(data.message || 'Failed to update home hero');
            }
        } catch (error) {
            console.error('Error updating home hero:', error);
            toast.error('Failed to update home hero');
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        setFormData({
            title: 'Find Your Dream Job Today',
            highlightedText: 'Dream Job',
            subtitle: 'Search 27 live opportunities across Nepal • 100% Free',
            searchPlaceholder: 'Search by Job Title',
            locationPlaceholder: 'Location',
            buttonText: 'Search',
            backgroundImage: 'https://worknp.com/images/hero-bg.png',
            overlayOpacity: 0.4
        });
        toast.info('Form reset to default values');
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size should be less than 5MB');
            return;
        }

        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch('/api/upload/single', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();

            if (data.success && data.data?.url) {
                setFormData(prev => ({ ...prev, backgroundImage: data.data.url }));
                toast.success('Image uploaded successfully!');
            } else {
                toast.error(data.message || 'Failed to upload image');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            toast.error('Failed to upload image');
        } finally {
            setUploading(false);
        }
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
                        <h2 className="text-2xl font-bold text-gray-900">Home Hero Section</h2>
                        <p className="text-gray-600 mt-1">Manage the main hero section on the homepage</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleReset}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Reset
                        </button>
                    </div>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Main Title
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                            placeholder="Find Your Dream Job Today"
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">The main heading text displayed on the hero section</p>
                    </div>

                    {/* Highlighted Text */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Highlighted Text
                        </label>
                        <input
                            type="text"
                            value={formData.highlightedText}
                            onChange={(e) => setFormData({ ...formData, highlightedText: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                            placeholder="Dream Job"
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">The text that will be highlighted in white within the title</p>
                    </div>

                    {/* Subtitle */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Subtitle
                        </label>
                        <input
                            type="text"
                            value={formData.subtitle}
                            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                            placeholder="Search 27 live opportunities across Nepal • 100% Free"
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">The subtitle text below the main title</p>
                    </div>

                    {/* Search Placeholders */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Search Placeholder
                            </label>
                            <input
                                type="text"
                                value={formData.searchPlaceholder}
                                onChange={(e) => setFormData({ ...formData, searchPlaceholder: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                                placeholder="Search by Job Title"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Location Placeholder
                            </label>
                            <input
                                type="text"
                                value={formData.locationPlaceholder}
                                onChange={(e) => setFormData({ ...formData, locationPlaceholder: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                                placeholder="Location"
                                required
                            />
                        </div>
                    </div>

                    {/* Button Text */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Button Text
                        </label>
                        <input
                            type="text"
                            value={formData.buttonText}
                            onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                            placeholder="Search"
                            required
                        />
                    </div>

                    {/* Background Image */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <ImageIcon className="w-4 h-4 inline mr-2" />
                            Background Image
                        </label>

                        {/* Image Preview */}
                        {formData.backgroundImage && (
                            <div className="mb-3 relative">
                                <img
                                    src={formData.backgroundImage}
                                    alt="Background preview"
                                    className="w-full h-48 object-cover rounded-lg border border-gray-300"
                                />
                            </div>
                        )}

                        {/* Upload Button */}
                        <div className="flex gap-3 mb-3">
                            <label className="flex-1">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                    disabled={uploading}
                                />
                                <div className={`flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed ${formData.backgroundImage ? 'border-green-300 bg-green-50' : 'border-gray-300'} rounded-lg cursor-pointer hover:border-[#FF6B35] hover:bg-[#FFF5F0] transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                    {uploading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#FF6B35]"></div>
                                            <span className="text-sm text-gray-600">Uploading...</span>
                                        </>
                                    ) : (
                                        <>
                                            <ImageIcon className="w-5 h-5 text-[#FF6B35]" />
                                            <span className="text-sm font-medium text-gray-700">
                                                {formData.backgroundImage ? 'Change Image' : 'Click to Upload Image'}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </label>
                        </div>

                        {/* Hidden input for form validation */}
                        <input
                            type="hidden"
                            value={formData.backgroundImage}
                            required
                        />

                        <p className="text-xs text-gray-500 mt-2">Upload an image (max 5MB, JPG, PNG, GIF)</p>
                    </div>

                    {/* Overlay Opacity */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Overlay Opacity: {formData.overlayOpacity}
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={formData.overlayOpacity}
                            onChange={(e) => setFormData({ ...formData, overlayOpacity: parseFloat(e.target.value) })}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>Transparent (0)</span>
                            <span>Dark (1)</span>
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="border-t border-gray-200 pt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
                        <div
                            className="relative h-64 rounded-lg overflow-hidden"
                            style={{
                                backgroundImage: `linear-gradient(rgba(0, 0, 0, ${formData.overlayOpacity}), rgba(0, 0, 0, ${formData.overlayOpacity})), url('${formData.backgroundImage}')`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
                            }}
                        >
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6">
                                <h1 className="text-3xl font-bold mb-2 text-center">
                                    {formData.title.replace(formData.highlightedText, '')}
                                    <span className="text-white">{formData.highlightedText}</span>
                                </h1>
                                <p className="text-sm mb-4 text-center">{formData.subtitle}</p>
                                <div className="bg-white rounded-full px-4 py-2 text-xs text-gray-600 flex items-center gap-2">
                                    <span>{formData.searchPlaceholder}</span>
                                    <span>|</span>
                                    <span>{formData.locationPlaceholder}</span>
                                    <button className="bg-[#f65e19] text-white px-4 py-1 rounded-full text-xs ml-2">
                                        {formData.buttonText}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-2 px-6 py-3 bg-[#FF6B35] hover:bg-[#FF5722] text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
