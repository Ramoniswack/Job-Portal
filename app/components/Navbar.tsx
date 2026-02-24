'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { MapPin, Navigation } from 'lucide-react';

interface NavbarProps {
    location?: string;
    setLocation?: (location: string) => void;
}

// Helper function to get location from localStorage (runs synchronously)
const getStoredLocation = (): string => {
    if (typeof window === 'undefined') return 'Select Location';

    try {
        const storedUserData = localStorage.getItem('hamroSewaUserData');
        if (storedUserData) {
            const userData = JSON.parse(storedUserData);
            if (userData.location) {
                return userData.location;
            }
        }
    } catch (error) {
        console.error('Error loading location from localStorage:', error);
    }
    return 'Select Location';
};

// Helper function to update location in localStorage
const updateLocationInStorage = (newLocation: string) => {
    try {
        const storedUserData = localStorage.getItem('hamroSewaUserData');
        if (storedUserData) {
            const userData = JSON.parse(storedUserData);
            userData.location = newLocation;
            localStorage.setItem('hamroSewaUserData', JSON.stringify(userData));
        } else {
            localStorage.setItem('hamroSewaUserData', JSON.stringify({ location: newLocation }));
        }
    } catch (error) {
        console.error('Error updating location in localStorage:', error);
    }
};

