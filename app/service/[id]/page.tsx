'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Check, MapPin, User } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function ServiceDetails() {
    const params = useParams();
    const router = useRouter();
    const serviceSlug = params.id as string;

    const [selectedImage, setSelectedImage] = useState(0);
    const [service, setService] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [relatedServices, setRelatedServices] = useState<any[]>([]);

    // Booking modal state
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [bookingData, setBookingData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        notes: ''
    });

    const images = service?.images?.map((img: any) => img.url) || [
        'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=800',
        'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=800',
        'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800',
    ];

    useEffect(() => {
        fetchService();
    }, [serviceSlug]);

    // Fetch related services when service is loaded
    useEffect(() => {
        if (service?.category?._id) {
            fetchRelatedServices();
        }
    }, [service]);

    const fetchService = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/services/slug/${serviceSlug}`);
            if (response.ok) {
                const data = await response.json();
                setService(data);
            } else {
                console.error('Service not found');
            }
        } catch (error) {
            console.error('Error fetching service:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRelatedServices = async () => {
        try {
            const categoryId = typeof service.category === 'object' ? service.category._id : service.category;
            const response = await fetch(`http://localhost:5000/api/services`);
            if (response.ok) {
                const data = await response.json();
                // Filter services from same category, exclude current service, limit to 4
                const related = data
                    .filter((s: any) => {
                        // Skip services without a category
                        if (!s.category) return false;

                        const sCategoryId = typeof s.category === 'object' ? s.category._id : s.category;
                        return sCategoryId === categoryId && s._id !== service._id && s.status === 'active';
                    })
                    .slice(0, 4);
                setRelatedServices(related);
            }
        } catch (error) {
            console.error('Error fetching related services:', error);
        }
    };

    const handleBookNow = () => {
        // Check if user is logged in
        const token = localStorage.getItem('authToken');
        if (!token) {
            // Save current URL to return after login
            localStorage.setItem('returnUrl', window.location.pathname);
            toast.error('Login Required', {
                description: 'Please login or register to book this service.',
                duration: 4000,
            });
            // Redirect to login page after 1 second
            setTimeout(() => {
                router.push('/login');
            }, 1000);
            return;
        }

        // Check if user is the service owner
        const currentUserStr = localStorage.getItem('currentUser');
        if (currentUserStr) {
            try {
                const currentUser = JSON.parse(currentUserStr);
                const userId = currentUser.id || currentUser._id;
                const serviceOwnerId = service.createdBy?._id;

                if (userId === serviceOwnerId) {
                    toast.error('Cannot Book Your Own Service', {
                        description: 'You cannot book your own service. Customers can book this service and you will receive notifications.',
                        duration: 4000,
                    });
                    return;
                }
            } catch (error) {
                console.error('Error parsing user data:', error);
            }
        }

        // Prefill user data from localStorage
        if (currentUserStr) {
            try {
                const currentUser = JSON.parse(currentUserStr);
                setBookingData({
                    name: currentUser.name || '',
                    email: currentUser.email || '',
                    phone: currentUser.phone || '',
                    address: '',
                    notes: ''
                });
            } catch (error) {
                console.error('Error parsing user data:', error);
            }
        }

        setShowBookingModal(true);
    };

    const handleBookingSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const token = localStorage.getItem('authToken');

        if (!token) {
            toast.error('Session Expired', {
                description: 'Please login again to continue.',
                duration: 4000,
            });
            // Save current URL to return after login
            localStorage.setItem('returnUrl', window.location.pathname);
            setTimeout(() => {
                router.push('/login');
            }, 1000);
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    serviceId: service?._id,
                    serviceTitle: service?.title,
                    customerName: bookingData.name,
                    customerEmail: bookingData.email,
                    customerPhone: bookingData.phone,
                    customerAddress: bookingData.address,
                    notes: bookingData.notes
                })
            });

            const data = await response.json();

            if (data.success) {
                // Open WhatsApp if URL is provided
                if (data.whatsappUrl) {
                    window.open(data.whatsappUrl, '_blank');
                }

                toast.success('Booking Submitted!', {
                    description: 'Your booking request has been submitted and is pending admin approval. WhatsApp message sent to service provider.',
                    duration: 6000,
                });
                setShowBookingModal(false);
                setBookingData({ name: '', email: '', phone: '', address: '', notes: '' });
            } else if (response.status === 401 || data.requiresAuth) {
                // Token is invalid or expired
                localStorage.removeItem('authToken');
                localStorage.removeItem('currentUser');
                localStorage.setItem('returnUrl', window.location.pathname);
                toast.error('Session Expired', {
                    description: 'Please login again to continue booking.',
                    duration: 4000,
                });
                setTimeout(() => {
                    router.push('/login');
                }, 1000);
            } else {
                toast.error('Booking Failed', {
                    description: data.message || 'Failed to submit booking. Please try again.',
                    duration: 4000,
                });
            }
        } catch (error) {
            console.error('Booking error:', error);
            toast.error('Connection Error', {
                description: 'Failed to submit booking. Please check your connection and try again.',
                duration: 4000,
            });
        }
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="pt-24 pb-10 px-4 sm:px-6 bg-[#FFFFFF] min-h-screen">
                    <div className="max-w-6xl mx-auto">
                        <div className="animate-pulse">
                            <div className="h-8 bg-[#E9ECEF] rounded w-2/3 mb-4"></div>
                            <div className="h-6 bg-[#E9ECEF] rounded w-1/3 mb-8"></div>
                            <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12">
                                <div>
                                    <div className="h-96 bg-[#E9ECEF] rounded-xl mb-4"></div>
                                    <div className="grid grid-cols-6 gap-3 mb-8">
                                        {[1, 2, 3, 4, 5, 6].map((i) => (
                                            <div key={i} className="aspect-square bg-[#E9ECEF] rounded-lg"></div>
                                        ))}
                                    </div>
                                </div>
                                <div className="h-96 bg-[#E9ECEF] rounded-2xl"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    if (!service) {
        return (
            <>
                <Navbar />
                <div className="pt-24 pb-10 px-4 sm:px-6 bg-[#FFFFFF] min-h-screen">
                    <div className="max-w-6xl mx-auto text-center py-20">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">Service Not Found</h1>
                        <p className="text-gray-600 mb-8">The service you're looking for doesn't exist.</p>
                        <button
                            onClick={() => router.back()}
                            className="text-[#FF6B35] hover:underline"
                        >
                            Go back
                        </button>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Navbar />

            <div className="pt-24 pb-10 px-4 sm:px-6 bg-[#FFFFFF]">
                <div className="max-w-6xl mx-auto">
                    {/* Breadcrumbs */}
                    <div className="text-sm text-gray-500 mb-5">
                        Home / {service.category?.name}{service.subCategory ? ` / ${service.subCategory}` : ''} / {service.title}
                    </div>

                    {/* Main Container */}
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12 items-start">
                        {/* Left Side */}
                        <div>
                            <h1 className="text-3xl font-bold mb-2">{service.title}</h1>
                            <div className="text-gray-700 font-medium mb-2 flex items-center gap-2">
                                <User className="w-8 h-8 text-gray-600" />
                                <span className="text-sm">by {service.createdBy?.name || service.provider.name}</span>
                                {service.provider.verified && (
                                    <Check className="w-4 h-4 bg-blue-500 text-white rounded-full p-0.5" />
                                )}
                            </div>
                            {service.location && (
                                <div className="flex items-center gap-1 text-sm text-gray-600 mb-5">
                                    <MapPin className="w-4 h-4" />
                                    <span>{service.location}</span>
                                </div>
                            )}

                            {/* Main Image Slider */}
                            <div className="relative bg-[#F1F3F5] rounded-xl overflow-hidden border border-gray-200 mb-4">
                                <button
                                    onClick={() => setSelectedImage((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-[#FF6B35] text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#FF5722] transition z-10"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <img
                                    src={images[selectedImage]}
                                    alt="Service"
                                    className="w-full h-auto"
                                />
                                <button
                                    onClick={() => setSelectedImage((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#FF6B35] text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#FF5722] transition z-10"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Thumbnails */}
                            <div className="grid grid-cols-4 gap-3 mb-8">
                                {images.slice(0, 4).map((img: string, i: number) => (
                                    <div
                                        key={i}
                                        onClick={() => setSelectedImage(i)}
                                        className={`aspect-square rounded-lg border-2 cursor-pointer overflow-hidden transition ${selectedImage === i ? 'border-[#FF6B35]' : 'border-gray-300 hover:border-gray-400'
                                            }`}
                                    >
                                        <img
                                            src={img}
                                            alt={`Thumbnail ${i + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ))}
                            </div>



                            {/* Reviews */}
                            <div className="bg-[#F8F9FA] p-6 rounded-xl mt-10">
                                <strong className="text-lg">
                                    Reviews for this service
                                </strong>
                                <p className="mt-3 text-gray-600">
                                    {service.rating > 0 ? (
                                        <>
                                            {'⭐'.repeat(Math.round(service.rating))} {service.rating.toFixed(1)}
                                        </>
                                    ) : (
                                        'No ratings yet'
                                    )}
                                </p>
                            </div>
                        </div>

                        {/* Right Side - Sticky Booking Card */}
                        <div className="lg:sticky lg:top-24">
                            <div className="border border-gray-200 rounded-2xl p-6 shadow-lg">
                                {/* Header */}
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xl font-bold">Book a Service</h3>
                                    <span className="text-2xl font-extrabold">{service.priceLabel}</span>
                                </div>

                                {/* Price Description */}
                                <div className="bg-[#F8F9FA] rounded-lg p-3 text-sm border-l-4 border-[#FF6B35] mb-5">
                                    <strong className="text-[#FF5722]">* Price Description</strong>
                                    <p className="mt-1 text-gray-700">
                                        {service.shortDescription || service.description}
                                    </p>
                                </div>

                                {/* Full Description */}
                                <div className="mb-5">
                                    <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                                        {service.description}
                                    </p>
                                    {service.features && service.features.length > 0 && (
                                        <ul className="space-y-2">
                                            {service.features.map((feature: string, index: number) => (
                                                <li key={index} className="flex items-start gap-2 text-sm">
                                                    <span className="text-green-500 mt-0.5">✓</span>
                                                    <span className="text-gray-700">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>

                                {/* Book Now Button */}
                                <button
                                    onClick={handleBookNow}
                                    className="w-full bg-[#FF6B35] text-white py-4 px-4 rounded-lg text-lg font-bold hover:bg-[#FF5722] transition shadow-lg hover:shadow-xl transform hover:scale-105 duration-300 cursor-pointer"
                                >
                                    Book Now
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Related Services Section */}
                    {relatedServices.length > 0 && (
                        <div className="mt-16">
                            <h2 className="text-3xl font-bold text-[#1A2B3C] mb-8">
                                Related Services
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {relatedServices.map((relatedService: any) => (
                                    <Link
                                        key={relatedService._id}
                                        href={`/service/${relatedService.slug}`}
                                        className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                                    >
                                        {/* Service Image */}
                                        <div className="relative h-48 bg-gray-100 overflow-hidden">
                                            {relatedService.images && relatedService.images[0] && (
                                                <img
                                                    src={relatedService.images[0].url}
                                                    alt={relatedService.title}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                />
                                            )}
                                            {/* Badges */}
                                            <div className="absolute top-2 left-2 flex gap-2">
                                                {relatedService.featured && (
                                                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                                                        HOT
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Service Info */}
                                        <div className="p-4">
                                            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#FF6B35] transition-colors">
                                                {relatedService.title}
                                            </h3>
                                            <p className="text-sm text-gray-500 mb-3">
                                                {relatedService.category && typeof relatedService.category === 'object'
                                                    ? relatedService.category.name
                                                    : 'Service'}
                                            </p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-lg font-bold text-[#FF6B35]">
                                                    {relatedService.priceLabel}
                                                </span>
                                                {relatedService.rating > 0 && (
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-yellow-500">⭐</span>
                                                        <span className="text-sm font-medium text-gray-700">
                                                            {relatedService.rating.toFixed(1)}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Booking Modal */}
            {showBookingModal && (
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
                            <h2 className="text-lg sm:text-2xl font-bold text-gray-900">Complete Your Booking</h2>
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
                            {/* Service Info */}
                            <div className="bg-[#FFF5F0] border-l-4 border-[#FF6B35] rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                                <h3 className="font-bold text-gray-900 mb-2 text-sm sm:text-base">{service.title}</h3>
                                <div className="text-xs sm:text-sm text-gray-700">
                                    <p><span className="font-semibold">Price:</span> {service.priceLabel}</p>
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
                                        disabled
                                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
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
                                        disabled
                                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
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
        </>
    );
}
