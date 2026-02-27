'use client';

import { useEffect, useRef, useState } from 'react';

interface Testimonial {
    _id: string;
    text: string;
    name: string;
    position: string;
    avatar: string;
}

interface SectionContent {
    title: string;
    description1: string;
    description2: string;
    videoImage: string;
}

export default function Testimonials() {
    const testimonialsRef = useRef<HTMLDivElement>(null);
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [sectionContent, setSectionContent] = useState<SectionContent>({
        title: 'See what our clients say about us',
        description1: 'Hamro Sewa is the perfect partner for your facility. With over 7 years of professional experience we offer one stop solution for all your facility requirements. Our services allows you to focus on your core business by saving your time and reducing cost.',
        description2: 'We provide comprehensive range of facility services ranging from plumbing, electrical, computer and IT Service, air conditioning, cleaning, pest control, gardening, lift, generator, water treatment and many more.',
        videoImage: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=800'
    });

    useEffect(() => {
        fetchTestimonials();
        fetchSectionContent();
    }, []);

    const fetchSectionContent = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/testimonial-section');
            const data = await response.json();

            if (data.success && data.data) {
                setSectionContent(data.data);
            }
        } catch (error) {
            console.error('Error fetching section content:', error);
            // Use default content if fetch fails
        }
    };

    const fetchTestimonials = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/testimonials');
            const data = await response.json();

            if (data.success) {
                setTestimonials(data.data);
            }
        } catch (error) {
            console.error('Error fetching testimonials:', error);
            // Use default testimonials if fetch fails
            setTestimonials([
                {
                    _id: '1',
                    text: "There was great communication in regards to what happened to my computer and what could be done. I was informed of everything before hand in regards to the price. my computer got fixed in a reasonable price and reasonable timeframe. good services. would highly recommend for any electronic problems.",
                    name: "Anusha Khanal",
                    position: "Vayodha Hospital",
                    avatar: "https://i.pravatar.cc/150?u=anusha"
                }
            ]);
        }
    };

    // Auto-scroll effect for testimonials
    useEffect(() => {
        const scrollContainer = testimonialsRef.current;
        if (!scrollContainer) return;

        let scrollInterval: NodeJS.Timeout;

        const startAutoScroll = () => {
            scrollInterval = setInterval(() => {
                if (scrollContainer.scrollTop >= scrollContainer.scrollHeight - scrollContainer.clientHeight) {
                    scrollContainer.scrollTop = 0;
                } else {
                    scrollContainer.scrollTop += 1;
                }
            }, 30);
        };

        const stopAutoScroll = () => {
            clearInterval(scrollInterval);
        };

        startAutoScroll();

        scrollContainer.addEventListener('mouseenter', stopAutoScroll);
        scrollContainer.addEventListener('mouseleave', startAutoScroll);

        return () => {
            clearInterval(scrollInterval);
            scrollContainer.removeEventListener('mouseenter', stopAutoScroll);
            scrollContainer.removeEventListener('mouseleave', startAutoScroll);
        };
    }, []);

    return (
        <div className="bg-white w-full py-16 px-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col lg:flex-row gap-12">
                    <div className="flex-1">
                        <h2 className="text-3xl font-bold text-[#1A2B3C] mb-6">
                            {sectionContent.title}
                        </h2>
                        <div className="space-y-4 text-gray-600 leading-relaxed text-sm md:text-base mb-8">
                            {sectionContent.description1 && (
                                <p>{sectionContent.description1}</p>
                            )}
                            {sectionContent.description2 && (
                                <p>{sectionContent.description2}</p>
                            )}
                        </div>

                        <div className="relative rounded-2xl overflow-hidden shadow-lg aspect-video group cursor-pointer">
                            <img
                                src={sectionContent.videoImage}
                                alt="Video Placeholder"
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors duration-300">
                                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm border-2 border-white rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                                    <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-white border-b-[10px] border-b-transparent ml-1"></div>
                                </div>
                            </div>
                            <div className="absolute top-4 right-4 bg-white p-2 rounded shadow-md">
                                <span className="text-[#FF6B35] font-bold text-xs uppercase">Hamro Sewa</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1">
                        <div
                            ref={testimonialsRef}
                            className="h-[600px] overflow-y-auto scrollbar-hide space-y-6 pr-2"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        >
                            <div>
                                {testimonials.map((testimonial, index) => (
                                    <div
                                        key={testimonial._id || index}
                                        className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-2xl p-6 shadow-sm mb-6 transition-all duration-300 hover:shadow-md hover:-translate-y-1"
                                    >
                                        <div className="text-[#FF6B35] text-5xl font-serif leading-none mb-3">
                                            "
                                        </div>
                                        <p className="text-gray-700 leading-relaxed mb-6 text-sm">
                                            {testimonial.text}
                                        </p>
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={testimonial.avatar}
                                                className="w-12 h-12 rounded-full border-2 border-white shadow-sm"
                                                alt={testimonial.name}
                                            />
                                            <div>
                                                <h4 className="font-bold text-gray-900 text-sm leading-tight">
                                                    {testimonial.name}
                                                </h4>
                                                <p className="text-xs text-gray-500 uppercase tracking-wide">
                                                    {testimonial.position}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <style jsx>{`
                    .scrollbar-hide::-webkit-scrollbar {
                        display: none;
                    }
                `}</style>
            </div>
        </div>
    );
}
