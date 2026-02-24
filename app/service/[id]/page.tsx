'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Check, MapPin } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function ServiceDetails() {
    const params = useParams();
    const router = useRouter();
    const serviceSlug = params.id as string;

    const [selectedDate, setSelectedDate] = useState(0);
    const [selectedTime, setSelectedTime] = useState(0);
    const [selectedImage, setSelectedImage] = useState(0);
    const [service, setService] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState<any[]>([]);
    const [bookedSlots, setBookedSlots] = useState<string[]>([]);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeftPos, setScrollLeftPos] = useState(0);

    // Booking modal state
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [bookingData, setBookingData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        notes: ''
    });

    useEffect(() => {
        fetchService();
        fetchCategories();
    }, [serviceSlug]);

    // Fetch booked slots when date changes
    useEffect(() => {
        if (service?._id && dates[selectedDate]) {
            fetchBookedSlots();
        }
    }, [selectedDate, service]);

    const fetchBookedSlots = async () => {
        if (!service?._id || !dates[selectedDate]) return;

        try {
            const dateStr = dates[selectedDate].fullDate;
            const response = await fetch(`http://localhost:5000/api/service-bookings/booked-slots?serviceId=${service._id}&date=${dateStr}`);
            const data = await response.json();

            if (data.success) {
                setBookedSlots(data.data);
            }
        } catch (error) {
            console.error('Error fetching booked slots:', error);
        }
    };

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

    const fetchCategories = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/categories/parent');
            if (response.ok) {
                const data = await response.json();
                setCategories(data);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!scrollContainerRef.current) return;
        setIsDragging(true);
        setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
        setScrollLeftPos(scrollContainerRef.current.scrollLeft);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !scrollContainerRef.current) return;
        e.preventDefault();
        const x = e.pageX - scrollContainerRef.current.offsetLeft;
        const walk = (x - startX) * 2;
        scrollContainerRef.current.scrollLeft = scrollLeftPos - walk;
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
    };

    const handleBookNow = () => {
        // Check if selected time slot is booked
        const selectedTimeSlot = timeSlots[selectedTime];
        if (bookedSlots.includes(selectedTimeSlot)) {
            toast.error('This time slot is already booked', {
                description: 'Please choose another time slot.',
                duration: 4000,
            });
            return;
        }
        setShowBookingModal(true);
    };

    const handleBookingSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const selectedTimeSlot = timeSlots[selectedTime];
        const selectedDateStr = dates[selectedDate].fullDate;

        try {
            const response = await fetch('http://localhost:5000/api/service-bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    serviceId: service?._id,
                    serviceTitle: service?.title,
                    customerName: bookingData.name,
                    customerEmail: bookingData.email,
                    customerPhone: bookingData.phone,
                    customerAddress: bookingData.address,
                    bookingDate: selectedDateStr,
                    bookingTime: selectedTimeSlot,
                    notes: bookingData.notes
                })
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Booking Confirmed!', {
                    description: `Your booking for ${selectedTimeSlot} on ${new Date(selectedDateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} has been confirmed. We will contact you soon.`,
                    duration: 5000,
                });
                setShowBookingModal(false);
                setBookingData({ name: '', email: '', phone: '', address: '', notes: '' });
                fetchBookedSlots(); // Refresh booked slots
            } else if (data.isBooked) {
                toast.error('Time Slot Already Booked', {
                    description: 'This time slot has just been booked by someone else. Please choose another time.',
                    duration: 4000,
                });
                setShowBookingModal(false);
                fetchBookedSlots(); // Refresh to show updated slots
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

    // Generate next 7 days
    const generateDates = () => {
        const dates = [];
        const today = new Date();

        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);

            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

            dates.push({
                day: dayNames[date.getDay()],
                date: date.getDate(),
                month: monthNames[date.getMonth()],
                fullDate: date.toISOString().split('T')[0] // YYYY-MM-DD format
            });
        }

        return dates;
    };

    const dates = generateDates();

    const images = service?.images?.map((img: any) => img.url) || [
        'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=800',
        'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=800',
        'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800',
    ];

    const timeSlots = [
        '8AM - 9AM',
        '9AM - 10AM',
        '10AM - 11AM',
        '11AM - 12PM',
        '12PM - 1PM',
        '1PM - 2PM',
        '2PM - 3PM',
        '3PM - 4PM',
        '4PM - 5PM',
        '5PM - 6PM'
    ];

    const isTimeSlotBooked = (timeSlot: string) => {
        return bookedSlots.includes(timeSlot);
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
                        Home / {service.category?.name} / {service.subCategory} / {service.title}
                    </div>

                    {/* Main Container */}
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12 items-start">
                        {/* Left Side */}
                        <div>
                            <h1 className="text-3xl font-bold mb-2">{service.title}</h1>
                            <div className="text-[#FF6B35] font-bold mb-2 flex items-center gap-2">
                                by {service.provider.name}{' '}
                                {service.provider.verified && (
                                    <Check className="w-4 h-4 bg-orange-500 text-white rounded-full p-0.5" />
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

                            {/* Description */}
                            <div className="my-8 leading-relaxed">
                                <p className="mb-4">{service.description}</p>
                                {service.features && service.features.length > 0 && (
                                    <ul className="space-y-2">
                                        {service.features.map((feature: string, index: number) => (
                                            <li key={index} className="flex items-start gap-3">
                                                <span className="text-green-500 text-lg">✓</span>
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
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

                                {/* Select Date */}
                                <label className="font-bold block mb-3">Select Date</label>
                                <div className="grid grid-cols-5 gap-2 mb-5">
                                    {dates.map((date, index) => (
                                        <div
                                            key={index}
                                            onClick={() => setSelectedDate(index)}
                                            className={`border rounded-xl p-2 text-center cursor-pointer transition ${selectedDate === index
                                                ? 'border-2 border-[#FF6B35] text-[#FF6B35] font-bold'
                                                : 'border-gray-300'
                                                }`}
                                        >
                                            <div className="text-xs">{date.day}</div>
                                            <div className="text-base font-semibold">{date.date}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Choose Time */}
                                <label className="font-bold block mb-3">Choose a time period</label>
                                <div className="grid grid-cols-3 gap-2 mb-5">
                                    {timeSlots.map((time, index) => {
                                        const isBooked = isTimeSlotBooked(time);
                                        return (
                                            <div
                                                key={index}
                                                onClick={() => !isBooked && setSelectedTime(index)}
                                                className={`border rounded-full py-2 px-2 text-xs text-center transition ${isBooked
                                                    ? 'bg-red-50 border-red-300 text-red-500 cursor-not-allowed opacity-60'
                                                    : selectedTime === index
                                                        ? 'bg-[#F8F9FA] border-[#FF6B35] text-[#FF6B35] font-semibold cursor-pointer'
                                                        : 'border-gray-300 cursor-pointer hover:border-[#FF6B35]'
                                                    }`}
                                            >
                                                {isBooked ? '🔒 ' : selectedTime === index ? '✓ ' : ''}
                                                {time}
                                                {isBooked && <div className="text-[10px] mt-0.5">Booked</div>}
                                            </div>
                                        );
                                    })}
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

                    {/* Browse by Category Section */}
                    {categories.length > 0 && (
                        <div className="mt-16">
                            <h2 className="text-3xl font-bold text-[#1A2B3C] mb-8">
                                Browse by Category
                            </h2>
                            <div
                                ref={scrollContainerRef}
                                onMouseDown={handleMouseDown}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseLeave}
                                className={`overflow-x-auto scrollbar-hide select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'
                                    }`}
                                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                            >
                                <div className="flex gap-8 pb-4">
                                    {categories.map((category: any) => (
                                        <Link
                                            key={category._id}
                                            href={`/category/${category.slug}`}
                                            className="flex flex-col items-center text-center min-w-[140px] hover:scale-105 transition-transform duration-200"
                                        >
                                            <div className="h-32 w-32 mb-4 flex items-center justify-center">
                                                <img
                                                    src={category.image}
                                                    alt={category.name}
                                                    className="w-full h-full object-cover rounded-lg"
                                                    draggable="false"
                                                />
                                            </div>
                                            <span className="text-base font-semibold text-gray-800 leading-tight cursor-pointer">
                                                {category.name}
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>

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
                                <div className="text-xs sm:text-sm text-gray-700 flex flex-wrap gap-x-6 gap-y-1">
                                    <p><span className="font-semibold">Date:</span> {dates[selectedDate].day}, {dates[selectedDate].date}</p>
                                    <p><span className="font-semibold">Time:</span> {timeSlots[selectedTime]}</p>
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
        </>
    );
}
