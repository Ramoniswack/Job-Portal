'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const [count1, setCount1] = useState(0);
    const [count2, setCount2] = useState(0);
    const [count3, setCount3] = useState(0);
    const [hasAnimated, setHasAnimated] = useState(false);
    const statsRef = useRef<HTMLDivElement>(null);

    const faqs = [
        {
            question: 'What is Hamro Sewa?',
            answer: 'Hamro Sewa is a comprehensive home service platform that connects you with verified professionals for all your household needs including plumbing, electrical, cleaning, and more.',
        },
        {
            question: 'How can I book a service?',
            answer: 'You can book a service by browsing our categories, selecting the service you need, and clicking the book button. You can also call us directly or use our mobile app.',
        },
        {
            question: 'What types of services are available?',
            answer: 'We offer a wide range of services including plumbing, electrical work, AC installation, cleaning, pest control, carpentry, painting, and many more home maintenance services.',
        },
        {
            question: 'How are the service providers selected?',
            answer: 'All our service providers go through a rigorous verification process including background checks, skill assessments, and customer reviews to ensure quality service.',
        },
        {
            question: 'What locations does Hamro Sewa provide its services?',
            answer: 'We currently provide services in Kathmandu, Lalitpur, Bhaktapur, Pokhara, and other major cities across Nepal. We are continuously expanding to new locations.',
        },
    ];

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !hasAnimated) {
                    setHasAnimated(true);
                    animateCount(setCount1, 100, 2000);
                    animateCount(setCount2, 500, 2000);
                    animateCount(setCount3, 60, 2000);
                }
            },
            { threshold: 0.5 }
        );

        if (statsRef.current) {
            observer.observe(statsRef.current);
        }

        return () => {
            if (statsRef.current) {
                observer.unobserve(statsRef.current);
            }
        };
    }, [hasAnimated]);

    const animateCount = (setter: (value: number) => void, target: number, duration: number) => {
        const startTime = Date.now();
        const step = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const current = Math.floor(progress * target);
            setter(current);
            if (progress < 1) {
                requestAnimationFrame(step);
            }
        };
        requestAnimationFrame(step);
    };

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="bg-white w-full py-20 px-6">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold text-[#1A2B3C] mb-10">Frequently Asked Questions</h2>

                <div className="space-y-3 mb-24">
                    {faqs.map((faq, index) => (
                        <div key={index}>
                            <div
                                onClick={() => toggleFAQ(index)}
                                className="bg-gray-50 rounded-md border border-gray-100 px-6 py-4 flex justify-between items-center cursor-pointer hover:bg-gray-100 transition"
                            >
                                <span className="text-gray-800 font-medium text-sm md:text-base">
                                    {faq.question}
                                </span>
                                <ChevronDown
                                    className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''
                                        }`}
                                />
                            </div>
                            {openIndex === index && (
                                <div className="bg-white border border-gray-100 border-t-0 rounded-b-md px-6 py-4 -mt-1">
                                    <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                                        {faq.answer}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div ref={statsRef} className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                    <div className="flex flex-col items-center">
                        <div className="relative">
                            <span className="text-8xl font-bold text-[#26cf71]/10 select-none absolute -top-8 left-1/2 -translate-x-1/2">
                                {count1}K+
                            </span>
                            <span className="text-5xl font-extrabold text-[#26cf71] relative">{count1}K+</span>
                        </div>
                        <div className="w-12 h-0.5 bg-[#26cf71] my-4"></div>
                        <p className="text-xl font-bold text-gray-800">Service Delivered</p>
                    </div>

                    <div className="flex flex-col items-center">
                        <div className="relative">
                            <span className="text-8xl font-bold text-[#26cf71]/10 select-none absolute -top-8 left-1/2 -translate-x-1/2">
                                {count2}+
                            </span>
                            <span className="text-5xl font-extrabold text-[#26cf71] relative">{count2}+</span>
                        </div>
                        <div className="w-12 h-0.5 bg-[#26cf71] my-4"></div>
                        <p className="text-xl font-bold text-gray-800">Service Providers</p>
                    </div>

                    <div className="flex flex-col items-center">
                        <div className="relative">
                            <span className="text-8xl font-bold text-[#26cf71]/10 select-none absolute -top-8 left-1/2 -translate-x-1/2">
                                {count3}+
                            </span>
                            <span className="text-5xl font-extrabold text-[#26cf71] relative">{count3}+</span>
                        </div>
                        <div className="w-12 h-0.5 bg-[#26cf71] my-4"></div>
                        <p className="text-xl font-bold text-gray-800">Home Services</p>
                    </div>
                </div>
            </div>
        </div>
    );
}