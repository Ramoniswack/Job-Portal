'use client';

import { useEffect, useRef } from 'react';

export default function Testimonials() {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const testimonials = [
        {
            text: "There was great communication in regards to what happened to my computer and what could be done. I was informed of everything before hand in regards to the price. my computer got fixed in a reasonable price and reasonable timeframe. good services. would highly recommend for any electronic problems.",
            name: "Anusha Khanal",
            position: "Vayodha Hospital",
            avatar: "https://i.pravatar.cc/150?u=anusha"
        },
        {
            text: "I had our solar water heating system completely serviced by Hamro Sewa and now it's running very smoothly. can have hot water 2 floors down within minutes. it's made our winter very comfortable. highly recommended!",
            name: "KASHYAP SHAKYA",
            position: "Brand Manager At Nepal Life Insurance",
            avatar: "https://i.pravatar.cc/150?u=kashyap"
        },
        {
            text: "Excellent plumbing service! They fixed our leaking pipes quickly and professionally. Very satisfied with their work and pricing. Will definitely call them again for future needs.",
            name: "Ramesh Adhikari",
            position: "Homeowner, Lalitpur",
            avatar: "https://i.pravatar.cc/150?u=ramesh"
        },
        {
            text: "Professional AC installation service. The technicians were knowledgeable and completed the work efficiently. My office is now perfectly cooled. Highly recommend their services!",
            name: "Maya Gurung",
            position: "Office Manager, Kathmandu",
            avatar: "https://i.pravatar.cc/150?u=maya"
        },
        {
            text: "Outstanding electrical work! They rewired our entire house safely and efficiently. The team was professional and cleaned up after themselves. Great value for money.",
            name: "Suresh Pradhan",
            position: "Business Owner, Bhaktapur",
            avatar: "https://i.pravatar.cc/150?u=suresh"
        },
        {
            text: "Best cleaning service in town! They deep cleaned our entire apartment and it looks brand new. The staff was courteous and thorough. Will book them regularly now.",
            name: "Rita Shrestha",
            position: "Resident, Pokhara",
            avatar: "https://i.pravatar.cc/150?u=rita"
        }
    ];

    useEffect(() => {
        const scrollContainer = scrollContainerRef.current;
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
                            See what our clients say about us
                        </h2>
                        <div className="space-y-4 text-gray-600 leading-relaxed text-sm md:text-base mb-8">
                            <p>
                                Hamro Sewa is the perfect partner for your facility. With over 7 years of professional experience we offer one stop solution for all your facility requirements. Our services allows you to focus on your core business by saving your time and reducing cost.
                            </p>
                            <p>
                                We provide comprehensive range of facility services ranging from plumbing, electrical, computer and IT Service, air conditioning, cleaning, pest control, gardening, lift, generator, water treatment and many more.
                            </p>
                        </div>

                        <div className="relative rounded-2xl overflow-hidden shadow-lg aspect-video group cursor-pointer">
                            <img
                                src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=800"
                                alt="Video Placeholder"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition">
                                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm border-2 border-white rounded-full flex items-center justify-center">
                                    <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-white border-b-[10px] border-b-transparent ml-1"></div>
                                </div>
                            </div>
                            <div className="absolute top-4 right-4 bg-white p-2 rounded shadow-md">
                                <span className="text-[#26cf71] font-bold text-xs uppercase">Hamro Sewa</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1">
                        <div
                            ref={scrollContainerRef}
                            className="h-[600px] overflow-y-auto scrollbar-hide space-y-6 pr-2"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        >
                            {[...testimonials, ...testimonials].map((testimonial, index) => (
                                <div
                                    key={index}
                                    className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
                                >
                                    <div className="text-[#26cf71] text-5xl font-serif leading-none mb-3">
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

                <style jsx>{`
                    .scrollbar-hide::-webkit-scrollbar {
                        display: none;
                    }
                `}</style>
            </div>
        </div>
    );
}
