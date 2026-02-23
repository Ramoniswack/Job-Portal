'use client';

import { Search, Calendar, Zap, Star } from 'lucide-react';

export default function HowItWorks() {
    const steps = [
        {
            number: '01',
            title: 'Browse Services',
            description: 'Explore our wide range of services across 26+ categories. From home repairs to professional services, find exactly what you need.',
            icon: Search,
            color: 'from-blue-400 to-blue-600'
        },
        {
            number: '02',
            title: 'Book & Schedule',
            description: 'Select your preferred service, choose a convenient date and time, and book instantly. Simple, fast, and hassle-free.',
            icon: Calendar,
            color: 'from-purple-400 to-purple-600'
        },
        {
            number: '03',
            title: 'Get Service',
            description: 'Our verified professionals arrive on time and deliver quality service. Track your booking and communicate directly.',
            icon: Zap,
            color: 'from-green-400 to-green-600'
        },
        {
            number: '04',
            title: 'Rate & Review',
            description: 'Share your experience and help others make informed decisions. Your feedback helps us maintain quality standards.',
            icon: Star,
            color: 'from-orange-400 to-orange-600'
        }
    ];

    return (
        <div id="how-it-works" className="bg-[#F8F9FA] py-20 px-4 sm:px-6">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        How It Works
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Getting the service you need is simple and straightforward. Follow these easy steps.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {steps.map((step, index) => {
                        const IconComponent = step.icon;
                        return (
                            <div key={index} className="relative">
                                {/* Connector Line */}
                                {index < steps.length - 1 && (
                                    <div className="hidden lg:block absolute top-20 left-[60%] w-full h-1 bg-gradient-to-r from-[#FF6B35] to-transparent"></div>
                                )}

                                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow relative z-10">
                                    <div className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-full flex items-center justify-center mb-4 mx-auto`}>
                                        <IconComponent className="w-8 h-8 text-white" />
                                    </div>
                                    <div className="text-center mb-4">
                                        <span className="text-5xl font-bold text-gray-200">{step.number}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">
                                        {step.title}
                                    </h3>
                                    <p className="text-gray-600 text-center leading-relaxed">
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
