'use client';

import { ShieldCheck, Zap, Lock, MapPin, Award, Headphones } from 'lucide-react';

export default function WhyChooseUs() {
    const features = [
        {
            title: 'Verified Professionals',
            description: 'All service providers are thoroughly vetted and verified to ensure quality and reliability.',
            icon: ShieldCheck,
            gradient: 'from-blue-500 to-cyan-500'
        },
        {
            title: 'Instant Booking',
            description: 'Book services instantly with just a few clicks. No waiting, no hassle, just quick and easy booking.',
            icon: Zap,
            gradient: 'from-purple-500 to-pink-500'
        },
        {
            title: 'Secure Payments',
            description: 'Multiple payment options with secure transaction processing. Your financial data is always protected.',
            icon: Lock,
            gradient: 'from-green-500 to-emerald-500'
        },
        {
            title: 'Real-time Tracking',
            description: 'Track your service provider in real-time. Know exactly when they will arrive at your location.',
            icon: MapPin,
            gradient: 'from-orange-500 to-red-500'
        },
        {
            title: 'Quality Guarantee',
            description: 'We stand behind our services. If you\'re not satisfied, we\'ll make it right or refund your money.',
            icon: Award,
            gradient: 'from-yellow-500 to-orange-500'
        },
        {
            title: '24/7 Customer Support',
            description: 'Our dedicated support team is available round the clock to assist you with any queries or concerns.',
            icon: Headphones,
            gradient: 'from-indigo-500 to-purple-500'
        }
    ];

    return (
        <div className="bg-white py-20 px-4 sm:px-6">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Why Choose Hamro Sewa?
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        We're committed to providing the best service experience with features that matter most to you.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => {
                        const IconComponent = feature.icon;
                        return (
                            <div
                                key={index}
                                className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-[#FF6B35]"
                            >
                                <div className={`w-20 h-20 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                    <IconComponent className="w-10 h-10" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
