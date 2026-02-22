'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, SlidersHorizontal, X, Star, Check, ChevronDown, MapPin, ChevronRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface Service {
    _id: string;
    title: string;
    slug: string;
    shortDescription: string;
    description: string;
    category: {
        _id: string;
        name: string;
        parent: string | { _id: string; name: string } | null;
    };
    location: string;
    price: number;
    priceLabel: string;
    rating: number;
    images: Array<{ url: string; isPrimary: boolean }>;
    featured: boolean;
    popular: boolean;
    provider: {
        name: string;
        verified: boolean;
    };
}

interface Category {
    _id: string;
    name: string;
    slug: string;
    parent: string | { _id: string; name: string } | null;
}

export default function ServicesPage() {
    const searchParams = useSearchParams();
    const [location, setLocation] = useState('Location');
    const [services, setServices] = useState<Service[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [searchLocation, setSearchLocation] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [debouncedLocation, setDebouncedLocation] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [sortBy, setSortBy] = useState('featured');
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

    // Initialize search from URL params
    useEffect(() => {
        const queryParam = searchParams.get('q');
        const locationParam = searchParams.get('location');

        if (queryParam) {
            setSearchQuery(queryParam);
            setDebouncedSearch(queryParam);
        }
        if (locationParam) {
            setSearchLocation(locationParam);
            setDebouncedLocation(locationParam);
        }
    }, [searchParams]);

    // Fetch services and categories
    useEffect(() => {
        fetchServices();
        fetchCategories();
    }, []);

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Debounce location search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedLocation(searchLocation);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchLocation]);

    const fetchServices = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/services');
            if (response.ok) {
                const data = await response.json();
                setServices(data);
            }
        } catch (error) {
            console.error('Error fetching services:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/categories/all');
            if (response.ok) {
                const data = await response.json();
                setCategories(data);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    // Get parent categories
    const parentCategories = useMemo(() => {
        return categories.filter(cat => !cat.parent);
    }, [categories]);

    // Get all subcategories
    const allSubCategories = useMemo(() => {
        return categories.filter(cat => cat.parent);
    }, [categories]);

    // Filter and sort services
    const filteredAndSortedServices = useMemo(() => {
        let filtered = [...services];

        // Search filter (title/description)
        if (debouncedSearch) {
            const query = debouncedSearch.toLowerCase();
            filtered = filtered.filter(service =>
                service.title.toLowerCase().includes(query) ||
                service.description.toLowerCase().includes(query) ||
                service.shortDescription?.toLowerCase().includes(query)
            );
        }

        // Location filter
        if (debouncedLocation) {
            const locationQuery = debouncedLocation.toLowerCase();
            filtered = filtered.filter(service =>
                service.location?.toLowerCase().includes(locationQuery)
            );
        }

        // Category filter
        if (selectedCategory) {
            const isSubCategory = allSubCategories.some(cat => cat._id === selectedCategory);

            if (isSubCategory) {
                filtered = filtered.filter(service => service.category._id === selectedCategory);
            } else {
                const subCatIds = allSubCategories
                    .filter(cat => {
                        if (typeof cat.parent === 'object' && cat.parent) {
                            return cat.parent._id === selectedCategory;
                        }
                        return cat.parent === selectedCategory;
                    })
                    .map(cat => cat._id);
                filtered = filtered.filter(service => subCatIds.includes(service.category._id));
            }
        }

        // Sort
        switch (sortBy) {
            case 'featured':
                filtered.sort((a, b) => {
                    if (a.featured && !b.featured) return -1;
                    if (!a.featured && b.featured) return 1;
                    return 0;
                });
                break;
            case 'popular':
                filtered.sort((a, b) => {
                    if (a.popular && !b.popular) return -1;
                    if (!a.popular && b.popular) return 1;
                    return 0;
                });
                break;
            case 'price-low':
                filtered.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                filtered.sort((a, b) => b.price - a.price);
                break;
            case 'rating':
                filtered.sort((a, b) => b.rating - a.rating);
                break;
            case 'name':
                filtered.sort((a, b) => a.title.localeCompare(b.title));
                break;
        }

        return filtered;
    }, [services, debouncedSearch, debouncedLocation, selectedCategory, sortBy, allSubCategories]);

    const clearFilters = () => {
        setSearchQuery('');
        setSearchLocation('');
        setSelectedCategory('');
        setSortBy('featured');
    };

    const toggleCategory = (categoryId: string) => {
        setExpandedCategories(prev =>
            prev.includes(categoryId)
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    const hasActiveFilters = searchQuery || searchLocation || selectedCategory || sortBy !== 'featured';

    return (
        <>
            <Navbar location={location} setLocation={setLocation} />

            <div className="min-h-screen bg-gray-50">
                {/* Hero Section with Search */}
                <div className="bg-gradient-to-br from-[#26cf71] to-[#1eb863] pt-24 pb-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6">
                        <div className="text-center mb-8">
                            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
                                Find the Perfect Service
                            </h1>
                            <p className="text-lg text-white/90 max-w-2xl mx-auto">
                                Browse through {services.length}+ professional services
                            </p>
                        </div>

                        {/* Search Bar */}
                        <div className="max-w-3xl mx-auto">
                            <form onSubmit={(e) => e.preventDefault()} className="bg-white rounded-xl shadow-lg p-2 flex flex-col sm:flex-row gap-2">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="Search for any service..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 text-base border-0 focus:outline-none rounded-lg"
                                    />
                                </div>
                                <div className="flex-1 relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="Location..."
                                        value={searchLocation}
                                        onChange={(e) => setSearchLocation(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 text-base border-0 focus:outline-none rounded-lg"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        // Trigger search by updating debounced values immediately
                                        setDebouncedSearch(searchQuery);
                                        setDebouncedLocation(searchLocation);
                                    }}
                                    className="bg-[#26cf71] hover:bg-[#1eb863] text-white px-8 py-3 rounded-lg font-semibold transition-colors whitespace-nowrap"
                                >
                                    Search
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Sidebar Filters - Desktop */}
                        <aside className="hidden lg:block w-72 flex-shrink-0">
                            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                                    {hasActiveFilters && (
                                        <button
                                            onClick={clearFilters}
                                            className="text-sm text-[#26cf71] hover:text-[#1eb863] font-semibold"
                                        >
                                            Clear all
                                        </button>
                                    )}
                                </div>

                                {/* Category Filter */}
                                <div className="mb-6">
                                    <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">Category</h3>
                                    <div className="space-y-1 max-h-96 overflow-y-auto">
                                        <label className="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition">
                                            <input
                                                type="checkbox"
                                                value=""
                                                checked={selectedCategory === ''}
                                                onChange={() => setSelectedCategory('')}
                                                className="w-4 h-4 text-[#26cf71] focus:ring-[#26cf71] border-gray-300 rounded"
                                            />
                                            <span className="ml-3 text-sm text-gray-700">All Categories</span>
                                        </label>
                                        {parentCategories.map(parent => {
                                            const isExpanded = expandedCategories.includes(parent._id);
                                            const subCats = allSubCategories.filter(sub => {
                                                if (typeof sub.parent === 'object' && sub.parent) {
                                                    return sub.parent._id === parent._id;
                                                }
                                                return sub.parent === parent._id;
                                            });

                                            return (
                                                <div key={parent._id}>
                                                    <div className="flex items-center">
                                                        <button
                                                            onClick={() => toggleCategory(parent._id)}
                                                            className="p-2 hover:bg-gray-50 rounded-lg transition"
                                                        >
                                                            {isExpanded ? (
                                                                <ChevronDown className="w-4 h-4 text-gray-600" />
                                                            ) : (
                                                                <ChevronRight className="w-4 h-4 text-gray-600" />
                                                            )}
                                                        </button>
                                                        <label className="flex-1 flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition">
                                                            <input
                                                                type="checkbox"
                                                                value={parent._id}
                                                                checked={selectedCategory === parent._id}
                                                                onChange={() => setSelectedCategory(parent._id)}
                                                                className="w-4 h-4 text-[#26cf71] focus:ring-[#26cf71] border-gray-300 rounded"
                                                            />
                                                            <span className="ml-3 text-sm font-semibold text-gray-900">{parent.name}</span>
                                                        </label>
                                                    </div>
                                                    {isExpanded && subCats.length > 0 && (
                                                        <div className="ml-6 space-y-1">
                                                            {subCats.map(sub => (
                                                                <label key={sub._id} className="flex items-center p-2 pl-6 hover:bg-gray-50 rounded-lg cursor-pointer transition">
                                                                    <input
                                                                        type="checkbox"
                                                                        value={sub._id}
                                                                        checked={selectedCategory === sub._id}
                                                                        onChange={() => setSelectedCategory(sub._id)}
                                                                        className="w-4 h-4 text-[#26cf71] focus:ring-[#26cf71] border-gray-300 rounded"
                                                                    />
                                                                    <span className="ml-3 text-sm text-gray-600">{sub.name}</span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Location Quick Filter */}
                                {debouncedLocation && (
                                    <div className="mb-6 pb-6 border-b border-gray-200">
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-[#26cf71]" />
                                                    <span className="text-sm font-semibold text-gray-900">Location: {debouncedLocation}</span>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        setSearchLocation('');
                                                        setDebouncedLocation('');
                                                    }}
                                                    className="text-gray-500 hover:text-red-600"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </aside>

                        {/* Mobile Filter Button */}
                        <div className="lg:hidden">
                            <button
                                onClick={() => setShowMobileFilters(!showMobileFilters)}
                                className="w-full bg-white rounded-lg shadow-sm px-4 py-3 flex items-center justify-between mb-4"
                            >
                                <div className="flex items-center gap-2">
                                    <SlidersHorizontal className="w-5 h-5 text-gray-600" />
                                    <span className="font-semibold text-gray-900">Filters</span>
                                    {hasActiveFilters && (
                                        <span className="bg-[#26cf71] text-white text-xs px-2 py-0.5 rounded-full">Active</span>
                                    )}
                                </div>
                                <ChevronDown className={`w-5 h-5 text-gray-600 transition-transform ${showMobileFilters ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Mobile Filters Dropdown */}
                            {showMobileFilters && (
                                <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold text-gray-900">Filters</h3>
                                        {hasActiveFilters && (
                                            <button
                                                onClick={clearFilters}
                                                className="text-sm text-[#26cf71] hover:text-[#1eb863] font-semibold"
                                            >
                                                Clear all
                                            </button>
                                        )}
                                    </div>

                                    {/* Category */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                                        <select
                                            value={selectedCategory}
                                            onChange={(e) => setSelectedCategory(e.target.value)}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#26cf71]"
                                        >
                                            <option value="">All Categories</option>
                                            {parentCategories.map(parent => (
                                                <optgroup key={parent._id} label={parent.name}>
                                                    <option value={parent._id}>All {parent.name}</option>
                                                    {allSubCategories
                                                        .filter(sub => {
                                                            if (typeof sub.parent === 'object' && sub.parent) {
                                                                return sub.parent._id === parent._id;
                                                            }
                                                            return sub.parent === parent._id;
                                                        })
                                                        .map(sub => (
                                                            <option key={sub._id} value={sub._id}>
                                                                &nbsp;&nbsp;{sub.name}
                                                            </option>
                                                        ))}
                                                </optgroup>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Sort */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Sort By</label>
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#26cf71]"
                                        >
                                            <option value="featured">Featured</option>
                                            <option value="popular">Most Popular</option>
                                            <option value="price-low">Price: Low to High</option>
                                            <option value="price-high">Price: High to Low</option>
                                            <option value="rating">Highest Rated</option>
                                            <option value="name">Alphabetical</option>
                                        </select>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Main Content - Services */}
                        <div className="flex-1">
                            {/* Results Header with Sort */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        {(debouncedSearch || debouncedLocation) ? 'Search Results' : selectedCategory ? 'Filtered Services' : 'All Services'}
                                    </h2>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {filteredAndSortedServices.length} {filteredAndSortedServices.length === 1 ? 'service' : 'services'}
                                        {debouncedSearch && ` matching "${debouncedSearch}"`}
                                        {debouncedSearch && debouncedLocation && ' in '}
                                        {debouncedLocation && `${debouncedSearch ? '' : ' in '}${debouncedLocation}`}
                                    </p>
                                </div>

                                {/* Sort By Dropdown */}
                                <div className="flex items-center gap-2">
                                    <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Sort by:</label>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#26cf71] focus:border-transparent bg-white"
                                    >
                                        <option value="featured">Featured</option>
                                        <option value="popular">Most Popular</option>
                                        <option value="price-low">Price: Low to High</option>
                                        <option value="price-high">Price: High to Low</option>
                                        <option value="rating">Highest Rated</option>
                                        <option value="name">Alphabetical</option>
                                    </select>
                                </div>
                            </div>

                            {/* Services Grid */}
                            {loading ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {[1, 2, 3, 4, 5, 6].map((i) => (
                                        <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm">
                                            <div className="h-48 bg-gray-200 animate-pulse"></div>
                                            <div className="p-4 space-y-3">
                                                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                                <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : filteredAndSortedServices.length === 0 ? (
                                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                                    <div className="text-6xl mb-4">🔍</div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">No services found</h3>
                                    <p className="text-gray-600 mb-6">Try adjusting your filters or search query</p>
                                    {hasActiveFilters && (
                                        <button
                                            onClick={clearFilters}
                                            className="px-6 py-3 bg-[#26cf71] text-white rounded-lg hover:bg-[#1eb863] transition font-semibold"
                                        >
                                            Clear All Filters
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredAndSortedServices.map((service) => {
                                        const primaryImage = service.images.find(img => img.isPrimary)?.url || service.images[0]?.url;

                                        return (
                                            <Link
                                                key={service._id}
                                                href={`/service/${service.slug}`}
                                                className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                                            >
                                                <div className="relative aspect-[4/3] overflow-hidden">
                                                    <img
                                                        src={primaryImage}
                                                        alt={service.title}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                    />
                                                    {/* Badges */}
                                                    {(service.featured || service.popular) && (
                                                        <div className="absolute top-3 left-3 flex gap-2">
                                                            {service.featured && (
                                                                <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                                                                    Featured
                                                                </span>
                                                            )}
                                                            {service.popular && (
                                                                <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                                                                    Popular
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="p-4">
                                                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#26cf71] transition-colors">
                                                        {service.title}
                                                    </h3>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-sm text-gray-600">{service.provider.name}</span>
                                                        {service.provider.verified && (
                                                            <div className="bg-[#26cf71] rounded-full p-0.5">
                                                                <Check className="w-3 h-3 text-white" strokeWidth={3} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    {service.location && (
                                                        <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                                                            <MapPin className="w-3 h-3" />
                                                            <span>{service.location}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-1">
                                                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                                            <span className="text-sm font-bold text-gray-900">
                                                                {service.rating > 0 ? service.rating.toFixed(1) : 'New'}
                                                            </span>
                                                        </div>
                                                        <div className="text-[#26cf71] font-bold text-lg">
                                                            {service.priceLabel}
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
}
