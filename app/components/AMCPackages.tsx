'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface AMCPackage {
    _id: string;
    title: string;
    category: string;
    cardImage: string;
}

export default function AMCPackages() {
    const [packages, setPackages] = useState<AMCPackage[]>([]);
    const [loading, setLoading] = useState(true);
    const [heading, setHeading] = useState('AMC Packages');

    useEffect(() => {
        fetchPackages();
        fetchHeading();
    }, []);

    const fetchHeading = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/site-content/amc_packages_heading');
            const data = await response.json();
            if (data.success) {
                setHeading(data.data.value);
            }
        } catch (error) {
            console.error('Failed to fetch heading:', error);
        }
    };

    const fetchPackages = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/amc-packages');
            const data = await response.json();
            if (data.success) {
                setPackages(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch AMC packages:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <section className="bg-[#F8F9FA] w-full py-12 px-4">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-bold text-[#1A2B3C] mb-8">{heading}</h2>
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B35]"></div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="bg-[#F8F9FA] w-full py-12 px-4">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold text-[#1A2B3C] mb-8">{heading}</h2>

                {packages.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-600">No AMC packages available at the moment.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {packages.map((pkg) => (
                            <Link
                                key={pkg._id}
                                href={`/amc-packages/${pkg._id}`}
                                className="group cursor-pointer"
                            >
                                <div className="overflow-hidden rounded-2xl mb-4 aspect-video">
                                    <img
                                        src={pkg.cardImage}
                                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                        alt={pkg.title}
                                    />
                                </div>
                                <p className="text-center font-bold text-slate-800 text-lg group-hover:text-[#FF6B35] transition-colors">
                                    {pkg.title}
                                </p>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
