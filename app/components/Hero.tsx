'use client';

import { Search, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface HomeHeroData {
    title: string;
    highlightedText: string;
    subtitle: string;
    searchPlaceholder: string;
    locationPlaceholder: string;
    buttonText: string;
    backgroundImage: string;
    overlayOpacity: number;
}

export default function Hero() {
    const router = useRouter();
    const [searchTitle, setSearchTitle] = useState('');
    const [searchLocation, setSearchLocation] = useState('');
    const [heroData, setHeroData] = useState<HomeHeroData>({
        title: 'Find Your Dream Job Today',
        highlightedText: 'Dream Job',
        subtitle: 'Search 27 live opportunities across Nepal • 100% Free',
        searchPlaceholder: 'Search by Job Title',
        locationPlaceholder: 'Location',
        buttonText: 'Search',
        backgroundImage: 'https://worknp.com/images/hero-bg.png',
        overlayOpacity: 0.4
    });

    useEffect(() => {
        fetchHeroData();
    }, []);

    const fetchHeroData = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/home-hero');
            const data = await response.json();

            if (data.success) {
                setHeroData(data.data);
            }
        } catch (error) {
            console.error('Error fetching hero data:', error);
            // Use default data if fetch fails
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();

        // Build query parameters
        const params = new URLSearchParams();
        if (searchTitle.trim()) {
            params.append('q', searchTitle.trim());
        }
        if (searchLocation.trim()) {
            params.append('location', searchLocation.trim());
        }

        // Redirect to services page with search params
        router.push(`/services?${params.toString()}`);
    };

    // Split title to highlight the specified text
    const renderTitle = () => {
        const parts = heroData.title.split(heroData.highlightedText);
        return (
            <>
                {parts[0]}
                <span className="text-white inline-block">{heroData.highlightedText}</span>
                {parts[1]}
            </>
        );
    };

    return (
        <section className="relative w-full h-[500px] flex items-center justify-center text-white px-5 overflow-hidden">
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, ${heroData.overlayOpacity}), rgba(0, 0, 0, ${heroData.overlayOpacity})), url('${heroData.backgroundImage}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}
            ></div>
            <div className="w-full max-w-6xl mx-auto relative z-10">
                <h1 className="text-5xl font-extrabold mb-2 tracking-tight">
                    {renderTitle()}
                </h1>
                <p className="text-lg mb-8 font-medium">
                    {heroData.subtitle}
                </p>

                <form
                    onSubmit={handleSearch}
                    className="bg-white rounded-[50px] flex items-center p-[6px_8px_6px_25px] shadow-[0_10px_25px_rgba(0,0,0,0.15)] w-full max-md:flex-col max-md:rounded-[20px] max-md:p-5"
                >
                    <div className="flex-1 flex items-center border-r border-gray-300 px-4 max-md:border-r-0 max-md:border-b max-md:w-full max-md:mb-4 max-md:px-0 max-md:py-2 transition-all duration-300">
                        <Search className="text-[#f65e19] text-lg mr-2.5" />
                        <input
                            type="text"
                            placeholder={heroData.searchPlaceholder}
                            value={searchTitle}
                            onChange={(e) => setSearchTitle(e.target.value)}
                            className="border-none outline-none w-full py-2.5 text-[0.95rem] text-gray-600 bg-transparent focus:ring-2 focus:ring-[#f65e19] focus:ring-opacity-20 rounded transition-all duration-300"
                        />
                    </div>

                    <div className="flex-1 flex items-center px-4 max-md:w-full max-md:mb-4 max-md:px-0 max-md:py-2 transition-all duration-300">
                        <MapPin className="text-[#f65e19] text-lg mr-2.5" />
                        <input
                            type="text"
                            placeholder={heroData.locationPlaceholder}
                            value={searchLocation}
                            onChange={(e) => setSearchLocation(e.target.value)}
                            className="border-none outline-none w-full py-2.5 text-[0.95rem] text-gray-600 bg-transparent focus:ring-2 focus:ring-[#f65e19] focus:ring-opacity-20 rounded transition-all duration-300"
                        />
                    </div>

                    <button
                        type="submit"
                        className="bg-[#f65e19] text-white border-none py-3 px-9 rounded-[30px] font-semibold text-base cursor-pointer transition-all duration-200 hover:bg-[#e54d0a] hover:scale-105 active:scale-95 max-md:w-full max-md:mt-2.5"
                    >
                        {heroData.buttonText}
                    </button>
                </form>
            </div>
        </section>
    );
}