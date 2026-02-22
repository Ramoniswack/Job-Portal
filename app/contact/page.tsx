'use client';

import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';

export default function ContactPage() {
    const [location, setLocation] = useState('Location');

    return (
        <>
            <Navbar location={location} setLocation={setLocation} />

            <div className="min-h-screen bg-[#f9f9f9] pt-20">
                {/* Contact Us Section */}
                <section className="py-8 px-4 md:px-12 lg:px-24">
                    <div className="max-w-7xl mx-auto">
                        {/* Section Header */}
                        <div className="text-center mb-12 px-4">
                            <h1 className="text-5xl md:text-6xl font-bold mb-2 text-gray-900 inline-block relative">
                                Contact <span className="text-[#26cf71]">Us</span>
                            </h1>
                            <div className="flex justify-center mb-6">
                                <div className="h-1 w-24 bg-gradient-to-r from-[#26cf71] to-[#1eb863] rounded-full"></div>
                            </div>
                            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed text-gray-700">
                                Have questions or ready to start your project? We'd love to hear from you. Reach out and let's create something amazing together.
                            </p>
                        </div>

                        {/* Contact Content */}
                        <div className="bg-white p-8 md:p-12 rounded-none shadow-sm">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                {/* Contact Information */}
                                <div>
                                    <h3 className="text-2xl font-semibold text-black mb-8">Get in touch</h3>

                                    {/* Contact Info Items */}
                                    <div className="space-y-6">
                                        {/* Phone */}
                                        <div className="flex items-start">
                                            <div className="bg-[#26cf71] p-3 rounded-none mr-4">
                                                <Phone className="w-6 h-6 text-white" strokeWidth={2} />
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-semibold text-black mb-1">Phone</h4>
                                                <p className="text-lg text-gray-600">+977 9812345678</p>
                                                <p className="text-lg text-gray-600">1-600-890-4567</p>
                                            </div>
                                        </div>

                                        {/* Email */}
                                        <div className="flex items-start">
                                            <div className="bg-[#26cf71] p-3 rounded-none mr-4">
                                                <Mail className="w-6 h-6 text-white" strokeWidth={2} />
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-semibold text-black mb-1">Email</h4>
                                                <p className="text-lg text-gray-600">support@hamrosewa.com</p>
                                                <p className="text-lg text-gray-600">info@hamrosewa.com</p>
                                            </div>
                                        </div>

                                        {/* Address */}
                                        <div className="flex items-start">
                                            <div className="bg-[#26cf71] p-3 rounded-none mr-4">
                                                <MapPin className="w-6 h-6 text-white" strokeWidth={2} />
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-semibold text-black mb-1">Office</h4>
                                                <p className="text-lg text-gray-600">
                                                    Kathmandu, Nepal
                                                    <br />
                                                    Thamel, Ward No. 26
                                                </p>
                                            </div>
                                        </div>

                                        {/* Hours */}
                                        <div className="flex items-start">
                                            <div className="bg-[#26cf71] p-3 rounded-none mr-4">
                                                <Clock className="w-6 h-6 text-white" strokeWidth={2} />
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-semibold text-black mb-1">Business Hours</h4>
                                                <p className="text-lg text-gray-600">
                                                    Mon - Fri: 9:00 AM - 6:00 PM
                                                    <br />
                                                    Sat: 10:00 AM - 4:00 PM
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Form */}
                                <div>
                                    <h3 className="text-2xl font-semibold text-black mb-8">Send us a message</h3>
                                    <form className="space-y-6">
                                        {/* Name & Email */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label htmlFor="name" className="block text-lg font-medium text-black mb-2">
                                                    Full Name
                                                </label>
                                                <input
                                                    type="text"
                                                    id="name"
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-none focus:outline-none focus:border-[#26cf71] text-lg"
                                                    placeholder="Your name"
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="email" className="block text-lg font-medium text-black mb-2">
                                                    Email Address
                                                </label>
                                                <input
                                                    type="email"
                                                    id="email"
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-none focus:outline-none focus:border-[#26cf71] text-lg"
                                                    placeholder="your@email.com"
                                                />
                                            </div>
                                        </div>

                                        {/* Subject */}
                                        <div>
                                            <label htmlFor="subject" className="block text-lg font-medium text-black mb-2">
                                                Subject
                                            </label>
                                            <input
                                                type="text"
                                                id="subject"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-none focus:outline-none focus:border-[#26cf71] text-lg"
                                                placeholder="What is this regarding?"
                                            />
                                        </div>

                                        {/* Message */}
                                        <div>
                                            <label htmlFor="message" className="block text-lg font-medium text-black mb-2">
                                                Message
                                            </label>
                                            <textarea
                                                id="message"
                                                rows={5}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-none focus:outline-none focus:border-[#26cf71] text-lg resize-none"
                                                placeholder="Tell us about your project..."
                                            ></textarea>
                                        </div>

                                        {/* Submit Button */}
                                        <button
                                            type="submit"
                                            className="w-full px-8 py-4 bg-[#26cf71] text-white text-lg font-medium hover:bg-[#1eb863] transition-colors"
                                        >
                                            Send Message
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <Footer />
        </>
    );
}
