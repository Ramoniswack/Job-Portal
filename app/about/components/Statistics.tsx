'use client';

import { useState, useEffect, useRef } from 'react';
import { CheckCircle, Users, Wrench } from 'lucide-react';

export default function Statistics() {
    const [count1, setCount1] = useState(0);
    const [count2, setCount2] = useState(0);
    const [count3, setCount3] = useState(0);
    const [hasAnimated, setHasAnimated] = useState(false);
    const statsRef = useRef<HTMLDivElement>(null);

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
        let start = 0;
        const increment = target / (duration / 16);
        const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
                setter(target);
                clearInterval(timer);
            } else {
                setter(Math.floor(start));
            }
        }, 16);
    };

    return (
        <div className="bg-white py-16 px-4 sm:px-6">
            <div className="max-w-6xl mx-auto">
                <div ref={statsRef} className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                    <div className="flex flex-col items-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle className="w-10 h-10 text-white" />
                        </div>
                        <div className="relative">
                            <span className="text-8xl font-bold text-[#FF6B35]/10 select-none absolute -top-8 left-1/2 -translate-x-1/2">
                                {count1}K+
                            </span>
                            <span className="text-5xl font-extrabold text-[#FF6B35] relative">{count1}K+</span>
                        </div>
                        <div className="w-12 h-0.5 bg-[#FF6B35] my-4"></div>
                        <p className="text-xl font-bold text-gray-800">Service Delivered</p>
                    </div>

                    <div className="flex flex-col items-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mb-4">
                            <Users className="w-10 h-10 text-white" />
                        </div>
                        <div className="relative">
                            <span className="text-8xl font-bold text-[#FF6B35]/10 select-none absolute -top-8 left-1/2 -translate-x-1/2">
                                {count2}+
                            </span>
                            <span className="text-5xl font-extrabold text-[#FF6B35] relative">{count2}+</span>
                        </div>
                        <div className="w-12 h-0.5 bg-[#FF6B35] my-4"></div>
                        <p className="text-xl font-bold text-gray-800">Service Providers</p>
                    </div>

                    <div className="flex flex-col items-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mb-4">
                            <Wrench className="w-10 h-10 text-white" />
                        </div>
                        <div className="relative">
                            <span className="text-8xl font-bold text-[#FF6B35]/10 select-none absolute -top-8 left-1/2 -translate-x-1/2">
                                {count3}+
                            </span>
                            <span className="text-5xl font-extrabold text-[#FF6B35] relative">{count3}+</span>
                        </div>
                        <div className="w-12 h-0.5 bg-[#FF6B35] my-4"></div>
                        <p className="text-xl font-bold text-gray-800">Home Services</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
