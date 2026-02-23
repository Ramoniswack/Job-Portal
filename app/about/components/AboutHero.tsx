'use client';

export default function AboutHero() {
    return (
        <div className="relative bg-white pt-32 pb-20 px-4 sm:px-6">
            <div className="max-w-6xl mx-auto">
                <div className="text-center">
                    <h1 className="text-5xl md:text-6xl font-bold mb-2 text-gray-900 inline-block relative">
                        About <span className="text-[#FF6B35]">Hamro Sewa</span>
                    </h1>
                    <div className="flex justify-center mb-6">
                        <div className="h-1 w-24 bg-gradient-to-r from-[#FF6B35] to-[#FF5722] rounded-full"></div>
                    </div>
                    <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed text-gray-700">
                        Connecting service providers with customers across Nepal.
                        Your trusted platform for home services, repairs, and professional solutions.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <a
                            href="/register"
                            className="bg-[#FF6B35] text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-[#FF5722] transition shadow-lg"
                        >
                            Get Started
                        </a>
                        <a
                            href="#how-it-works"
                            className="bg-transparent border-2 border-[#FF6B35] text-[#FF6B35] px-8 py-4 rounded-full font-bold text-lg hover:bg-[#FF6B35] hover:text-white transition"
                        >
                            Learn More
                        </a>
                    </div>
                </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-20 left-10 w-20 h-20 bg-[#FF6B35] opacity-5 rounded-full"></div>
            <div className="absolute bottom-10 right-20 w-32 h-32 bg-[#FF6B35] opacity-5 rounded-full"></div>
            <div className="absolute top-40 right-40 w-16 h-16 bg-[#FF6B35] opacity-5 rounded-full"></div>
        </div>
    );
}
