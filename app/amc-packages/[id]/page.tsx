'use client';

import { Check } from 'lucide-react';
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

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex items-center justify-center h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#26cf71]"></div>
                </div>
            </div>
        );
    }

    if (!packageData) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex items-center justify-center h-screen">
                    <p className="text-gray-600 text-lg">Package not found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
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
                            {packageData.category} <span className="text-[#26cf71]">AMC Packages</span>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
                    {packageData.pricingTiers.map((tier, index) => (
                        <div
                            key={index}
                            className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-2xl hover:border-orange-300 transition-all duration-300 flex flex-col"
                        >
                            {/* Package Header */}
                            <div className="bg-orange-500 text-white text-center py-5 px-6">
                                <h2 className="text-2xl font-bold uppercase tracking-wide">{tier.name}</h2>
                            </div>

                            {/* Price */}
                            <div className="text-center py-10 border-b border-gray-100 bg-gradient-to-b from-orange-50 to-white">
                                <div className="text-4xl font-bold text-gray-900">
                                    NPR {tier.price.toLocaleString()}
                                </div>
                                <div className="text-gray-500 text-base mt-3">/{tier.duration}</div>
                            </div>

                            {/* Features */}
                            <div className="flex-1 p-8">
                                <ul className="space-y-5">
                                    {tier.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-start gap-3">
                                            <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
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

                {/* Additional Information */}
                <div className="mt-16 bg-white rounded-2xl border border-gray-200 p-8 max-w-4xl mx-auto">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{packageData.whyChooseHeading}</h3>
                    <div className="grid md:grid-cols-2 gap-6 text-gray-700">
                        {packageData.benefits.map((benefit, index) => (
                            <div key={index}>
                                <h4 className="font-semibold text-lg mb-2 text-orange-500">✓ {benefit.title}</h4>
                                <p className="text-sm">{benefit.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
