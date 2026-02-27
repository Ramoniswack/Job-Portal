'use client';

import React, { useState, useEffect } from 'react';
import { Plus, X, Save, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface PricingTier {
    name: string;
    price: number;
    duration: string;
    features: string[];
}

interface Benefit {
    title: string;
    description: string;
}

interface AddAMCPackageSectionProps {
    token: string;
    editingPackageId?: string | null;
    onBack: () => void;
}

export default function AddAMCPackageSection({ token, editingPackageId, onBack }: AddAMCPackageSectionProps) {
    const [loading, setLoading] = useState(false);
    const [uploadingCard, setUploadingCard] = useState(false);
    const [uploadingHero, setUploadingHero] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        category: 'Plumbing',
        cardImage: '',
        heroImage: '',
        description: '',
        pricingTiers: [
            { name: 'Basic', price: 0, duration: 'year', features: [''] }
        ] as PricingTier[],
        whyChooseHeading: 'Why Choose Our AMC Packages?',
        benefits: [
            { title: '', description: '' }
        ] as Benefit[],
        isActive: true
    });

    useEffect(() => {
        if (editingPackageId) {
            loadPackage();
        }
    }, [editingPackageId]);

    const loadPackage = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/amc-packages/${editingPackageId}`);
            const data = await response.json();

            if (data.success) {
                setFormData({
                    title: data.data.title,
                    category: data.data.category,
                    cardImage: data.data.cardImage,
                    heroImage: data.data.heroImage,
                    description: data.data.description,
                    pricingTiers: data.data.pricingTiers,
                    whyChooseHeading: data.data.whyChooseHeading,
                    benefits: data.data.benefits,
                    isActive: data.data.isActive
                });
            }
        } catch (error) {
            console.error('Error loading package:', error);
            toast.error('Failed to load package');
        }
    };

    const handleImageUpload = async (file: File, type: 'card' | 'hero') => {
        const formDataUpload = new FormData();
        formDataUpload.append('image', file);

        if (type === 'card') setUploadingCard(true);
        else setUploadingHero(true);

        try {
            const response = await fetch('/api/upload/single', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formDataUpload
            });

            const data = await response.json();
            if (data.success && data.data?.url) {
                setFormData(prev => ({
                    ...prev,
                    [type === 'card' ? 'cardImage' : 'heroImage']: data.data.url
                }));
                toast.success(`${type === 'card' ? 'Card' : 'Hero'} image uploaded successfully`);
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Failed to upload image');
        } finally {
            if (type === 'card') setUploadingCard(false);
            else setUploadingHero(false);
        }
    };

    const addTier = () => {
        setFormData({
            ...formData,
            pricingTiers: [...formData.pricingTiers, { name: '', price: 0, duration: 'year', features: [''] }]
        });
    };

    const removeTier = (index: number) => {
        const newTiers = formData.pricingTiers.filter((_, i) => i !== index);
        setFormData({ ...formData, pricingTiers: newTiers });
    };

    const updateTier = (index: number, field: string, value: any) => {
        const newTiers = [...formData.pricingTiers];
        (newTiers[index] as any)[field] = value;
        setFormData({ ...formData, pricingTiers: newTiers });
    };

    const addFeature = (tierIndex: number) => {
        const newTiers = [...formData.pricingTiers];
        newTiers[tierIndex].features.push('');
        setFormData({ ...formData, pricingTiers: newTiers });
    };

    const removeFeature = (tierIndex: number, featureIndex: number) => {
        const newTiers = [...formData.pricingTiers];
        newTiers[tierIndex].features = newTiers[tierIndex].features.filter((_, i) => i !== featureIndex);
        setFormData({ ...formData, pricingTiers: newTiers });
    };

    const updateFeature = (tierIndex: number, featureIndex: number, value: string) => {
        const newTiers = [...formData.pricingTiers];
        newTiers[tierIndex].features[featureIndex] = value;
        setFormData({ ...formData, pricingTiers: newTiers });
    };

    const addBenefit = () => {
        setFormData({
            ...formData,
            benefits: [...formData.benefits, { title: '', description: '' }]
        });
    };

    const removeBenefit = (index: number) => {
        const newBenefits = formData.benefits.filter((_, i) => i !== index);
        setFormData({ ...formData, benefits: newBenefits });
    };

    const updateBenefit = (index: number, field: 'title' | 'description', value: string) => {
        const newBenefits = [...formData.benefits];
        newBenefits[index][field] = value;
        setFormData({ ...formData, benefits: newBenefits });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.cardImage || !formData.heroImage) {
            toast.error('Please upload both card and hero images');
            return;
        }

        setLoading(true);

        try {
            const url = editingPackageId
                ? `http://localhost:5000/api/amc-packages/${editingPackageId}`
                : 'http://localhost:5000/api/amc-packages';

            const method = editingPackageId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                toast.success(`Package ${editingPackageId ? 'updated' : 'created'} successfully!`);
                onBack();
            } else {
                toast.error(data.message || 'Failed to save package');
            }
        } catch (error) {
            console.error('Error saving package:', error);
            toast.error('Failed to save package');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                {editingPackageId ? 'Edit' : 'Add'} AMC Package
                            </h2>
                            <p className="text-gray-600 mt-1">Create or update your AMC package details</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Package Title *</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                            placeholder="e.g., Plumbing AMC Package"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                            required
                        >
                            <option value="Plumbing">Plumbing</option>
                            <option value="Electrical">Electrical</option>
                            <option value="Computer">Computer</option>
                            <option value="AC Maintenance">AC Maintenance</option>
                            <option value="Home Appliance">Home Appliance</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                            rows={3}
                            placeholder="Brief description of the package"
                            required
                        />
                    </div>

                    {/* Card Image */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Card Image * <span className="text-xs text-gray-500">(For homepage display)</span>
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'card')}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            disabled={uploadingCard}
                        />
                        {uploadingCard && <p className="text-sm text-gray-500 mt-2">Uploading...</p>}
                        {formData.cardImage && (
                            <img src={formData.cardImage} alt="Card preview" className="mt-2 w-full h-32 object-cover rounded-lg border-2 border-orange-500" />
                        )}
                    </div>

                    {/* Hero Image */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Hero Image * <span className="text-xs text-gray-500">(For detail page banner)</span>
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'hero')}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            disabled={uploadingHero}
                        />
                        {uploadingHero && <p className="text-sm text-gray-500 mt-2">Uploading...</p>}
                        {formData.heroImage && (
                            <img src={formData.heroImage} alt="Hero preview" className="mt-2 w-full h-32 object-cover rounded-lg border-2 border-orange-500" />
                        )}
                    </div>
                </div>

                {/* Pricing Tiers */}
                <div className="space-y-4 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Pricing Tiers</h3>
                        <button
                            type="button"
                            onClick={addTier}
                            className="flex items-center gap-2 px-4 py-2 bg-[#FF6B35] hover:bg-[#FF5722] text-white rounded-lg transition-colors text-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Add Tier
                        </button>
                    </div>

                    {formData.pricingTiers.map((tier, tierIndex) => (
                        <div key={tierIndex} className="bg-gray-50 p-4 rounded-lg space-y-3">
                            <div className="flex items-center justify-between">
                                <h4 className="font-medium text-gray-900">Tier {tierIndex + 1}</h4>
                                {formData.pricingTiers.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeTier(tierIndex)}
                                        className="text-red-500 hover:text-red-600"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Tier Name</label>
                                    <input
                                        type="text"
                                        value={tier.name}
                                        onChange={(e) => updateTier(tierIndex, 'name', e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                                        placeholder="Basic"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Price (NPR)</label>
                                    <input
                                        type="number"
                                        value={tier.price}
                                        onChange={(e) => updateTier(tierIndex, 'price', Number(e.target.value))}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                                        required
                                        min="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Duration</label>
                                    <select
                                        value={tier.duration}
                                        onChange={(e) => updateTier(tierIndex, 'duration', e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                                    >
                                        <option value="year">Year</option>
                                        <option value="month">Month</option>
                                        <option value="quarter">Quarter</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-2">Features</label>
                                <div className="space-y-2">
                                    {tier.features.map((feature, featureIndex) => (
                                        <div key={featureIndex} className="flex gap-2">
                                            <input
                                                type="text"
                                                value={feature}
                                                onChange={(e) => updateFeature(tierIndex, featureIndex, e.target.value)}
                                                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg"
                                                placeholder="Enter feature"
                                                required
                                            />
                                            {tier.features.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeFeature(tierIndex, featureIndex)}
                                                    className="px-2 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => addFeature(tierIndex)}
                                        className="text-sm text-[#FF6B35] hover:text-[#FF5722] font-medium"
                                    >
                                        + Add Feature
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Benefits */}
                <div className="space-y-4 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Benefits</h3>
                        <button
                            type="button"
                            onClick={addBenefit}
                            className="flex items-center gap-2 px-4 py-2 bg-[#FF6B35] hover:bg-[#FF5722] text-white rounded-lg transition-colors text-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Add Benefit
                        </button>
                    </div>

                    {formData.benefits.map((benefit, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-lg space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700">Benefit {index + 1}</span>
                                {formData.benefits.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeBenefit(index)}
                                        className="text-red-500 hover:text-red-600"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            <input
                                type="text"
                                value={benefit.title}
                                onChange={(e) => updateBenefit(index, 'title', e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                                placeholder="Benefit title"
                                required
                            />
                            <textarea
                                value={benefit.description}
                                onChange={(e) => updateBenefit(index, 'description', e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                                rows={2}
                                placeholder="Benefit description"
                                required
                            />
                        </div>
                    ))}
                </div>

                {/* Active Status */}
                <div className="flex items-center gap-2 pt-6 border-t border-gray-200">
                    <input
                        type="checkbox"
                        id="isActive"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="w-4 h-4 text-[#FF6B35] border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                        Active Package (visible to customers)
                    </label>
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-6 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={onBack}
                        className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading || !formData.cardImage || !formData.heroImage}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors ${loading || !formData.cardImage || !formData.heroImage
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-[#FF6B35] hover:bg-[#FF5722] text-white'
                            }`}
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Saving...</span>
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                {editingPackageId ? 'Update' : 'Create'} Package
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
