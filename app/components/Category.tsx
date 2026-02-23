'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface Category {
    _id: string;
    name: string;
    slug: string;
    image: string;
    description?: string;
}

export default function Category() {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/categories/parent');
            if (!response.ok) {
                throw new Error('Failed to fetch categories');
            }
            const data = await response.json();
            console.log('Fetched categories:', data);
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
            // Fallback to empty array - you could also set a default list here
            setCategories([]);
        } finally {
            setLoading(false);
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!scrollContainerRef.current) return;
        setIsDragging(true);
        setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
        setScrollLeft(scrollContainerRef.current.scrollLeft);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !scrollContainerRef.current) return;
        e.preventDefault();
        const x = e.pageX - scrollContainerRef.current.offsetLeft;
        const walk = (x - startX) * 2;
        scrollContainerRef.current.scrollLeft = scrollLeft - walk;
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
    };

    if (loading) {
        return (
            <div className="bg-white w-full py-10 px-4">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-bold text-[#1A2B3C] mb-12 px-4">
                        Browse by Category
                    </h2>
                    <div className="flex gap-8 pb-4">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="flex flex-col items-center text-center min-w-[140px]">
                                <div className="h-32 w-32 mb-4 bg-[#E9ECEF] rounded-lg animate-pulse"></div>
                                <div className="h-4 w-24 bg-[#E9ECEF] rounded animate-pulse"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white w-full py-10 px-4">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold text-[#1A2B3C] mb-12 px-4">
                    Browse by Category
                </h2>

                {categories.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-gray-500">No categories available. Please check the backend server.</p>
                    </div>
                ) : (
                    <div
                        ref={scrollContainerRef}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseLeave}
                        className={`overflow-x-auto scrollbar-hide select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'
                            }`}
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        <div className="flex gap-8 pb-4">
                            {categories.map((category) => (
                                <Link
                                    key={category._id}
                                    href={`/category/${category.slug}`}
                                    className="flex flex-col items-center text-center min-w-[140px] hover:scale-105 transition-transform duration-200"
                                >
                                    <div className="h-32 w-32 mb-4 flex items-center justify-center">
                                        <img
                                            src={category.image}
                                            alt={category.name}
                                            className="w-full h-full object-cover rounded-lg"
                                            draggable="false"
                                        />
                                    </div>
                                    <span className="text-base font-semibold text-gray-800 leading-tight cursor-pointer">
                                        {category.name}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                <style jsx>{`
                    .scrollbar-hide::-webkit-scrollbar {
                        display: none;
                    }
                `}</style>
            </div>
        </div>
    );
}
