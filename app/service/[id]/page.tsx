'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Check, MapPin } from 'lucide-react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function ServiceDetails() {
    const params = useParams();
    const router = useRouter();
    const serviceSlug = params.id as string;

    const [location, setLocation] = useState('Location');
    const [selectedDate, setSelectedDate] = useState(4);
    const [selectedTime, setSelectedTime] = useState(0);
    const [promoCode, setPromoCode] = useState('');
    const [selectedImage, setSelectedImage] = useState(0);
    const [service, setService] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState<any[]>([]);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeftPos, setScrollLeftPos] = useState(0);

    useEffect(() => {
        fetchService();
        fetchCategories();
    }, [serviceSlug]);

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

    const images = service?.images?.map((img: any) => img.url) || [
        'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=800',
        'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=800',
        'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800',
    ];

    const dates = [
        { day: 'Tue', date: 17 },
        { day: 'Wed', date: 18 },
        { day: 'Thu', date: 19 },
        { day: 'Fri', date: 20 },
        { day: 'Sat', date: 21 },
    ];

    const timeSlots = [
        '8AM - 9AM',
        '9AM - 10AM',
        '10AM - 11AM',
        '11AM - 12AM',
        '12PM - 1PM',
        '1PM - 2PM',
    ];

    if (loading) {
        return (
            <>
                <Navbar location={location} setLocation={setLocation} />
                <div className="pt-24 pb-10 px-4 sm:px-6 bg-white min-h-screen">
                    <div className="max-w-6xl mx-auto">
                        <div className="animate-pulse">
                            <div className="h-8 bg-gray-200 rounded w-2/3 mb-4"></div>
                            <div className="h-6 bg-gray-200 rounded w-1/3 mb-8"></div>
                            <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12">
                                <div>
                                    <div className="h-96 bg-gray-200 rounded-xl mb-4"></div>
                                    <div className="grid grid-cols-6 gap-3 mb-8">
                                        {[1, 2, 3, 4, 5, 6].map((i) => (
                                            <div key={i} className="aspect-square bg-gray-200 rounded-lg"></div>
                                        ))}
                                    </div>
                                </div>
                                <div className="h-96 bg-gray-200 rounded-2xl"></div>
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
                <Navbar location={location} setLocation={setLocation} />
                <div className="pt-24 pb-10 px-4 sm:px-6 bg-white min-h-screen">
                    <div className="max-w-6xl mx-auto text-center py-20">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">Service Not Found</h1>
                        <p className="text-gray-600 mb-8">The service you're looking for doesn't exist.</p>
                        <button
                            onClick={() => router.back()}
                            className="text-[#26cf71] hover:underline"
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
            <Navbar location={location} setLocation={setLocation} />

            <div className="pt-24 pb-10 px-4 sm:px-6 bg-white">
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
                            <div className="text-[#26cf71] font-bold mb-2 flex items-center gap-2">
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
                            <div className="relative bg-gray-100 rounded-xl overflow-hidden border border-gray-200 mb-4">
                                <button
                                    onClick={() => setSelectedImage((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-[#26cf71] text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#1eb863] transition z-10"
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
                                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#26cf71] text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#1eb863] transition z-10"
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
                                        className={`aspect-square rounded-lg border-2 cursor-pointer overflow-hidden transition ${selectedImage === i ? 'border-[#26cf71]' : 'border-gray-300 hover:border-gray-400'
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
                            <div className="bg-green-50 p-6 rounded-xl mt-10">
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
                                <div className="bg-green-50 rounded-lg p-3 text-sm border-l-4 border-[#26cf71] mb-5">
                                    <strong className="text-[#1eb863]">* Price Description</strong>
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
                                                ? 'border-2 border-[#26cf71] text-[#26cf71] font-bold'
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
                                    {timeSlots.map((time, index) => (
                                        <div
                                            key={index}
                                            onClick={() => setSelectedTime(index)}
                                            className={`border rounded-full py-2 px-2 text-xs text-center cursor-pointer transition ${selectedTime === index
                                                ? 'bg-green-50 border-[#26cf71] text-[#26cf71] font-semibold'
                                                : 'border-gray-300'
                                                }`}
                                        >
                                            {selectedTime === index && '✓ '}
                                            {time}
                                        </div>
                                    ))}
                                </div>

                                {/* Promo Code */}
                                <label className="font-bold block mb-3">Promo Code</label>
                                <div className="flex border border-gray-300 rounded-lg overflow-hidden mb-6">
                                    <input
                                        type="text"
                                        placeholder="eg: FREE20"
                                        value={promoCode}
                                        onChange={(e) => setPromoCode(e.target.value)}
                                        className="flex-1 px-4 py-3 outline-none text-sm"
                                    />
                                    <button className="bg-[#26cf71] text-white px-5 font-bold hover:bg-[#1eb863] transition">
                                        APPLY
                                    </button>
                                </div>

                                {/* Book Now Button */}
                                <button className="w-full bg-[#26cf71] text-white py-4 rounded-xl text-lg font-bold hover:bg-[#1eb863] transition">
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

            <Footer />
        </>
    );
}
