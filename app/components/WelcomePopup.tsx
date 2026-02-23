'use client';

import { useState, useEffect } from 'react';
import { X, MapPin, Gift } from 'lucide-react';

interface WelcomePopupProps {
    onLocationSelect?: (location: string) => void;
}

export default function WelcomePopup({ onLocationSelect }: WelcomePopupProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        location: '',
    });

    useEffect(() => {
        // Check if user data exists in localStorage
        const storedUserData = localStorage.getItem('hamroSewaUserData');

        if (storedUserData) {
            // User has already filled the form, don't show popup
            try {
                const userData = JSON.parse(storedUserData);
                // Optionally update location in header if callback exists
                if (onLocationSelect && userData.location) {
                    onLocationSelect(userData.location);
                }
            } catch (error) {
                console.error('Error parsing stored user data:', error);
            }
            return;
        }

        // Show popup after 1 second delay if no stored data
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 1000);

        return () => clearTimeout(timer);
    }, [onLocationSelect]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Store user data in localStorage
        try {
            localStorage.setItem('hamroSewaUserData', JSON.stringify(formData));
        } catch (error) {
            console.error('Error saving user data to localStorage:', error);
        }

        // Update location in header
        if (onLocationSelect) {
            onLocationSelect(formData.location);
        }

        // Close popup
        closePopup();
    };

    const closePopup = () => {
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/70 z-[9998] transition-opacity duration-300"
                onClick={closePopup}
            />

            {/* Popup */}
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
                <div className="bg-white rounded-3xl max-w-2xl w-full relative animate-scale-in shadow-2xl my-8 overflow-hidden border border-gray-200">
                    {/* Decorative white header */}
                    <div className="bg-white h-16 relative border-b border-gray-100">
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-white"></div>
                    </div>

                    {/* Close button */}
                    <button
                        onClick={closePopup}
                        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors z-10 bg-[#F1F3F5] rounded-full p-1"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {/* Logo positioned in header */}
                    <div className="absolute top-3 left-8 bg-white rounded-2xl p-2 shadow-md border border-gray-100">
                        <img
                            src="/logo.jpg"
                            alt="Hamro Sewa"
                            className="h-10 w-auto"
                        />
                    </div>

                    {/* Content */}
                    <div className="px-8 pt-6 pb-6">
                        <div className="mb-4">
                            <h2 className="text-2xl font-bold text-[#1A2B3C] mb-2 tracking-tight">
                                Welcome to Hamro Sewa
                            </h2>
                            <p className="text-gray-500 text-sm">
                                Join thousands of satisfied customers. Start your journey with us today!
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="name" className="block text-xs font-semibold text-gray-700 mb-1.5">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent outline-none transition-all bg-[#F8F9FA] focus:bg-white"
                                        placeholder="Enter your full name"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-xs font-semibold text-gray-700 mb-1.5">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent outline-none transition-all bg-[#F8F9FA] focus:bg-white"
                                        placeholder="your@email.com"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="phone" className="block text-xs font-semibold text-gray-700 mb-1.5">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        required
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent outline-none transition-all bg-[#F8F9FA] focus:bg-white"
                                        placeholder="98XXXXXXXX"
                                        pattern="[0-9]{10}"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="location" className="block text-xs font-semibold text-gray-700 mb-1.5">
                                        Location
                                    </label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                                        <input
                                            type="text"
                                            id="location"
                                            name="location"
                                            required
                                            value={formData.location}
                                            onChange={handleInputChange}
                                            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent outline-none transition-all bg-[#F8F9FA] focus:bg-white"
                                            placeholder="Enter your location"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="py-3">
                                <p className="text-[#FF6B35] font-bold text-base text-center flex items-center justify-center gap-2">
                                    <Gift className="w-5 h-5" />
                                    Get 10% off on your first service booking!
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    className="flex-1 bg-gradient-to-r from-[#FF6B35] to-[#FF5722] text-white py-2.5 px-4 rounded-xl text-sm font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
                                >
                                    Get Started
                                </button>

                                <button
                                    type="button"
                                    onClick={closePopup}
                                    className="px-6 text-gray-400 text-xs hover:text-gray-600 transition-colors font-medium"
                                >
                                    Skip for now
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes scale-in {
                    0% {
                        transform: scale(0.9);
                        opacity: 0;
                    }
                    100% {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
                .animate-scale-in {
                    animation: scale-in 0.3s ease-out;
                }
            `}</style>
        </>
    );
}
