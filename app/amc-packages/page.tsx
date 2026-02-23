'use client';

import { Check } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

interface AMCPackage {
    _id: string;
    name: string;
    category: string;
    price: number;
    duration: string;
    features: string[];
    description: string;
    image: string;
}

export default function AMCPackagesPage() {
    const searchParams = useSearchParams();
    const category = searchParams.get('category') || 'Plumbing';
    const [packages, setPackages] = useState<AMCPackage[]>([]);
    const [loading, setLoading] = useState(true);

    const getCategoryImage = (cat: string) => {
        const images: Record<string, string> = {
            'Plumbing': 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1200&q=80',
            'Electrical': 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=1200&q=80',
            'Computer': 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=1200&q=80',
            'AC Maintenance': 'https://images.unsplash.com/photo-1631545806609-4b0e36e4c824?w=1200&q=80',
            'Home Appliance': 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=1200&q=80'
        };
        return images[cat] || images['Plumbing'];
    };

    useEffect(() => {
        fetchPackages();
    }, [category]);

    const fetchPackages = async () => {
        try {
            const url = category
                ? `http://localhost:5000/api/amc-packages?category=${category}`
                : 'http://localhost:5000/api/amc-packages';

            const response = await fetch(url);
            const data = await response.json();

            if (data.success) {
                setPackages(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch packages:', error);
        } finally {
            setLoading(false);
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

    return (
        <div className="min-h-screen bg-[#F8F9FA]">
            {/* Navbar */}
            <Navbar />

            {/* Hero Image Section */}
            <div className="relative h-[400px] overflow-hidden">
                <img
                    src={packages[0]?.image || getCategoryImage(category)}
                    alt={`${category} Services`}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="text-center text-white px-4">
                        <h1 className="text-5xl md:text-6xl font-bold mb-4 drop-shadow-lg">
                            {category} <span className="text-[#FF6B35]">AMC Packages</span>
                        </h1>
                        <p className="text-xl md:text-2xl font-medium drop-shadow-md max-w-3xl mx-auto">
                            Professional maintenance plans to keep your {category.toLowerCase()} system running smoothly
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
                        Our expert team ensures your {category.toLowerCase()} system runs smoothly all year round with regular maintenance and emergency support.
                    </p>
                </div>

                {/* Packages Grid */}
                {packages.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-600 text-lg">No packages available for this category yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
                        {packages.map((pkg) => (
                            <div
                                key={pkg._id}
                                className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-2xl hover:border-orange-300 transition-all duration-300 flex flex-col"
                            >
                                {/* Package Header */}
                                <div className="bg-orange-500 text-white text-center py-5 px-6">
                                    <h2 className="text-2xl font-bold uppercase tracking-wide">{pkg.name}</h2>
                                </div>

                                {/* Price */}
                                <div className="text-center py-10 border-b border-gray-100 bg-gradient-to-b from-orange-50 to-white">
                                    <div className="text-4xl font-bold text-gray-900">
                                        NPR {pkg.price.toLocaleString()}
                                    </div>
                                    <div className="text-gray-500 text-base mt-3">/{pkg.duration}</div>
                                </div>

                                {/* Features */}
                                <div className="flex-1 p-8">
                                    <ul className="space-y-5">
                                        {pkg.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-start gap-3">
                                                <div className="flex-shrink-0 w-6 h-6 bg-[#F1F3F5] rounded-full flex items-center justify-center mt-0.5">
                                                    <Check className="w-4 h-4 text-green-600 font-bold" />
                                                </div>
                                                <span className="text-gray-700 text-base leading-relaxed">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Book Button */}
                                <div className="p-8 pt-0">
                                    <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl text-lg">
                                        Book Now
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Additional Information */}
                <div className="mt-16 bg-white rounded-2xl border border-gray-200 p-8 max-w-4xl mx-auto">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Why Choose Our AMC Packages?</h3>
                    <div className="grid md:grid-cols-2 gap-6 text-gray-700">
                        <div>
                            <h4 className="font-semibold text-lg mb-2 text-orange-500">✓ Professional Service</h4>
                            <p className="text-sm">Our certified technicians have years of experience handling all types of issues.</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-lg mb-2 text-orange-500">✓ Quick Response</h4>
                            <p className="text-sm">We guarantee fast response times to minimize disruption to your daily routine.</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-lg mb-2 text-orange-500">✓ Quality Assurance</h4>
                            <p className="text-sm">All work is backed by our quality guarantee and warranty on parts.</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-lg mb-2 text-orange-500">✓ Cost Effective</h4>
                            <p className="text-sm">Save money with our annual packages compared to one-time service calls.</p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}
