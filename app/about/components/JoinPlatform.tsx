'use client';

import { User, Briefcase, Check } from 'lucide-react';

export default function JoinPlatform() {
    return (
        <div className="bg-[#F8F9FA] py-20 px-4 sm:px-6">
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

                <div className="flex flex-wrap justify-center gap-8 mb-12">
                    {/* For Customers */}
                    <div className="w-80 border border-gray-200 rounded-lg p-5 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.15)] transition-shadow duration-300">
                        {/* Package Header */}
                        <div className="bg-[#FF6B35] text-white text-center py-4 px-4 font-bold text-lg rounded mb-5 flex items-center justify-center gap-2">
                            <User className="w-6 h-6" />
                            FOR CUSTOMERS
                        </div>

                        {/* Description */}
                        <div className="text-center mb-5">
                            <p className="text-gray-600 text-base">
                                Find and book trusted service providers
                            </p>
                        </div>

                        {/* Register Button */}
                        <a
                            href="/register?role=client"
                            className="block w-full py-3 px-4 border-2 border-[#FF6B35] bg-white text-[#FF6B35] font-bold rounded cursor-pointer text-center mb-6 hover:bg-[#FF6B35] hover:text-white transition-colors duration-200"
                        >
                            Register as Customer
                        </a>

                        {/* Features */}
                        <ul className="list-none p-0 m-0">
                            <li className="mb-3 text-gray-800 flex items-start text-[1.05rem]">
                                <span className="text-[#FF6B35] mr-3 font-bold text-lg flex-shrink-0">✔</span>
                                <span>Access 26+ service categories at your fingertips</span>
                            </li>
                            <li className="mb-3 text-gray-800 flex items-start text-[1.05rem]">
                                <span className="text-[#FF6B35] mr-3 font-bold text-lg flex-shrink-0">✔</span>
                                <span>Book services instantly with flexible scheduling</span>
                            </li>
                            <li className="mb-3 text-gray-800 flex items-start text-[1.05rem]">
                                <span className="text-[#FF6B35] mr-3 font-bold text-lg flex-shrink-0">✔</span>
                                <span>Monitor your bookings and service history</span>
                            </li>
                            <li className="mb-3 text-gray-800 flex items-start text-[1.05rem]">
                                <span className="text-[#FF6B35] mr-3 font-bold text-lg flex-shrink-0">✔</span>
                                <span>Multiple payment options with full security</span>
                            </li>
                        </ul>
                    </div>

                    {/* For Service Providers */}
                    <div className="w-80 border border-gray-200 rounded-lg p-5 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.15)] transition-shadow duration-300">
                        {/* Package Header */}
                        <div className="bg-[#FF6B35] text-white text-center py-4 px-4 font-bold text-lg rounded mb-5 flex items-center justify-center gap-2">
                            <Briefcase className="w-6 h-6" />
                            FOR SERVICE PROVIDERS
                        </div>

                        {/* Description */}
                        <div className="text-center mb-5">
                            <p className="text-gray-600 text-base">
                                Grow your business and reach more customers
                            </p>
                        </div>

                        {/* Register Button */}
                        <a
                            href="/register?role=worker"
                            className="block w-full py-3 px-4 border-2 border-[#FF6B35] bg-white text-[#FF6B35] font-bold rounded cursor-pointer text-center mb-6 hover:bg-[#FF6B35] hover:text-white transition-colors duration-200"
                        >
                            Register as Service Provider
                        </a>

                        {/* Features */}
                        <ul className="list-none p-0 m-0">
                            <li className="mb-3 text-gray-800 flex items-start text-[1.05rem]">
                                <span className="text-[#FF6B35] mr-3 font-bold text-lg flex-shrink-0">✔</span>
                                <span>Access thousands of customers looking for your services</span>
                            </li>
                            <li className="mb-3 text-gray-800 flex items-start text-[1.05rem]">
                                <span className="text-[#FF6B35] mr-3 font-bold text-lg flex-shrink-0">✔</span>
                                <span>View and respond to job applications efficiently</span>
                            </li>
                            <li className="mb-3 text-gray-800 flex items-start text-[1.05rem]">
                                <span className="text-[#FF6B35] mr-3 font-bold text-lg flex-shrink-0">✔</span>
                                <span>Showcase your skills and get verified badge</span>
                            </li>
                            <li className="mb-3 text-gray-800 flex items-start text-[1.05rem]">
                                <span className="text-[#FF6B35] mr-3 font-bold text-lg flex-shrink-0">✔</span>
                                <span>Work on your own terms and set your availability</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Additional Info */}
                <div className="bg-white rounded-2xl p-8 md:p-12 text-gray-900 text-center shadow-lg">
                    <h3 className="text-3xl md:text-4xl font-bold mb-4 text-[#FF6B35]">
                        Already Have an Account?
                    </h3>
                    <p className="text-xl mb-8 text-gray-700">
                        Login to access your dashboard and manage your services or bookings
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <a
                            href="/login"
                            className="bg-[#FF6B35] text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-[#FF5722] transition shadow-lg"
                        >
                            Login Now
                        </a>
                        <a
                            href="/hamrosewa"
                            className="bg-transparent border-2 border-[#FF6B35] text-[#FF6B35] px-8 py-4 rounded-full font-bold text-lg hover:bg-[#FF6B35] hover:text-white transition"
                        >
                            Go to Dashboard
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
