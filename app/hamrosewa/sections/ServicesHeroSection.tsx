'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Save, Image as ImageIcon } from 'lucide-react';

interface ServicesHero {
    _id: string;
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    locationPlaceholder: string;
    backgroundImage: string;
    overlayOpacity: number;
}

interface ServicesHeroSectionProps {
    token: string;
}

export default function ServicesHeroSection({ token }: ServicesHeroSectionProps) {
    const [heroData, setHeroData] = useState<ServicesHero>({
        _id: '',
        title: 'Find the Perfect Service',
        subtitle: 'Browse through professional services',
        searchPlaceholder: 'Search for any service...',
        locationPlaceholder: 'Location...',
        backgroundImage: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1920&q=80',
        overlayOpacity: 0.6
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchHeroData();
    }, []);

    const fetchHeroData = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/services-hero');
            const data = await response.json();
            if (data.success) {
                setHeroData(data.data);
            }
        } catch (error) {
            toast.error('Failed to fetch hero section data');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const response = await fetch('http://localhost:5000/api/services-hero', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(heroData)
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Services hero section updated successfully');
                fetchHeroData();
            } else {
                toast.error(data.message || 'Failed to update hero section');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B35]"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Services Page Hero Section</h2>
                <p className="text-gray-600 mt-1">Customize the hero banner on the services page</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Preview */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-200 bg-[#F8F9FA]">
                        <h3 className="font-semibold text-gray-900">Live Preview</h3>
                    </div>
                    <div className="relative h-80 overflow-hidden">
                        <img
                            src={heroData.backgroundImage}
                            alt="Hero Background"
                            className="w-full h-full object-cover"
                        />
                        <div
                            className="absolute inset-0 bg-black flex flex-col items-center justify-center p-6"
                            style={{ opacity: heroData.overlayOpacity }}
                        >
                            <div className="text-center text-white max-w-2xl">
                                <h1 className="text-3xl font-bold mb-2">{heroData.title}</h1>
                                <p className="text-sm mb-4">{heroData.subtitle}</p>
                                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 flex gap-2">
                                    <input
                                        type="text"
                                        placeholder={heroData.searchPlaceholder}
                                        className="flex-1 px-3 py-2 text-xs bg-white/90 rounded text-gray-900"
                                        disabled
                                    />
                                    <input
                                        type="text"
                                        placeholder={heroData.locationPlaceholder}
                                        className="flex-1 px-3 py-2 text-xs bg-white/90 rounded text-gray-900"
                                        disabled
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Hero Title
                        </label>
                        <input
                            type="text"
                            value={heroData.title}
                            onChange={(e) => setHeroData({ ...heroData, title: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-[#FF6B35]"
                            placeholder="e.g., Find the Perfect Service"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Subtitle
                        </label>
                        <input
                            type="text"
                            value={heroData.subtitle}
                            onChange={(e) => setHeroData({ ...heroData, subtitle: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-[#FF6B35]"
                            placeholder="e.g., Browse through professional services"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Search Box Placeholder
                        </label>
                        <input
                            type="text"
                            value={heroData.searchPlaceholder}
                            onChange={(e) => setHeroData({ ...heroData, searchPlaceholder: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-[#FF6B35]"
                            placeholder="e.g., Search for any service..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Location Box Placeholder
                        </label>
                        <input
                            type="text"
                            value={heroData.locationPlaceholder}
                            onChange={(e) => setHeroData({ ...heroData, locationPlaceholder: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-[#FF6B35]"
                            placeholder="e.g., Location..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <ImageIcon className="w-4 h-4 inline mr-1" />
                            Background Image URL
                        </label>
                        <input
                            type="url"
                            value={heroData.backgroundImage}
                            onChange={(e) => setHeroData({ ...heroData, backgroundImage: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-[#FF6B35]"
                            placeholder="https://example.com/image.jpg"
                        />
                        <p className="text-xs text-gray-500 mt-1">Recommended size: 1920x600px</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Overlay Darkness: {heroData.overlayOpacity.toFixed(1)}
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={heroData.overlayOpacity}
                            onChange={(e) => setHeroData({ ...heroData, overlayOpacity: parseFloat(e.target.value) })}
                            className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>Transparent (0.0)</span>
                            <span>Dark (1.0)</span>
                        </div>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full flex items-center justify-center gap-2 bg-[#FF6B35] hover:bg-green-600 text-white px-4 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                    >
                        <Save className="w-5 h-5" />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
}
