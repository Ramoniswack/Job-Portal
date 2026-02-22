'use client';

import { CheckCircle, Clock, Shield } from 'lucide-react';

export default function AboutMission() {
    return (
        <div className="bg-white py-20 px-4 sm:px-6">
            <div className="max-w-6xl mx-auto">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    {/* Left Side - Image */}
                    <div className="relative">
                        <div className="rounded-2xl overflow-hidden shadow-2xl">
                            <img
                                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800"
                                alt="Team collaboration"
                                className="w-full h-[400px] object-cover"
                            />
                        </div>
                        <div className="absolute -bottom-6 -right-6 bg-[#26cf71] text-white p-6 rounded-xl shadow-lg">
                            <div className="text-4xl font-bold">5+</div>
                            <div className="text-sm">Years of Service</div>
                        </div>
                    </div>

                    {/* Right Side - Content */}
                    <div>
                        <h2 className="text-4xl font-bold text-gray-900 mb-6">
                            Our Mission & Vision
                        </h2>
                        <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                            Hamro Sewa is Nepal's leading service marketplace, dedicated to making quality home services
                            accessible to everyone. We bridge the gap between skilled service providers and customers
                            who need reliable, professional services.
                        </p>
                        <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                            Our platform empowers service professionals to grow their business while providing customers
                            with a seamless booking experience. From home repairs to professional services, we're
                            transforming how services are delivered in Nepal.
                        </p>

                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="bg-green-100 p-3 rounded-lg">
                                    <CheckCircle className="w-6 h-6 text-[#26cf71]" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg mb-1">Quality Assurance</h3>
                                    <p className="text-gray-600">Verified professionals with proven track records</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="bg-green-100 p-3 rounded-lg">
                                    <Clock className="w-6 h-6 text-[#26cf71]" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg mb-1">24/7 Support</h3>
                                    <p className="text-gray-600">Round-the-clock customer service for your convenience</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="bg-green-100 p-3 rounded-lg">
                                    <Shield className="w-6 h-6 text-[#26cf71]" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg mb-1">Transparent Pricing</h3>
                                    <p className="text-gray-600">No hidden charges, clear pricing for all services</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
