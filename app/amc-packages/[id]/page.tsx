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
                            <button className="w-full py-3 px-4 border-2 border-[#FF6B35] bg-white text-[#FF6B35] font-bold rounded cursor-pointer text-center mb-6 hover:bg-[#FF6B35] hover:text-white transition-colors duration-200">
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

            <Footer />
        </div>
    );
}
