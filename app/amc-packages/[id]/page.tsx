'use client';

import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

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

interface AMCPackage {
    _id: string;
    title: string;
    category: string;
    cardImage: string;
    heroImage: string;
    description: string;
    pricingTiers: PricingTier[];
    whyChooseHeading: string;
    benefits: Benefit[];
}

export default function AMCPackagesPage() {
    const params = useParams();
    const id = params.id as string;
    const [packageData, setPackageData] = useState<AMCPackage | null>(null);
    const [loading, setLoading] = useState(true);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedTier, setSelectedTier] = useState<PricingTier | null>(null);
    const [bookingData, setBookingData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        notes: ''
    });

    useEffect(() => {
        if (id) {
            fetchPackage();
        }
    }, [id]);

    const fetchPackage = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/amc-packages/${id}`);
            const data = await response.json();

            if (data.success) {
                setPackageData(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch package:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBookNow = (tier: PricingTier) => {
        setSelectedTier(tier);
        setShowBookingModal(true);
    };

    const handleBookingSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Here you would typically send the booking data to your backend
        console.log('Booking submitted:', {
            package: packageData?.title,
            tier: selectedTier?.name,
            ...bookingData
        });

        alert('AMC Package booking request submitted successfully! We will contact you shortly.');
        setShowBookingModal(false);
        setBookingData({ name: '', email: '', phone: '', address: '', notes: '' });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8F9FA]">
                <Navbar />
                <div className="flex items-center justify-center h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B35]"></div>
                </div>
            </div>
        );
    }

    if (!packageData) {
        return (
            <div className="min-h-screen bg-[#F8F9FA]">
                <Navbar />
                <div className="flex items-center justify-center h-screen">
                    <p className="text-gray-600 text-lg">Package not found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8F9FA]">
            <Navbar />

            {/* Hero Image Section */}
            <div className="relative h-[400px] overflow-hidden">
                <img
                    src={packageData.heroImage}
                    alt={packageData.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="text-center text-white px-4">
                        <h1 className="text-5xl md:text-6xl font-bold mb-4 drop-shadow-lg">
                            {packageData.category} <span className="text-[#FF6B35]">AMC Packages</span>
                        </h1>
                        <p className="text-xl md:text-2xl font-medium drop-shadow-md max-w-3xl mx-auto">
                            {packageData.description}
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-12">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Choose Your Perfect Plan
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Our expert team ensures your {packageData.category.toLowerCase()} system runs smoothly all year round with regular maintenance and emergency support.
                    </p>
                </div>

                {/* Packages Grid */}
                <div className="flex flex-wrap justify-center gap-8 max-w-6xl mx-auto">
                    {packageData.pricingTiers.map((tier, index) => (
                        <div
                            key={index}
                            className="w-80 border border-gray-200 rounded-lg p-5 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.15)] transition-shadow duration-300"
                        >
                            {/* Package Header */}
                            <div className="bg-[#FF6B35] text-white text-center py-4 px-4 font-bold text-lg rounded mb-5">
                                {tier.name.toUpperCase()}
                            </div>

                            {/* Price */}
                            <div className="text-center mb-5">
                                <div className="text-lg text-gray-800 mb-1">
                                    NPR <span className="text-5xl font-extrabold text-[#1a2a3a]">{tier.price.toLocaleString()}</span>/mo
                                </div>
                                <div className="text-gray-600 text-base -mt-1 mb-5">
                                    {tier.duration === 'month' ? 'Monthly' : tier.duration === 'quarter' ? 'Quarterly' : 'Yearly'} Billing
                                </div>
                            </div>

                            {/* Book Button */}
                            <button
                                onClick={() => handleBookNow(tier)}
                                className="w-full py-3 px-4 border-2 border-[#FF6B35] bg-white text-[#FF6B35] font-bold rounded cursor-pointer text-center mb-6 hover:bg-[#FF6B35] hover:text-white transition-colors duration-200"
                            >
                                Book Now
                            </button>

                            {/* Features */}
                            <ul className="list-none p-0 m-0">
                                {tier.features.map((feature, idx) => (
                                    <li key={idx} className="mb-3 text-gray-800 flex items-center text-[1.05rem]">
                                        <span className="text-[#FF6B35] mr-3 font-bold text-lg">✔</span>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Additional Information */}
                <div className="mt-16 bg-white rounded-2xl border border-gray-200 p-8 max-w-4xl mx-auto">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{packageData.whyChooseHeading}</h3>
                    <div className="grid md:grid-cols-2 gap-6 text-gray-700">
                        {packageData.benefits.map((benefit, index) => (
                            <div key={index}>
                                <h4 className="font-semibold text-lg mb-2 text-[#FF6B35]">✓ {benefit.title}</h4>
                                <p className="text-sm">{benefit.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* Booking Modal */}
            {showBookingModal && selectedTier && (
                <div
                    className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 overflow-y-auto"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setShowBookingModal(false);
                        }
                    }}
                >
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-8 mx-auto">
                        {/* Modal Header */}
                        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex justify-between items-center rounded-t-2xl">
                            <h2 className="text-lg sm:text-2xl font-bold text-gray-900">Complete Your AMC Booking</h2>
                            <button
                                type="button"
                                onClick={() => setShowBookingModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition flex-shrink-0 ml-2"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleBookingSubmit} className="p-4 sm:p-6">
                            {/* Package Info */}
                            <div className="bg-[#FFF5F0] border-l-4 border-[#FF6B35] rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                                <h3 className="font-bold text-gray-900 mb-2 text-sm sm:text-base">{packageData?.category} AMC Package</h3>
                                <div className="text-xs sm:text-sm text-gray-700 flex flex-wrap gap-x-6 gap-y-1">
                                    <p><span className="font-semibold">Plan:</span> {selectedTier.name}</p>
                                    <p><span className="font-semibold">Duration:</span> {selectedTier.duration === 'month' ? 'Monthly' : selectedTier.duration === 'quarter' ? 'Quarterly' : 'Yearly'}</p>
                                    <p><span className="font-semibold">Price:</span> NPR {selectedTier.price.toLocaleString()}/mo</p>
                                </div>
                            </div>

                            {/* Form Fields - Two Column Layout */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                                <div>
                                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                                        Full Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={bookingData.name}
                                        onChange={(e) => setBookingData({ ...bookingData, name: e.target.value })}
                                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent outline-none transition"
                                        placeholder="Enter your full name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                                        Email Address <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={bookingData.email}
                                        onChange={(e) => setBookingData({ ...bookingData, email: e.target.value })}
                                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent outline-none transition"
                                        placeholder="your.email@example.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                                        Phone Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        required
                                        value={bookingData.phone}
                                        onChange={(e) => setBookingData({ ...bookingData, phone: e.target.value })}
                                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent outline-none transition"
                                        placeholder="+977 98XXXXXXXX"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                                        Service Address <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={bookingData.address}
                                        onChange={(e) => setBookingData({ ...bookingData, address: e.target.value })}
                                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent outline-none transition"
                                        placeholder="Enter service location address"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                                        Additional Notes (Optional)
                                    </label>
                                    <textarea
                                        value={bookingData.notes}
                                        onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                                        rows={2}
                                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent outline-none transition resize-none"
                                        placeholder="Any special requirements or instructions..."
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-2 sm:gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowBookingModal(false)}
                                    className="w-full sm:flex-1 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="w-full sm:flex-1 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-[#FF6B35] text-white rounded-lg font-semibold hover:bg-[#FF5722] transition shadow-lg hover:shadow-xl transform hover:scale-105 duration-300"
                                >
                                    Confirm Booking
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}
