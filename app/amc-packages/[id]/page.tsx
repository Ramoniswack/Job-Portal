'use client';

import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

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
    createdBy?: {
        _id: string;
        name: string;
        email: string;
    };
}

export default function AMCPackagesPage() {
    const params = useParams();
    const id = params.id as string;
    const [packageData, setPackageData] = useState<AMCPackage | null>(null);
    const [loading, setLoading] = useState(true);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedTier, setSelectedTier] = useState<PricingTier | null>(null);
    const [currentUser, setCurrentUser] = useState<{ id: string; name: string; email: string } | null>(null);
    const [bookingData, setBookingData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        notes: ''
    });

    // Animation refs
    const heroRef = useRef<HTMLDivElement>(null);
    const heroTitleRef = useRef<HTMLHeadingElement>(null);
    const heroDescRef = useRef<HTMLParagraphElement>(null);
    const sectionTitleRef = useRef<HTMLHeadingElement>(null);
    const sectionDescRef = useRef<HTMLParagraphElement>(null);
    const packagesGridRef = useRef<HTMLDivElement>(null);
    const benefitsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (id) {
            fetchPackage();
            fetchCurrentUser();
        }
    }, [id]);

    const fetchCurrentUser = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) return;

        try {
            const response = await fetch('http://localhost:5000/api/users/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setCurrentUser({
                    id: data.data._id,
                    name: data.data.name,
                    email: data.data.email
                });
                setBookingData(prev => ({
                    ...prev,
                    name: data.data.name,
                    email: data.data.email
                }));
            }
        } catch (error) {
            console.error('Failed to fetch user:', error);
        }
    };

    // GSAP Animations
    useEffect(() => {
        if (!packageData || loading) return;

        const ctx = gsap.context(() => {
            const isMobile = window.innerWidth < 768;

            // 1. Hero section animations
            const heroTl = gsap.timeline({
                scrollTrigger: {
                    trigger: heroRef.current,
                    start: 'top 80%',
                    toggleActions: 'play none none reverse',
                }
            });

            heroTl.fromTo(
                heroTitleRef.current,
                { y: 60, opacity: 0, letterSpacing: '0.1em' },
                {
                    y: 0,
                    opacity: 1,
                    letterSpacing: '0em',
                    duration: 1.2,
                    ease: 'power4.out',
                }
            );

            heroTl.fromTo(
                heroDescRef.current,
                { y: 40, opacity: 0 },
                { y: 0, opacity: 1, duration: 1, ease: 'power4.out' },
                '-=0.9'
            );

            // 2. Section title animations
            const sectionTl = gsap.timeline({
                scrollTrigger: {
                    trigger: sectionTitleRef.current,
                    start: 'top 80%',
                    toggleActions: 'play none none reverse',
                }
            });

            sectionTl.fromTo(
                sectionTitleRef.current,
                { y: 50, opacity: 0 },
                { y: 0, opacity: 1, duration: 1, ease: 'power4.out' }
            );

            sectionTl.fromTo(
                sectionDescRef.current,
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, ease: 'power4.out' },
                '-=0.7'
            );

            // 3. Pricing cards animations
            const cards = packagesGridRef.current?.querySelectorAll('.pricing-card');
            if (cards && cards.length > 0) {
                const cardsTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: packagesGridRef.current,
                        start: 'top 75%',
                        toggleActions: 'play none none reverse',
                    }
                });

                // Animate all cards together (not sequentially)
                cards.forEach((card, index) => {
                    const direction = index % 2 === 0 ? -120 : 120;
                    const rotateDirection = index % 2 === 0 ? 10 : -10;

                    // Card entrance - all cards start together with slight overlap
                    cardsTl.fromTo(
                        card,
                        {
                            x: direction,
                            opacity: 0,
                            rotateY: isMobile ? 0 : rotateDirection,
                        },
                        {
                            x: 0,
                            opacity: 1,
                            rotateY: 0,
                            duration: 1.2,
                            ease: 'power4.out',
                        },
                        index === 0 ? '-=0.6' : '-=1.0'
                    );
                });

                // After cards are in, animate their contents
                cards.forEach((card, index) => {
                    // Card header animation
                    const header = card.querySelector('.card-header');
                    if (header) {
                        cardsTl.fromTo(
                            header,
                            { scaleX: 0, transformOrigin: 'center' },
                            { scaleX: 1, duration: 0.8, ease: 'power2.out' },
                            `-=${0.9 - index * 0.1}`
                        );
                    }
                });

                // Features list animations
                cards.forEach((card, index) => {
                    const features = card.querySelectorAll('.feature-item');
                    if (features.length > 0) {
                        cardsTl.fromTo(
                            features,
                            { opacity: 0, x: -30 },
                            {
                                opacity: 1,
                                x: 0,
                                duration: 0.6,
                                stagger: 0.15,
                                ease: 'power2.out',
                            },
                            `-=${0.5 - index * 0.2}`
                        );

                        // Checkmark bounce
                        const checkmarks = card.querySelectorAll('.checkmark');
                        if (checkmarks.length > 0) {
                            cardsTl.fromTo(
                                checkmarks,
                                { scale: 0 },
                                {
                                    scale: 1,
                                    duration: 0.4,
                                    stagger: 0.15,
                                    ease: 'back.out(3)',
                                },
                                `-=${0.8 - index * 0.2}`
                            );
                        }
                    }

                    // Button animation with pulse glow
                    const button = card.querySelector('.book-button');
                    if (button) {
                        cardsTl.fromTo(
                            button,
                            { opacity: 0, y: 20 },
                            { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
                            `-=${0.6 - index * 0.1}`
                        );

                        // Pulse glow effect
                        gsap.to(button, {
                            boxShadow: '0 0 20px rgba(255, 107, 53, 0.5)',
                            duration: 2.5,
                            repeat: -1,
                            yoyo: true,
                            ease: 'sine.inOut',
                            delay: 1.5 + index * 0.2,
                        });
                    }
                });

                // 4. Hover interactions (desktop only)
                if (!isMobile) {
                    cards.forEach((card) => {
                        card.addEventListener('mouseenter', () => {
                            gsap.to(card, {
                                scale: 1.03,
                                y: -8,
                                boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                                duration: 0.3,
                                ease: 'power2.out',
                            });
                        });

                        card.addEventListener('mouseleave', () => {
                            gsap.to(card, {
                                scale: 1,
                                y: 0,
                                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                                duration: 0.3,
                                ease: 'power2.out',
                            });
                        });
                    });
                }
            }

            // 5. Benefits section animation
            if (benefitsRef.current) {
                const benefitsTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: benefitsRef.current,
                        start: 'top 80%',
                        toggleActions: 'play none none none',
                    }
                });

                benefitsTl.fromTo(
                    benefitsRef.current,
                    { opacity: 0, y: 100, scale: 0.95 },
                    { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'power3.out' }
                );

                const benefitItems = benefitsRef.current.querySelectorAll('.benefit-item');
                if (benefitItems.length > 0) {
                    benefitsTl.fromTo(
                        benefitItems,
                        { opacity: 0, y: 30 },
                        {
                            opacity: 1,
                            y: 0,
                            duration: 0.6,
                            stagger: 0.15,
                            ease: 'power2.out',
                        },
                        '-=0.5'
                    );
                }
            }

        });

        return () => ctx.revert(); // Cleanup
    }, [packageData, loading]);

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
        const token = localStorage.getItem('authToken');
        if (!token) {
            toast.error('Login Required', {
                description: 'Please login to book an AMC package.',
                duration: 3000,
            });
            // Redirect to login page after 1 second
            setTimeout(() => {
                window.location.href = '/login';
            }, 1000);
            return;
        }

        // Check if current user is the package creator
        if (currentUser && packageData?.createdBy && currentUser.id === packageData.createdBy._id) {
            toast.error('Cannot Book Your Own Package', {
                description: 'This is your package and cannot be booked by you.',
                duration: 4000,
            });
            return;
        }

        setSelectedTier(tier);
        setShowBookingModal(true);
    };

    const handleBookingSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const token = localStorage.getItem('authToken');

        try {
            const response = await fetch('http://localhost:5000/api/amc-bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    packageId: packageData?._id,
                    packageTitle: packageData?.title,
                    tier: selectedTier,
                    customerName: bookingData.name,
                    customerEmail: bookingData.email,
                    customerPhone: bookingData.phone,
                    customerAddress: bookingData.address,
                    notes: bookingData.notes
                })
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Booking Request Submitted!', {
                    description: 'Your AMC package booking request has been submitted successfully. We will contact you shortly.',
                    duration: 5000,
                });
                setShowBookingModal(false);
                setBookingData({ name: '', email: '', phone: '', address: '', notes: '' });
            } else {
                toast.error('Booking Failed', {
                    description: data.message || 'Failed to submit booking request.',
                    duration: 4000,
                });
            }
        } catch (error) {
            console.error('Booking error:', error);
            toast.error('Connection Error', {
                description: 'Failed to submit booking. Please try again.',
                duration: 4000,
            });
        }
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
            <div ref={heroRef} className="relative h-[400px] overflow-hidden">
                <img
                    src={packageData.heroImage}
                    alt={packageData.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="text-center text-white px-4">
                        <h1 ref={heroTitleRef} className="text-5xl md:text-6xl font-bold mb-4 drop-shadow-lg opacity-0">
                            {packageData.category} <span className="text-[#FF6B35]">AMC Packages</span>
                        </h1>
                        <p ref={heroDescRef} className="text-xl md:text-2xl font-medium drop-shadow-md max-w-3xl mx-auto opacity-0">
                            {packageData.description}
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-12">
                <div className="text-center mb-12">
                    <h2 ref={sectionTitleRef} className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 opacity-0">
                        Choose Your Perfect Plan
                    </h2>
                    <p ref={sectionDescRef} className="text-lg text-gray-600 max-w-2xl mx-auto opacity-0">
                        Our expert team ensures your {packageData.category.toLowerCase()} system runs smoothly all year round with regular maintenance and emergency support.
                    </p>
                </div>

                {/* Packages Grid */}
                <div ref={packagesGridRef} className="flex flex-wrap justify-center gap-8 max-w-6xl mx-auto">
                    {packageData.pricingTiers.map((tier, index) => (
                        <div
                            key={index}
                            className="pricing-card w-[320px] border border-[#e0e0e0] rounded-lg p-5 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.1)] transition-shadow duration-300 opacity-0"
                            style={{ willChange: 'transform' }}
                        >
                            {/* Package Header */}
                            <div className="card-header bg-[#ff8c42] text-white text-center py-[15px] px-4 font-bold text-[1.1rem] rounded mb-5">
                                {tier.name.toUpperCase()}
                            </div>

                            {/* Price */}
                            <div className="text-center mb-5">
                                <div className="text-[1.2rem] text-[#333] mb-1">
                                    NPR <span className="text-[3rem] font-extrabold text-[#1a2a3a]">{tier.price.toLocaleString()}</span>/mo
                                </div>
                                <div className="text-[#666] text-base -mt-1 mb-5">
                                    {tier.duration === 'month' ? 'Monthly' : tier.duration === 'quarter' ? 'Quarterly' : 'Yearly'} Billing
                                </div>
                            </div>

                            {/* Book Button */}
                            <button
                                onClick={() => handleBookNow(tier)}
                                className="book-button w-full py-3 px-4 border-2 border-[#ff8c42] bg-white text-[#ff8c42] font-bold rounded cursor-pointer text-center mb-[25px] hover:bg-[#ff8c42] hover:text-white transition-colors duration-200 opacity-0"
                            >
                                Book Now
                            </button>

                            {/* Features */}
                            <ul className="list-none p-0 m-0">
                                {tier.features.map((feature, idx) => (
                                    <li key={idx} className="feature-item mb-3 text-[#333] flex items-center text-[1.05rem] opacity-0">
                                        <span className="checkmark text-[#4caf50] mr-3 font-bold">✔</span>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Additional Information */}
                <div ref={benefitsRef} className="mt-16 bg-white rounded-2xl border border-gray-200 p-8 max-w-4xl mx-auto opacity-0">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{packageData.whyChooseHeading}</h3>
                    <div className="grid md:grid-cols-2 gap-6 text-gray-700">
                        {packageData.benefits.map((benefit, index) => (
                            <div key={index} className="benefit-item opacity-0">
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
                                        readOnly
                                        disabled
                                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
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
                                        readOnly
                                        disabled
                                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
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
