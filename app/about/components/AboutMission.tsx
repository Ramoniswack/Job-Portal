'use client';

import { useEffect, useRef } from 'react';
import { CheckCircle, Clock, Shield } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

export default function AboutMission() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const paragraph1Ref = useRef<HTMLParagraphElement>(null);
    const paragraph2Ref = useRef<HTMLParagraphElement>(null);
    const featuresRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Check if mobile
            const isMobile = window.innerWidth < 768;

            // Section entrance animation
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 80%',
                    toggleActions: 'play none none reverse',
                }
            });

            // Left Image Animation
            tl.fromTo(
                imageRef.current,
                {
                    opacity: 0,
                    x: -100,
                    scale: 1.1,
                },
                {
                    opacity: 1,
                    x: 0,
                    scale: 1,
                    duration: 1.2,
                    ease: 'power3.out',
                }
            );

            // Right Content Animation (Staggered)
            tl.fromTo(
                titleRef.current,
                { y: 60, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, ease: 'power4.out' },
                '-=0.8'
            )
                .fromTo(
                    paragraph1Ref.current,
                    { y: 40, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.8, ease: 'power4.out' },
                    '-=0.6'
                )
                .fromTo(
                    paragraph2Ref.current,
                    { y: 40, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.8, ease: 'power4.out' },
                    '-=0.6'
                );

            // Features stagger animation
            const features = featuresRef.current?.querySelectorAll('.feature-item');
            if (features) {
                tl.fromTo(
                    features,
                    { y: 40, opacity: 0 },
                    {
                        y: 0,
                        opacity: 1,
                        duration: 0.6,
                        stagger: 0.2,
                        ease: 'power4.out'
                    },
                    '-=0.6'
                );
            }

            // Parallax effect on image (only on desktop)
            if (!isMobile && imageRef.current) {
                gsap.to(imageRef.current, {
                    y: -30,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: true,
                    }
                });
            }

        }, sectionRef);

        return () => ctx.revert(); // Cleanup
    }, []);

    return (
        <div
            ref={sectionRef}
            className="bg-white pt-24 pb-20 px-4 sm:px-6 overflow-hidden"
        >
            <div className="max-w-6xl mx-auto">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    {/* Left Side - Image */}
                    <div
                        ref={imageRef}
                        className="relative opacity-0"
                    >
                        <div className="rounded-2xl overflow-hidden shadow-2xl">
                            <img
                                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800"
                                alt="Team collaboration"
                                className="w-full h-[400px] object-cover"
                            />
                        </div>
                        <div className="absolute -bottom-6 -right-6 bg-[#FF6B35] text-white p-6 rounded-xl shadow-lg">
                            <div className="text-4xl font-bold">5+</div>
                            <div className="text-sm">Years of Service</div>
                        </div>
                    </div>

                    {/* Right Side - Content */}
                    <div>
                        {/* Title */}
                        <h2
                            ref={titleRef}
                            className="text-4xl font-bold text-gray-900 mb-6 opacity-0"
                        >
                            Our Mission & Vision
                        </h2>

                        {/* Paragraphs */}
                        <p
                            ref={paragraph1Ref}
                            className="text-lg text-gray-700 mb-6 leading-relaxed opacity-0"
                        >
                            Hamro Sewa is Nepal's leading service marketplace, dedicated to making quality home services
                            accessible to everyone. We bridge the gap between skilled service providers and customers
                            who need reliable, professional services.
                        </p>
                        <p
                            ref={paragraph2Ref}
                            className="text-lg text-gray-700 mb-8 leading-relaxed opacity-0"
                        >
                            Our platform empowers service professionals to grow their business while providing customers
                            with a seamless booking experience. From home repairs to professional services, we're
                            transforming how services are delivered in Nepal.
                        </p>

                        {/* Features */}
                        <div ref={featuresRef} className="space-y-4">
                            <div className="feature-item flex items-start gap-4 opacity-0">
                                <div className="bg-[#F1F3F5] p-3 rounded-lg">
                                    <CheckCircle className="w-6 h-6 text-[#FF6B35]" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg mb-1">Quality Assurance</h3>
                                    <p className="text-gray-600">Verified professionals with proven track records</p>
                                </div>
                            </div>

                            <div className="feature-item flex items-start gap-4 opacity-0">
                                <div className="bg-[#F1F3F5] p-3 rounded-lg">
                                    <Clock className="w-6 h-6 text-[#FF6B35]" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg mb-1">24/7 Support</h3>
                                    <p className="text-gray-600">Round-the-clock customer service for your convenience</p>
                                </div>
                            </div>

                            <div className="feature-item flex items-start gap-4 opacity-0">
                                <div className="bg-[#F1F3F5] p-3 rounded-lg">
                                    <Shield className="w-6 h-6 text-[#FF6B35]" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg mb-1">Transparent Pricing</h3>
                                    <p className="text-gray-600">No hidden charges, clear pricing for all services</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