export default function Navbar({ location: propLocation, setLocation: propSetLocation }: NavbarProps) {
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [showLocationDropdown, setShowLocationDropdown] = useState(false);

    // Initialize with stored location immediately (no flash)
    const [internalLocation, setInternalLocation] = useState(() => getStoredLocation());
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Wrapper function that updates both state and localStorage
    const updateLocation = (newLocation: string) => {
        if (propSetLocation) {
            propSetLocation(newLocation);
        } else {
            setInternalLocation(newLocation);
        }
        updateLocationInStorage(newLocation);
    };

    // Use internal state if props not provided
    const location = propLocation !== undefined ? propLocation : internalLocation;
    const setLocation = updateLocation;

    // Set mounted to true after first render
    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Check if user is logged in
    useEffect(() => {
        if (!mounted) return;

        const checkAuth = () => {
            const token = localStorage.getItem('authToken');
            const user = localStorage.getItem('currentUser');
            setIsLoggedIn(!!(token && user));
        };

        checkAuth();
        window.addEventListener('storage', checkAuth);
        return () => window.removeEventListener('storage', checkAuth);
    }, [mounted]);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const detectLocation = () => {
        setShowLocationDropdown(false);

        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser.');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                    );
                    const data = await response.json();

                    const city = data.address.city || data.address.town || data.address.village || data.address.state || 'Unknown Location';
                    setLocation(city);
                } catch (error) {
                    console.error('Error fetching location:', error);
                    setLocation('Detected Location');
                }
            },
            () => {
                alert('Unable to detect location. Please select manually.');
                setShowLocationDropdown(true);
            }
        );
    };

    const selectLocation = (loc: string) => {
        setLocation(loc);
        setShowLocationDropdown(false);
    };

    return (
        <header
            className={`fixed top-0 left-0 w-full z-[100] transition-all duration-300 ${scrolled ? 'bg-white/95 shadow-lg' : 'bg-white'
                }`}
        >
            <nav className="h-[4.5rem] flex justify-between items-center px-6 max-w-6xl mx-auto">
                <a
                    href="/"
                    className="flex items-center transition-opacity duration-300 hover:opacity-80"
                >
                    <img src="/logo.jpg" alt="Hamro Sewa" className="h-8 w-auto" />
                </a>

                <div
                    className={`flex gap-8 items-center md:flex-row md:static md:w-auto md:h-auto md:bg-transparent md:shadow-none md:p-0 
            fixed top-0 ${isMenuOpen ? 'right-0' : '-right-full'
                        } w-[70%] h-screen bg-white shadow-[-2px_0_16px_rgba(0,0,0,0.1)] p-8 pt-16 flex-col md:items-center items-start transition-[right] duration-[400ms] md:transition-none`}
                >
                    <button
                        className="absolute top-4 right-6 text-2xl text-[#333] cursor-pointer bg-transparent border-none md:hidden"
                        onClick={toggleMenu}
                    >
                        ✕
                    </button>

                    <ul className="flex gap-8 list-none md:flex-row flex-col md:gap-8 gap-6">
                        <li>
                            <a
                                href="/"
                                className={`text-[#333] font-medium no-underline relative transition-colors duration-300 hover:text-[#FF6B35] 
                  after:content-[''] after:absolute after:bottom-[-8px] after:left-0 after:h-[2px] after:bg-[#FF6B35] 
                  after:transition-[width] after:duration-300 hover:after:w-full ${pathname === '/' ? 'text-[#FF6B35] after:w-full' : 'after:w-0'
                                    }`}
                            >
                                Home
                            </a>
                        </li>
                        <li>
                            <a
                                href="/services"
                                className={`text-[#333] font-medium no-underline relative transition-colors duration-300 hover:text-[#FF6B35] 
                  after:content-[''] after:absolute after:bottom-[-8px] after:left-0 after:h-[2px] after:bg-[#FF6B35] 
                  after:transition-[width] after:duration-300 hover:after:w-full ${pathname === '/services' ? 'text-[#FF6B35] after:w-full' : 'after:w-0'
                                    }`}
                            >
                                Services
                            </a>
                        </li>
                        <li>
                            <a
                                href="/about"
                                className={`text-[#333] font-medium no-underline relative transition-colors duration-300 hover:text-[#FF6B35] 
                  after:content-[''] after:absolute after:bottom-[-8px] after:left-0 after:h-[2px] after:bg-[#FF6B35] 
                  after:transition-[width] after:duration-300 hover:after:w-full ${pathname === '/about' ? 'text-[#FF6B35] after:w-full' : 'after:w-0'
                                    }`}
                            >
                                About
                            </a>
                        </li>
                        <li>
                            <a
                                href="/contact"
                                className={`text-[#333] font-medium no-underline relative transition-colors duration-300 hover:text-[#FF6B35] 
                  after:content-[''] after:absolute after:bottom-[-8px] after:left-0 after:h-[2px] after:bg-[#FF6B35] 
                  after:transition-[width] after:duration-300 hover:after:w-full ${pathname === '/contact' ? 'text-[#FF6B35] after:w-full' : 'after:w-0'
                                    }`}
                            >
                                Contact
                            </a>
                        </li>
                        <li>
                            <a
                                href={mounted && isLoggedIn ? "/hamrosewa" : "/login"}
                                className={`text-[#333] font-medium no-underline relative transition-colors duration-300 hover:text-[#FF6B35] 
                  after:content-[''] after:absolute after:bottom-[-8px] after:left-0 after:h-[2px] after:bg-[#FF6B35] 
                  after:transition-[width] after:duration-300 hover:after:w-full ${pathname === '/hamrosewa' || pathname === '/dashboard' || pathname === '/login' ? 'text-[#FF6B35] after:w-full' : 'after:w-0'
                                    }`}
                            >
                                {mounted && isLoggedIn ? "Dashboard" : "Login"}
                            </a>
                        </li>
                    </ul>

                    <div className="relative md:w-auto w-full">
                        <button
                            onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                            className="bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium cursor-pointer transition-all duration-300 hover:border-[#FF6B35] flex items-center gap-2 md:w-auto w-full justify-between"
                        >
                            <MapPin className="w-5 h-5 text-red-500" />
                            <span>{mounted ? location : 'Select Location'}</span>
                            <span className="text-xs">▼</span>
                        </button>

                        {showLocationDropdown && (
                            <div className="absolute top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg w-full md:w-64 z-50">
                                <button
                                    onClick={detectLocation}
                                    className="w-full px-4 py-3 text-left hover:bg-[#F8F9FA] flex items-center gap-2 border-b border-gray-200 text-[#FF6B35] font-medium"
                                >
                                    <Navigation className="w-4 h-4" />
                                    Detect My Location
                                </button>
                                <div className="p-3">
                                    <input
                                        type="text"
                                        placeholder="Enter location manually"
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent outline-none"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                                                selectLocation(e.currentTarget.value.trim());
                                                e.currentTarget.value = '';
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <button
                    className="hidden md:hidden text-2xl text-[#333] cursor-pointer bg-transparent border-none max-[768px]:block"
                    onClick={toggleMenu}
                >
                    ☰
                </button>
            </nav>
        </header>
    );
}
