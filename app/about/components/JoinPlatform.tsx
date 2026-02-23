'use client';

import { useEffect, useRef } from 'react';
import { User, Briefcase } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

export default function JoinPlatform() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const subtitleRef = useRef<HTMLParagraphElement>(null);
    const leftCardRef = useRef<HTMLDivElement>(null);
    const rightCardRef = useRef<HTMLDivElement>(null);
    const leftHeaderRef = useRef<HTMLDivElement>(null);
    const rightHeaderRef = useRef<HTMLDivElement>(null);
    const leftIconRef = useRef<SVGSVGElement>(null);
    const rightIconRef = useRef<SVGSVGElement>(null);
    const leftFeaturesRef = useRef<HTMLUListElement>(null);
    const rightFeaturesRef = useRef<HTMLUListElement>(null);
    const leftButtonRef = useRef<HTMLAnchorElement>(null);
    const rightButtonRef = useRef<HTMLAnchorElement>(null);
    const ctaBoxRef = useRef<HTMLDivElement>(null);
    const ctaButton1Ref = useRef<HTMLAnchorElement>(null);
    const ctaButton2Ref = useRef<HTMLAnchorElement>(null);

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

            // 1. Title animation
            tl.fromTo(
                titleRef.current,
                { y: 60, opacity: 0, letterSpacing: '0.1em' },
                {
                    y: 0,
                    opacity: 1,
                    letterSpacing: '0em',
                    duration: 1.2,
                    ease: 'power4.out',
                }
            );

            // 2. Subtitle animation
            tl.fromTo(
                subtitleRef.current,
                { y: 40, opacity: 0 },
                { y: 0, opacity: 1, duration: 1, ease: 'power4.out' },
                '-=0.9'
            );

            // 3. Cards entrance from opposite directions
            tl.fromTo(
                leftCardRef.current,
                {
                    x: -120,
                    opacity: 0,
                    rotateY: isMobile ? 0 : 10,
                },
                {
                    x: 0,
                    opacity: 1,
                    rotateY: 0,
                    duration: 1.2,
                    ease: 'power4.out',
                },
                '-=0.6'
            );

            tl.fromTo(
                rightCardRef.current,
                {
                    x: 120,
                    opacity: 0,
                    rotateY: isMobile ? 0 : -10,
                },
                {
                    x: 0,
                    opacity: 1,
                    rotateY: 0,
                    duration: 1.2,
                    ease: 'power4.out',
                },
                '-=1.0'
            );

            // 4. Card header animations
            [leftHeaderRef, rightHeaderRef].forEach((headerRef, index) => {
                tl.fromTo(
                    headerRef.current,
                    { scaleX: 0, transformOrigin: 'center' },
                    { scaleX: 1, duration: 0.8, ease: 'power2.out' },
                    `-=${0.9 - index * 0.1}`
                );
            });

            // 5. Icon animations
            [leftIconRef, rightIconRef].forEach((iconRef, index) => {
                tl.fromTo(
                    iconRef.current,
                    { scale: 0, rotation: -15 },
                    {
                        scale: 1,
                        rotation: 0,
                        duration: 0.8,
                        ease: 'elastic.out(1, 0.5)',
                    },
                    `-=${0.6 - index * 0.1}`
                );
            });

            // 6. Feature list animations
            [leftFeaturesRef, rightFeaturesRef].forEach((featuresRef, index) => {
                const features = featuresRef.current?.querySelectorAll('li');
                if (features) {
                    tl.fromTo(
                        features,
                        { opacity: 0, x: -30 },
                        {
                            opacity: 1,
                            x: 0,
                            duration: 0.6,
                            stagger: 0.15,
                            ease: 'power2.out',
                        },
                        `-=${0.5 - index * 0.2}`
                    );

                    // Checkmark bounce
                    const checkmarks = featuresRef.current?.querySelectorAll('.checkmark');
                    if (checkmarks) {
                        tl.fromTo(
                            checkmarks,
                            { scale: 0 },
                            {
                                scale: 1,
                                duration: 0.4,
                                stagger: 0.15,
                                ease: 'back.out(3)',
                            },
                            `-=${0.8 - index * 0.2}`
                        );
                    }
                }
            });

            // 7. Register button animations
            [leftButtonRef, rightButtonRef].forEach((buttonRef, index) => {
                tl.fromTo(
                    buttonRef.current,
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
                    `-=${0.6 - index * 0.1}`
                );

                // Pulse glow effect
                if (buttonRef.current) {
                    gsap.to(buttonRef.current, {
                        boxShadow: '0 0 20px rgba(255, 107, 53, 0.5)',
                        duration: 2.5,
                        repeat: -1,
                        yoyo: true,
                        ease: 'sine.inOut',
                        delay: 1.5 + index * 0.2,
                    });
                }
            });

            // 8. Bottom CTA box animation
            tl.fromTo(
                ctaBoxRef.current,
                { opacity: 0, y: 100, scale: 0.95 },
                { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'power3.out' },
                '-=0.3'
            );

            // CTA buttons stagger
            tl.fromTo(
                [ctaButton1Ref.current, ctaButton2Ref.current],
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    stagger: 0.15,
                    ease: 'power2.out',
                },
                '-=0.5'
            );

            // 9. Hover interactions (desktop only)
            if (!isMobile) {
                // Card hover
                [leftCardRef, rightCardRef].forEach((cardRef) => {
                    if (cardRef.current) {
                        cardRef.current.addEventListener('mouseenter', () => {
                            gsap.to(cardRef.current, {
                                scale: 1.03,
                                y: -8,
                                boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                                duration: 0.3,
                                ease: 'power2.out',
                            });
                        });

                        cardRef.current.addEventListener('mouseleave', () => {
                            gsap.to(cardRef.current, {
                                scale: 1,
                                y: 0,
                                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                                duration: 0.3,
                                ease: 'power2.out',
                            });
                        });
                    }
                });

                // Button hover
                [leftButtonRef, rightButtonRef, ctaButton1Ref, ctaButton2Ref].forEach((buttonRef) => {
                    if (buttonRef.current) {
                        buttonRef.current.addEventListener('mouseenter', () => {
                            gsap.to(buttonRef.current, {
                                scale: 1.07,
                                y: -2,
                                duration: 0.3,
                                ease: 'power2.out',
                            });
                        });

                        buttonRef.current.addEventListener('mouseleave', () => {
                            gsap.to(buttonRef.current, {
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
        <div ref={sectionRef} className="bg-[#F8F9FA] py-20 px-4 sm:px-6 overflow-hidden">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <h2 ref={titleRef} className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 opacity-0">
                        Join Our Platform
                    </h2>
                    <p ref={subtitleRef} className="text-xl text-gray-600 max-w-3xl mx-auto opacity-0">
                        Whether you're looking for services or want to offer your skills,
                        Hamro Sewa is the perfect platform for you.
                    </p>
                </div>

                <div className="flex flex-wrap justify-center gap-8 mb-12">
                    {/* For Customers */}
                    <div
                        ref={leftCardRef}
                        className="w-80 border border-gray-200 rounded-lg p-5 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.1)] opacity-0"
                        style={{ willChange: 'transform' }}
                    >
                        <div
                            ref={leftHeaderRef}
                            className="bg-[#FF6B35] text-white text-center py-4 px-4 font-bold text-lg rounded mb-5 flex items-center justify-center gap-2"
                        >
                            <User ref={leftIconRef} className="w-6 h-6" />
                            FOR CUSTOMERS
                        </div>

                        <div className="text-center mb-5">
                            <p className="text-gray-600 text-base">
                                Find and book trusted service providers
                            </p>
                        </div>

                        <a
                            ref={leftButtonRef}
                            href="/register?role=client"
                            className="block w-full py-3 px-4 border-2 border-[#FF6B35] bg-white text-[#FF6B35] font-bold rounded cursor-pointer text-center mb-6 hover:bg-[#FF6B35] hover:text-white transition-colors duration-200 opacity-0"
                        >
                            Register as Customer
                        </a>

                        <ul ref={leftFeaturesRef} className="list-none p-0 m-0">
                            <li className="mb-3 text-gray-800 flex items-start text-[1.05rem] opacity-0">
                                <span className="checkmark text-[#FF6B35] mr-3 font-bold text-lg flex-shrink-0">✔</span>
                                <span>Access 26+ service categories at your fingertips</span>
                            </li>
                            <li className="mb-3 text-gray-800 flex items-start text-[1.05rem] opacity-0">
                                <span className="checkmark text-[#FF6B35] mr-3 font-bold text-lg flex-shrink-0">✔</span>
                                <span>Book services instantly with flexible scheduling</span>
                            </li>
                            <li className="mb-3 text-gray-800 flex items-start text-[1.05rem] opacity-0">
                                <span className="checkmark text-[#FF6B35] mr-3 font-bold text-lg flex-shrink-0">✔</span>
                                <span>Monitor your bookings and service history</span>
                            </li>
                            <li className="mb-3 text-gray-800 flex items-start text-[1.05rem] opacity-0">
                                <span className="checkmark text-[#FF6B35] mr-3 font-bold text-lg flex-shrink-0">✔</span>
                                <span>Multiple payment options with full security</span>
                            </li>
                        </ul>
                    </div>

                    {/* For Service Providers */}
                    <div
                        ref={rightCardRef}
                        className="w-80 border border-gray-200 rounded-lg p-5 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.1)] opacity-0"
                        style={{ willChange: 'transform' }}
                    >
                        <div
                            ref={rightHeaderRef}
                            className="bg-[#FF6B35] text-white text-center py-4 px-4 font-bold text-lg rounded mb-5 flex items-center justify-center gap-2"
                        >
                            <Briefcase ref={rightIconRef} className="w-6 h-6" />
                            FOR SERVICE PROVIDERS
                        </div>

                        <div className="text-center mb-5">
                            <p className="text-gray-600 text-base">
                                Grow your business and reach more customers
                            </p>
                        </div>

                        <a
                            ref={rightButtonRef}
                            href="/register?role=worker"
                            className="block w-full py-3 px-4 border-2 border-[#FF6B35] bg-white text-[#FF6B35] font-bold rounded cursor-pointer text-center mb-6 hover:bg-[#FF6B35] hover:text-white transition-colors duration-200 opacity-0"
                        >
                            Register as Service Provider
                        </a>

                        <ul ref={rightFeaturesRef} className="list-none p-0 m-0">
                            <li className="mb-3 text-gray-800 flex items-start text-[1.05rem] opacity-0">
                                <span className="checkmark text-[#FF6B35] mr-3 font-bold text-lg flex-shrink-0">✔</span>
                                <span>Access thousands of customers looking for your services</span>
                            </li>
                            <li className="mb-3 text-gray-800 flex items-start text-[1.05rem] opacity-0">
                                <span className="checkmark text-[#FF6B35] mr-3 font-bold text-lg flex-shrink-0">✔</span>
                                <span>View and respond to job applications efficiently</span>
                            </li>
                            <li className="mb-3 text-gray-800 flex items-start text-[1.05rem] opacity-0">
                                <span className="checkmark text-[#FF6B35] mr-3 font-bold text-lg flex-shrink-0">✔</span>
                                <span>Showcase your skills and get verified badge</span>
                            </li>
                            <li className="mb-3 text-gray-800 flex items-start text-[1.05rem] opacity-0">
                                <span className="checkmark text-[#FF6B35] mr-3 font-bold text-lg flex-shrink-0">✔</span>
                                <span>Work on your own terms and set your availability</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Additional Info */}
                <div
                    ref={ctaBoxRef}
                    className="bg-white rounded-2xl p-8 md:p-12 text-gray-900 text-center shadow-lg opacity-0"
                >
                    <h3 className="text-3xl md:text-4xl font-bold mb-4 text-[#FF6B35]">
                        Already Have an Account?
                    </h3>
                    <p className="text-xl mb-8 text-gray-700">
                        Login to access your dashboard and manage your services or bookings
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <a
                            ref={ctaButton1Ref}
                            href="/login"
                            className="bg-[#FF6B35] text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-[#FF5722] transition shadow-lg opacity-0"
                        >
                            Login Now
                        </a>
                        <a
                            ref={ctaButton2Ref}
                            href="/hamrosewa"
                            className="bg-transparent border-2 border-[#FF6B35] text-[#FF6B35] px-8 py-4 rounded-full font-bold text-lg hover:bg-[#FF6B35] hover:text-white transition opacity-0"
                        >
                            Go to Dashboard
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
