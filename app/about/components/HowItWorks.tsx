'use client';

import { useEffect, useRef } from 'react';
import { Search, Calendar, Zap, Star } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

export default function HowItWorks() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const subtitleRef = useRef<HTMLParagraphElement>(null);
    const cardsContainerRef = useRef<HTMLDivElement>(null);
    const card1Ref = useRef<HTMLDivElement>(null);
    const card2Ref = useRef<HTMLDivElement>(null);
    const card3Ref = useRef<HTMLDivElement>(null);
    const card4Ref = useRef<HTMLDivElement>(null);
    const icon1Ref = useRef<HTMLDivElement>(null);
    const icon2Ref = useRef<HTMLDivElement>(null);
    const icon3Ref = useRef<HTMLDivElement>(null);
    const icon4Ref = useRef<HTMLDivElement>(null);
    const number1Ref = useRef<HTMLSpanElement>(null);
    const number2Ref = useRef<HTMLSpanElement>(null);
    const number3Ref = useRef<HTMLSpanElement>(null);
    const number4Ref = useRef<HTMLSpanElement>(null);
    const line1Ref = useRef<HTMLDivElement>(null);
    const line2Ref = useRef<HTMLDivElement>(null);
    const line3Ref = useRef<HTMLDivElement>(null);

    const steps = [
        {
            number: '01',
            title: 'Browse Services',
            description: 'Explore our wide range of services across 26+ categories. From home repairs to professional services, find exactly what you need.',
            icon: Search,
            color: 'from-blue-400 to-blue-600',
            cardRef: card1Ref,
            iconRef: icon1Ref,
            numberRef: number1Ref,
            lineRef: line1Ref,
        },
        {
            number: '02',
            title: 'Book & Schedule',
            description: 'Select your preferred service, choose a convenient date and time, and book instantly. Simple, fast, and hassle-free.',
            icon: Calendar,
            color: 'from-purple-400 to-purple-600',
            cardRef: card2Ref,
            iconRef: icon2Ref,
            numberRef: number2Ref,
            lineRef: line2Ref,
        },
        {
            number: '03',
            title: 'Get Service',
            description: 'Our verified professionals arrive on time and deliver quality service. Track your booking and communicate directly.',
            icon: Zap,
            color: 'from-green-400 to-green-600',
            cardRef: card3Ref,
            iconRef: icon3Ref,
            numberRef: number3Ref,
            lineRef: line3Ref,
        },
        {
            number: '04',
            title: 'Rate & Review',
            description: 'Share your experience and help others make informed decisions. Your feedback helps us maintain quality standards.',
            icon: Star,
            color: 'from-orange-400 to-orange-600',
            cardRef: card4Ref,
            iconRef: icon4Ref,
            numberRef: number4Ref,
            lineRef: null,
        }
    ];

    useEffect(() => {
        const ctx = gsap.context(() => {
            const isMobile = window.innerWidth < 768;

            // Main timeline
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 80%',
                    toggleActions: 'play none none reverse',
                }
            });

            // 1. Title animation - Split text effect
            if (titleRef.current) {
                const words = titleRef.current.innerText.split(' ');
                titleRef.current.innerHTML = words.map(word => `<span class="inline-block">${word}</span>`).join(' ');
                const wordElements = titleRef.current.querySelectorAll('span');

                tl.fromTo(
                    wordElements,
                    { y: 80, opacity: 0 },
                    {
                        y: 0,
                        opacity: 1,
                        duration: 1.2,
                        stagger: 0.05,
                        ease: 'expo.out',
                    }
                );
            }

            // 2. Subtitle animation
            tl.fromTo(
                subtitleRef.current,
                { y: 40, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' },
                '-=0.9'
            );

            // 3. Sequential card animations
            steps.forEach((step, index) => {
                const card = step.cardRef.current;
                const icon = step.iconRef.current;
                const number = step.numberRef.current;
                const line = step.lineRef?.current;

                if (card) {
                    // Card reveal animation
                    tl.fromTo(
                        card,
                        {
                            opacity: 0,
                            y: 100,
                            scale: 0.9,
                            rotateY: isMobile ? 0 : 10,
                        },
                        {
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            rotateY: 0,
                            duration: 1,
                            ease: 'power4.out',
                        },
                        `-=${index === 0 ? 0.5 : 0.75}`
                    );

                    // Icon animation
                    if (icon) {
                        tl.fromTo(
                            icon,
                            { scale: 0, rotation: -20 },
                            {
                                scale: 1,
                                rotation: 0,
                                duration: 0.8,
                                ease: 'elastic.out(1, 0.6)',
                            },
                            `-=${0.8}`
                        );

                        // Floating effect after animation (only on desktop)
                        if (!isMobile) {
                            gsap.to(icon, {
                                y: -5,
                                duration: 2,
                                repeat: -1,
                                yoyo: true,
                                ease: 'sine.inOut',
                                delay: 1 + index * 0.25,
                            });
                        }
                    }

                    // Step number animation
                    if (number) {
                        tl.fromTo(
                            number,
                            { scale: 0.8, opacity: 0, filter: 'blur(4px)' },
                            {
                                scale: 1,
                                opacity: 1,
                                filter: 'blur(0px)',
                                duration: 1,
                                ease: 'power2.out',
                            },
                            `-=${0.9}`
                        );
                    }

                    // Connector line animation (desktop only)
                    if (line && !isMobile) {
                        tl.fromTo(
                            line,
                            { scaleX: 0, transformOrigin: 'left center' },
                            {
                                scaleX: 1,
                                duration: 1,
                                ease: 'power2.out',
                            },
                            `-=${0.7}`
                        );
                    }

                    // Hover interactions (desktop only)
                    if (!isMobile) {
                        card.addEventListener('mouseenter', () => {
                            gsap.to(card, {
                                scale: 1.05,
                                y: -8,
                                boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                                duration: 0.3,
                                ease: 'power2.out',
                            });

                            if (icon) {
                                gsap.to(icon, {
                                    rotation: 5,
                                    duration: 0.3,
                                    ease: 'back.out(2)',
                                });
                            }
                        });

                        card.addEventListener('mouseleave', () => {
                            gsap.to(card, {
                                scale: 1,
                                y: 0,
                                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                                duration: 0.3,
                                ease: 'power2.out',
                            });

                            if (icon) {
                                gsap.to(icon, {
                                    rotation: 0,
                                    duration: 0.3,
                                    ease: 'back.out(2)',
                                });
                            }
                        });
                    }
                }
            });

        }, sectionRef);

        return () => ctx.revert(); // Cleanup
    }, []);

    return (
        <div ref={sectionRef} id="how-it-works" className="bg-[#F8F9FA] py-20 px-4 sm:px-6 overflow-hidden">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <h2
                        ref={titleRef}
                        className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
                    >
                        How It Works
                    </h2>
                    <p
                        ref={subtitleRef}
                        className="text-xl text-gray-600 max-w-2xl mx-auto opacity-0"
                    >
                        Getting the service you need is simple and straightforward. Follow these easy steps.
                    </p>
                </div>

                <div ref={cardsContainerRef} className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {steps.map((step, index) => {
                        const IconComponent = step.icon;
                        return (
                            <div key={index} className="relative">
                                {/* Connector Line */}
                                {step.lineRef && (
                                    <div
                                        ref={step.lineRef}
                                        className="hidden lg:block absolute top-20 left-[60%] w-full h-1 bg-gradient-to-r from-[#FF6B35] to-transparent"
                                        style={{ transform: 'scaleX(0)' }}
                                    ></div>
                                )}

                                <div
                                    ref={step.cardRef}
                                    className="bg-white rounded-2xl p-6 shadow-lg relative z-10 opacity-0"
                                    style={{ willChange: 'transform' }}
                                >
                                    <div
                                        ref={step.iconRef}
                                        className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-full flex items-center justify-center mb-4 mx-auto`}
                                    >
                                        <IconComponent className="w-8 h-8 text-white" />
                                    </div>
                                    <div className="text-center mb-4">
                                        <span
                                            ref={step.numberRef}
                                            className="text-5xl font-bold text-gray-200 opacity-0"
                                        >
                                            {step.number}
                                        </span>
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
