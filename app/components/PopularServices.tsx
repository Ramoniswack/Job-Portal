'use client';

import { useState, useRef, useEffect } from 'react';
import { Star, Check, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import Link from 'next/link';

interface Service {
    id: string;
    slug: string;
    title: string;
    provider: string;
    verified: boolean;
    rating: number;
    price: string;
    description: string;
    image: string;
    location: string;
}

export default function PopularServices() {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPopularServices();
    }, []);

    const fetchPopularServices = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/services?popular=true&status=active');
            if (!response.ok) {
                throw new Error('Failed to fetch services');
            }
            const data = await response.json();

            // Transform data
            const transformedServices = data
                .map((service: any) => ({
                    id: service._id,
                    slug: service.slug,
                    title: service.title,
                    provider: service.provider?.name || 'Hamro Sewa',
                    verified: service.provider?.verified || true,
                    rating: service.rating || 0,
                    price: service.priceLabel,
                    description: service.shortDescription || service.description,
                    image: service.images[0]?.url || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=400',
                    location: service.location || 'Kathmandu'
                }))
                .sort((a: any, b: any) => b.rating - a.rating); // Sort by rating descending

            setServices(transformedServices.slice(0, 12)); // Limit to 12 popular services
        } catch (error) {
            console.error('Error fetching popular services:', error);
            setServices([]);
        } finally {
            setLoading(false);
        }
    };

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 350;
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!scrollContainerRef.current) return;
        setIsDragging(true);
        setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
        setScrollLeft(scrollContainerRef.current.scrollLeft);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !scrollContainerRef.current) return;
        e.preventDefault();
        const x = e.pageX - scrollContainerRef.current.offsetLeft;
        const walk = (x - startX) * 2;
        scrollContainerRef.current.scrollLeft = scrollLeft - walk;
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
    };

    if (loading) {
        return (
            <div className="bg-white py-12 px-4">
                <div className="max-w-6xl mx-auto relative">
                    <h2 className="text-3xl font-bold text-[#1A2B3C] mb-8">Popular Services</h2>
                    <div className="grid grid-flow-col auto-cols-[minmax(250px,1fr)] sm:auto-cols-[minmax(280px,1fr)] md:auto-cols-[minmax(300px,1fr)] gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="space-y-3">
                                <div className="h-48 bg-gray-200 rounded-2xl animate-pulse"></div>
                                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (services.length === 0) {
        return (
            <div className="bg-white py-12 px-4">
                <div className="max-w-6xl mx-auto relative">
                    <h2 className="text-3xl font-bold text-[#1A2B3C] mb-8">Popular Services</h2>
                    <p className="text-gray-500 text-center py-10">No popular services available at the moment.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white py-12 px-4">
            <div className="max-w-6xl mx-auto relative">
                <h2 className="text-3xl font-bold text-[#1A2B3C] mb-8">Popular Services</h2>

                <button
                    onClick={() => scroll('left')}
                    className="absolute left-[-20px] top-1/2 -translate-y-1/2 z-10 bg-[#26cf71] text-white p-2 rounded-full shadow-lg hover:bg-[#1eb863] transition hidden md:block"
                >
                    <ChevronLeft className="h-6 w-6" />
                </button>

                <button
                    onClick={() => scroll('right')}
                    className="absolute right-[-20px] top-1/2 -translate-y-1/2 z-10 bg-[#26cf71] text-white p-2 rounded-full shadow-lg hover:bg-[#1eb863] transition hidden md:block"
                >
                    <ChevronRight className="h-6 w-6" />
                </button>

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
                    <div className="grid grid-flow-col auto-cols-[minmax(250px,1fr)] sm:auto-cols-[minmax(280px,1fr)] md:auto-cols-[minmax(300px,1fr)] gap-6">
                        {services.map((service) => (
                            <Link key={service.id} href={`/service/${service.slug}`} className="bg-transparent block">
                                <div className="rounded-2xl overflow-hidden mb-4 aspect-[4/3]">
                                    <img
                                        src={service.image}
                                        alt={service.title}
                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                        draggable="false"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-lg font-semibold text-gray-900 truncate cursor-pointer hover:text-[#26cf71] transition-colors">{service.title}</h3>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1">
                                            <span className="text-sm text-gray-600">{service.provider}</span>
                                            {service.verified && (
                                                <div className="bg-orange-500 rounded-full p-0.5">
                                                    <Check className="w-2 h-2 text-white" strokeWidth={4} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                            <span className="text-sm font-semibold text-gray-800">
                                                {service.rating > 0 ? service.rating.toFixed(1) : 'New'}
                                            </span>
                                        </div>
                                    </div>
                                    {service.location && (
                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                            <MapPin className="w-3 h-3" />
                                            <span>{service.location}</span>
                                        </div>
                                    )}
                                    <div className="text-[#26cf71] font-bold text-lg pt-1">{service.price}</div>
                                    <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                                        {service.description}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                <style jsx>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
            </div>
        </div>
    );
}
