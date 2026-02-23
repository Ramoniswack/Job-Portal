import { Search, MapPin } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Hero() {
    const router = useRouter();
    const [searchTitle, setSearchTitle] = useState('');
    const [searchLocation, setSearchLocation] = useState('');

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

    return (
        <section className="relative w-full h-[500px] flex items-center justify-center bg-cover bg-center text-white px-5" style={{ background: "linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('https://worknp.com/images/hero-bg.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <div className="w-full max-w-6xl mx-auto">
                <h1 className="text-5xl font-extrabold mb-2 tracking-tight">
                    Find Your <span className="text-white">Dream Job</span> Today
                </h1>
                <p className="text-lg mb-8 font-medium opacity-90">
                    Search 27 live opportunities across Nepal • 100% Free
                </p>

                <form onSubmit={handleSearch} className="bg-white rounded-[50px] flex items-center p-[6px_8px_6px_25px] shadow-[0_10px_25px_rgba(0,0,0,0.15)] w-full max-md:flex-col max-md:rounded-[20px] max-md:p-5">
                    <div className="flex-1 flex items-center border-r border-gray-300 px-4 max-md:border-r-0 max-md:border-b max-md:w-full max-md:mb-4 max-md:px-0 max-md:py-2">
                        <Search className="text-[#f65e19] text-lg mr-2.5" />
                        <input
                            type="text"
                            placeholder="Search by Job Title"
                            value={searchTitle}
                            onChange={(e) => setSearchTitle(e.target.value)}
                            className="border-none outline-none w-full py-2.5 text-[0.95rem] text-gray-600 bg-transparent"
                        />
                    </div>

                    <div className="flex-1 flex items-center px-4 max-md:w-full max-md:mb-4 max-md:px-0 max-md:py-2">
                        <MapPin className="text-[#f65e19] text-lg mr-2.5" />
                        <input
                            type="text"
                            placeholder="Location"
                            value={searchLocation}
                            onChange={(e) => setSearchLocation(e.target.value)}
                            className="border-none outline-none w-full py-2.5 text-[0.95rem] text-gray-600 bg-transparent"
                        />
                    </div>

                    <button
                        type="submit"
                        className="bg-[#f65e19] text-white border-none py-3 px-9 rounded-[30px] font-semibold text-base cursor-pointer transition-colors duration-200 hover:bg-[#e54d0a] max-md:w-full max-md:mt-2.5"
                    >
                        Search
                    </button>
                </form>
            </div>
        </section>
    );
}
