'use client';

import { User, Briefcase, Check } from 'lucide-react';

export default function JoinPlatform() {
    return (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 py-20 px-4 sm:px-6">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Join Our Platform
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Whether you're looking for services or want to offer your skills,
                        Hamro Sewa is the perfect platform for you.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 mb-12">
                    {/* For Customers */}
                    <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-shadow">
                        <div className="text-center mb-6">
                            <div className="w-24 h-24 bg-gradient-to-br from-[#26cf71] to-[#1eb863] rounded-full flex items-center justify-center mx-auto mb-4">
                                <User className="w-12 h-12 text-white" />
                            </div>
                            <h3 className="text-3xl font-bold text-gray-900 mb-2">
                                For Customers
                            </h3>
                            <p className="text-gray-600">
                                Find and book trusted service providers
                            </p>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="flex items-start gap-3">
                                <div className="bg-green-100 p-2 rounded-lg mt-1">
                                    <Check className="w-5 h-5 text-[#26cf71]" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">Browse Services</h4>
                                    <p className="text-gray-600 text-sm">Access 26+ service categories at your fingertips</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="bg-green-100 p-2 rounded-lg mt-1">
                                    <Check className="w-5 h-5 text-[#26cf71]" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">Easy Booking</h4>
                                    <p className="text-gray-600 text-sm">Book services instantly with flexible scheduling</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="bg-green-100 p-2 rounded-lg mt-1">
                                    <Check className="w-5 h-5 text-[#26cf71]" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">Track & Manage</h4>
                                    <p className="text-gray-600 text-sm">Monitor your bookings and service history</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="bg-green-100 p-2 rounded-lg mt-1">
                                    <Check className="w-5 h-5 text-[#26cf71]" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">Secure Payments</h4>
                                    <p className="text-gray-600 text-sm">Multiple payment options with full security</p>
                                </div>
                            </div>
                        </div>

                        <a
                            href="/register?role=client"
                            className="block w-full bg-gradient-to-r from-[#26cf71] to-[#1eb863] text-white text-center py-4 rounded-xl font-bold text-lg hover:from-[#1eb863] hover:to-[#26cf71] transition shadow-lg"
                        >
                            Register as Customer
                        </a>
                    </div>

                    {/* For Service Providers */}
                    <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-shadow border-2 border-[#26cf71] relative">
                        <div className="absolute top-4 right-4 bg-[#26cf71] text-white px-4 py-1 rounded-full text-sm font-bold">
                            Popular
                        </div>
                        <div className="text-center mb-6">
                            <div className="w-24 h-24 bg-gradient-to-br from-[#26cf71] to-[#1eb863] rounded-full flex items-center justify-center mx-auto mb-4">
                                <Briefcase className="w-12 h-12 text-white" />
                            </div>
                            <h3 className="text-3xl font-bold text-gray-900 mb-2">
                                For Service Providers
                            </h3>
                            <p className="text-gray-600">
                                Grow your business and reach more customers
                            </p>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="flex items-start gap-3">
                                <div className="bg-green-100 p-2 rounded-lg mt-1">
                                    <Check className="w-5 h-5 text-[#26cf71]" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">Get More Jobs</h4>
                                    <p className="text-gray-600 text-sm">Access thousands of customers looking for your services</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="bg-green-100 p-2 rounded-lg mt-1">
                                    <Check className="w-5 h-5 text-[#26cf71]" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">Manage Applications</h4>
                                    <p className="text-gray-600 text-sm">View and respond to job applications efficiently</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="bg-green-100 p-2 rounded-lg mt-1">
                                    <Check className="w-5 h-5 text-[#26cf71]" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">Build Your Profile</h4>
                                    <p className="text-gray-600 text-sm">Showcase your skills and get verified badge</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="bg-green-100 p-2 rounded-lg mt-1">
                                    <Check className="w-5 h-5 text-[#26cf71]" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">Flexible Schedule</h4>
                                    <p className="text-gray-600 text-sm">Work on your own terms and set your availability</p>
                                </div>
                            </div>
                        </div>

                        <a
                            href="/register?role=worker"
                            className="block w-full bg-gradient-to-r from-[#26cf71] to-[#1eb863] text-white text-center py-4 rounded-xl font-bold text-lg hover:from-[#1eb863] hover:to-[#26cf71] transition shadow-lg"
                        >
                            Register as Service Provider
                        </a>
                    </div>
                </div>

                {/* Additional Info */}
                <div className="bg-gradient-to-r from-[#26cf71] to-[#1eb863] rounded-3xl p-8 md:p-12 text-white text-center">
                    <h3 className="text-3xl md:text-4xl font-bold mb-4">
                        Already Have an Account?
                    </h3>
                    <p className="text-xl mb-8 opacity-90">
                        Login to access your dashboard and manage your services or bookings
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <a
                            href="/login"
                            className="bg-white text-[#26cf71] px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition shadow-lg"
                        >
                            Login Now
                        </a>
                        <a
                            href="/hamrosewa"
                            className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-[#26cf71] transition"
                        >
                            Go to Dashboard
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
