'use client';

import { useEffect, useRef } from 'react';
import { CheckCircle, Users, Wrench } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

export default function Statistics() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);
    const card1Ref = useRef<HTMLDivElement>(null);
    const card2Ref = useRef<HTMLDivElement>(null);
    const card3Ref = useRef<HTMLDivElement>(null);
    const number1Ref = useRef<HTMLSpanElement>(null);
    const number2Ref = useRef<HTMLSpanElement>(null);
    const number3Ref = useRef<HTMLSpanElement>(null);
    const bgNumber1Ref = useRef<HTMLSpanElement>(null);
    const bgNumber2Ref = useRef<HTMLSpanElement>(null);
    const bgNumber3Ref = useRef<HTMLSpanElement>(null);
    const icon1Ref = useRef<HTMLDivElement>(null);
    const icon2Ref = useRef<HTMLDivElement>(null);
    const icon3Ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            const isMobile = window.innerWidth < 768;

            // Main timeline
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 75%',
                    toggleActions: 'play none none none',
                    once: true,
                }
            });

            // 1. Section entrance animation
            tl.fromTo(
                gridRef.current,
                { opacity: 0, y: 80 },
                { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' }
            );

            // 2. Card stagger animation
            const cards = [card1Ref.current, card2Ref.current, card3Ref.current];
            tl.fromTo(
                cards,
                { opacity: 0, y: 60, scale: 0.95 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.8,
                    stagger: 0.2,
                    ease: 'back.out(1.7)',
                },
                '-=0.8'
            );

            // 3. Icon animations
            const icons = [icon1Ref.current, icon2Ref.current, icon3Ref.current];
            tl.fromTo(
                icons,
                { rotation: -15, scale: 0.8 },
                {
                    rotation: 0,
                    scale: 1,
                    duration: 0.8,
                    stagger: 0.2,
                    ease: 'elastic.out(1, 0.5)',
                },
                '-=1.2'
            );

            // 4. Number counter animations
            const numberConfigs = [
                { ref: number1Ref, bgRef: bgNumber1Ref, target: 100, suffix: 'K+' },
                { ref: number2Ref, bgRef: bgNumber2Ref, target: 500, suffix: '+' },
                { ref: number3Ref, bgRef: bgNumber3Ref, target: 60, suffix: '+' },
            ];

            numberConfigs.forEach((config, index) => {
                const numberObj = { value: 0 };

                tl.to(
                    numberObj,
                    {
                        value: config.target,
                        duration: 2,
                        ease: 'power2.out',
                        onUpdate: function () {
                            if (config.ref.current) {
                                const currentValue = Math.floor(numberObj.value);
                                config.ref.current.innerText = currentValue + config.suffix;
                            }
                            if (config.bgRef.current) {
                                const currentValue = Math.floor(numberObj.value);
                                config.bgRef.current.innerText = currentValue + config.suffix;
                            }
                        },
                    },
                    `-=${1.8 - index * 0.2}`
                );

                // 5. Background number animation (delayed fade-in with scale)
                tl.fromTo(
                    config.bgRef.current,
                    { opacity: 0, scale: 1.1 },
                    { opacity: 0.1, scale: 1, duration: 0.8, ease: 'power2.out' },
                    `-=${1.5 - index * 0.2}`
                );
            });

            // 6. Hover interactions for cards (only on desktop)
            if (!isMobile) {
                cards.forEach((card) => {
                    if (card) {
                        card.addEventListener('mouseenter', () => {
                            gsap.to(card, {
                                scale: 1.05,
                                y: -5,
                                duration: 0.3,
                                ease: 'power2.out',
                            });
                        });

                        card.addEventListener('mouseleave', () => {
                            gsap.to(card, {
                                scale: 1,
                                y: 0,
                                duration: 0.3,
                                ease: 'power2.out',
                            });
                        });
                    }
                });
            }

        }, sectionRef);

        return () => ctx.revert(); // Cleanup
    }, []);

    return (
        <div ref={sectionRef} className="bg-white py-16 px-4 sm:px-6">
            <div className="max-w-6xl mx-auto">
                <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center opacity-0">
                    {/* Card 1 - Service Delivered */}
                    <div
                        ref={card1Ref}
                        className="flex flex-col items-center cursor-pointer"
                        style={{ willChange: 'transform' }}
                    >
                        <div
                            ref={icon1Ref}
                            className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mb-4"
                        >
                            <CheckCircle className="w-10 h-10 text-white" />
                        </div>
                        <div className="relative">
                            <span
                                ref={bgNumber1Ref}
                                className="text-8xl font-bold text-[#FF6B35]/10 select-none absolute -top-8 left-1/2 -translate-x-1/2 opacity-0"
                            >
                                0K+
                            </span>
                            <span
                                ref={number1Ref}
                                className="text-5xl font-extrabold text-[#FF6B35] relative"
                            >
                                0K+
                            </span>
                        </div>
                        <div className="w-12 h-0.5 bg-[#FF6B35] my-4"></div>
                        <p className="text-xl font-bold text-gray-800">Service Delivered</p>
                    </div>

                    {/* Card 2 - Service Providers */}
                    <div
                        ref={card2Ref}
                        className="flex flex-col items-center cursor-pointer"
                        style={{ willChange: 'transform' }}
                    >
                        <div
                            ref={icon2Ref}
                            className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mb-4"
                        >
                            <Users className="w-10 h-10 text-white" />
                        </div>
                        <div className="relative">
                            <span
                                ref={bgNumber2Ref}
                                className="text-8xl font-bold text-[#FF6B35]/10 select-none absolute -top-8 left-1/2 -translate-x-1/2 opacity-0"
                            >
                                0+
                            </span>
                            <span
                                ref={number2Ref}
                                className="text-5xl font-extrabold text-[#FF6B35] relative"
                            >
                                0+
                            </span>
                        </div>
                        <div className="w-12 h-0.5 bg-[#FF6B35] my-4"></div>
                        <p className="text-xl font-bold text-gray-800">Service Providers</p>
                    </div>

                    {/* Card 3 - Home Services */}
                    <div
                        ref={card3Ref}
                        className="flex flex-col items-center cursor-pointer"
                        style={{ willChange: 'transform' }}
                    >
                        <div
                            ref={icon3Ref}
                            className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mb-4"
                        >
                            <Wrench className="w-10 h-10 text-white" />
                        </div>
                        <div className="relative">
                            <span
                                ref={bgNumber3Ref}
                                className="text-8xl font-bold text-[#FF6B35]/10 select-none absolute -top-8 left-1/2 -translate-x-1/2 opacity-0"
                            >
                                0+
                            </span>
                            <span
                                ref={number3Ref}
                                className="text-5xl font-extrabold text-[#FF6B35] relative"
                            >
                                0+
                            </span>
                        </div>
                        <div className="w-12 h-0.5 bg-[#FF6B35] my-4"></div>
                        <p className="text-xl font-bold text-gray-800">Home Services</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
