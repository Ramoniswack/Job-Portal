'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Star, Check } from 'lucide-react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

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
}

interface Category {
    _id: string;
    name: string;
    slug: string;
    description?: string;
}

export default function CategoryPage() {
    const params = useParams();
    const categorySlug = params.name as string;
    const [selectedSubcategory, setSelectedSubcategory] = useState('All');
    const [category, setCategory] = useState<Category | null>(null);
    const [subcategories, setSubcategories] = useState<Category[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCategoryData();
    }, [categorySlug]);

    useEffect(() => {
        if (category) {
            fetchServices();
        }
    }, [category, selectedSubcategory]);

    const fetchCategoryData = async () => {
        try {
            console.log('Fetching category:', categorySlug);
            const response = await fetch(`http://localhost:5000/api/categories/slug/${categorySlug}`);

            if (!response.ok) {
                console.error('Category fetch failed:', response.status);
                return;
            }

            const data = await response.json();
            console.log('Category data:', data);
            setCategory(data.category);
            setSubcategories(data.subcategories);
        } catch (error) {
            console.error('Error fetching category:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchServices = async () => {
        try {
            const url = selectedSubcategory === 'All'
                ? `http://localhost:5000/api/categories/slug/${categorySlug}/services`
                : `http://localhost:5000/api/categories/slug/${categorySlug}/services?subcategory=${encodeURIComponent(selectedSubcategory)}`;

            console.log('Fetching services from:', url);
            const response = await fetch(url);

            if (!response.ok) {
                console.error('Services fetch failed:', response.status);
                return;
            }

            const data = await response.json();
            console.log('Services data:', data);
            console.log('Number of services:', data.length);
            setServices(data);
        } catch (error) {
            console.error('Error fetching services:', error);
        }
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="pt-24 pb-10 px-4 sm:px-6 bg-[#F8F9FA] min-h-screen">
                    <div className="max-w-6xl mx-auto">
                        <div className="animate-pulse">
                            <div className="h-8 bg-[#E9ECEF] rounded w-1/3 mb-8"></div>
                            <div className="h-12 bg-[#E9ECEF] rounded w-1/2 mb-8"></div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="space-y-3">
                                        <div className="h-48 bg-[#E9ECEF] rounded-2xl"></div>
                                        <div className="h-4 bg-[#E9ECEF] rounded"></div>
                                        <div className="h-4 bg-[#E9ECEF] rounded w-2/3"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    if (!category) {
        return (
            <>
                <Navbar />
                <div className="pt-24 pb-10 px-4 sm:px-6 bg-[#F8F9FA] min-h-screen">
                    <div className="max-w-6xl mx-auto text-center py-20">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">Category Not Found</h1>
                        <p className="text-gray-600 mb-8">The category you're looking for doesn't exist.</p>
                        <Link href="/" className="text-[#FF6B35] hover:underline">
                            Go back to home
                        </Link>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    // Create subcategory list with "All" option
    const subcategoryOptions = ['All', ...subcategories.map(sub => sub.name)];

    return (
        <>
            <Navbar />

            <div className="pt-24 pb-10 px-4 sm:px-6 bg-[#F8F9FA] min-h-screen">
                <div className="max-w-6xl mx-auto">
                    <div className="text-sm text-gray-500 mb-5">
                        <Link href="/" className="hover:text-[#FF6B35]">Home</Link> / {category.name}
                    </div>

                    <h1 className="text-3xl font-bold text-[#1A2B3C] mb-8">{category.name}</h1>

                    {/* Subcategory Filter */}
                    {subcategoryOptions.length > 1 && (
                        <div className="mb-8 bg-white rounded-xl p-4 shadow-sm">
                            <div className="flex flex-wrap gap-3">
                                {subcategoryOptions.map((subcategory) => (
                                    <button
                                        key={subcategory}
                                        onClick={() => setSelectedSubcategory(subcategory)}
                                        className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${selectedSubcategory === subcategory
                                            ? 'bg-[#FF6B35] text-white shadow-md'
                                            : 'bg-[#F1F3F5] text-gray-700 hover:bg-[#E9ECEF]'
                                            }`}
                                    >
                                        {subcategory}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {services.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {services.map((service) => (
                                <Link key={service.id} href={`/service/${service.slug}`} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">
                                    <div className="rounded-2xl overflow-hidden aspect-[4/3] relative bg-gradient-to-br from-gray-100 to-gray-200">
                                        <img
                                            src={service.image}
                                            alt={service.title}
                                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                    <div className="p-4 space-y-1">
                                        <h3 className="text-lg font-semibold text-gray-900 truncate cursor-pointer hover:text-[#FF6B35] transition-colors">
                                            {service.title}
                                        </h3>
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
                                        <div className="text-[#FF6B35] font-bold text-lg pt-1">{service.price}</div>
                                        <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                                            {service.description}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <p className="text-gray-500 text-lg">No services available in this category yet.</p>
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </>
    );
}
