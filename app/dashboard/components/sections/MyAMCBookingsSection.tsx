'use client';

import React, { useState, useEffect } from 'react';
import { User, Package, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface AMCBooking {
    _id: string;
    package: {
        _id: string;
        title: string;
        cardImage: string;
        createdBy?: {
            _id: string;
            name: string;
            email: string;
        };
    };
    customer?: {
        _id: string;
        name: string;
        email: string;
    };
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    customerAddress: string;
    tier: {
        name: string;
        price: number;
        duration: string;
    };
    status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
    notes?: string;
    createdAt: string;
}

interface MyAMCPackage {
    _id: string;
    title: string;
    cardImage: string;
    category: string;
    bookings: AMCBooking[];
}

interface MyAMCBookingsSectionProps {
    token: string;
}

export default function MyAMCBookingsSection({ token }: MyAMCBookingsSectionProps) {
    const [packages, setPackages] = useState<MyAMCPackage[]>([]);
    const [myBookings, setMyBookings] = useState<AMCBooking[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'provider' | 'customer'>('customer'); // Default to customer view

    useEffect(() => {
        if (activeTab === 'provider') {
            loadMyPackages();
        } else {
            loadMyBookings();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);

    const loadMyPackages = async () => {
        setLoading(true);
        try {
            // Fetch user's packages
            const packagesResponse = await fetch('http://localhost:5000/api/amc-packages/user/my-packages', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!packagesResponse.ok) {
                if (packagesResponse.status === 401) {
                    toast.error('Session Expired', {
                        description: 'Please log out and log back in.',
                        duration: 4000,
                    });
                    return;
                }
                throw new Error(`HTTP error! status: ${packagesResponse.status}`);
            }

            const packagesData = await packagesResponse.json();

            if (!packagesData.success) {
                toast.error('Failed to Load Packages', {
                    description: packagesData.message || 'Unable to load your AMC packages.',
                    duration: 4000,
                });
                return;
            }

            // Fetch all bookings for user's packages
            const bookingsResponse = await fetch('http://localhost:5000/api/amc-bookings/my-package-bookings', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const bookingsData = await bookingsResponse.json();
            const allBookings = bookingsData.success ? bookingsData.data : [];

            // Group bookings by package
            const packagesWithBookings = packagesData.data.map((pkg: any) => ({
                ...pkg,
                bookings: allBookings.filter((booking: any) =>
                    booking.package._id === pkg._id || booking.package === pkg._id
                )
            }));

            console.log('📦 Packages with bookings:', packagesWithBookings);
            setPackages(packagesWithBookings);
        } catch (error) {
            console.error('Error loading packages:', error);
            toast.error('Error', {
                description: 'Failed to load your AMC packages.',
                duration: 4000,
            });
        } finally {
            setLoading(false);
        }
    };

    const loadMyBookings = async () => {
        setLoading(true);
        try {
            // Fetch bookings made by the user as a customer
            const response = await fetch('http://localhost:5000/api/amc-bookings/my-bookings', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();

            if (data.success) {
                console.log('📋 My bookings as customer:', data.data);
                setMyBookings(data.data);
            } else {
                toast.error('Failed to Load Bookings', {
                    description: data.message || 'Unable to load your bookings.',
                    duration: 4000,
                });
            }
        } catch (error) {
            console.error('Error loading bookings:', error);
            toast.error('Error', {
                description: 'Failed to load your bookings.',
                duration: 4000,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleBookingAction = async (bookingId: string, action: 'approve' | 'reject') => {
        try {
            const response = await fetch(`http://localhost:5000/api/amc-bookings/${bookingId}/${action}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            if (data.success) {
                toast.success(
                    action === 'approve' ? 'Booking Approved!' : 'Booking Rejected',
                    {
                        description: `The booking has been ${action}d successfully.`,
                        duration: 4000,
                    }
                );
                loadMyPackages();
            } else {
                toast.error('Action Failed', {
                    description: data.message || `Failed to ${action} booking.`,
                    duration: 4000,
                });
            }
        } catch (error) {
            console.error(`Error ${action}ing booking:`, error);
            toast.error('Connection Error', {
                description: `Failed to ${action} booking. Please try again.`,
                duration: 4000,
            });
        }
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            pending: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600',
            approved: 'bg-green-50 text-green-600 border border-green-200',
            rejected: 'bg-red-50 text-red-600 border border-red-200',
            completed: 'bg-blue-50 text-blue-600 border border-blue-200',
            cancelled: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 dark:text-gray-500 border border-gray-300 dark:border-gray-600'
        };
        return styles[status as keyof typeof styles] || styles.pending;
    };

    const getPendingCount = (pkg: MyAMCPackage) => {
        return pkg.bookings?.filter(b => b.status === 'pending').length || 0;
    };

    if (loading) {
        return (
            <div className="p-8">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#26cf71]"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My AMC Bookings</h2>
                <p className="text-gray-500 dark:text-gray-500 mt-1">View your bookings and manage package requests</p>
            </div>

            {/* Tabs */}
            <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex gap-4">
                    <button
                        onClick={() => setActiveTab('customer')}
                        className={`pb-3 px-4 font-medium transition-colors relative ${activeTab === 'customer'
                            ? 'text-[#FF6B35] border-b-2 border-[#FF6B35]'
                            : 'text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:text-gray-300'
                            }`}
                    >
                        My Bookings
                        {activeTab === 'customer' && myBookings.length > 0 && (
                            <span className="ml-2 px-2 py-0.5 text-xs bg-[#FF6B35] text-white rounded-full">
                                {myBookings.length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('provider')}
                        className={`pb-3 px-4 font-medium transition-colors relative ${activeTab === 'provider'
                            ? 'text-[#FF6B35] border-b-2 border-[#FF6B35]'
                            : 'text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:text-gray-300'
                            }`}
                    >
                        My Packages
                        {activeTab === 'provider' && packages.length > 0 && (
                            <span className="ml-2 px-2 py-0.5 text-xs bg-[#FF6B35] text-white rounded-full">
                                {packages.length}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Customer View - My Bookings */}
            {activeTab === 'customer' && (
                myBookings.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
                        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="mt-4 text-gray-600 dark:text-gray-400 dark:text-gray-500">You haven't booked any AMC packages yet</p>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Browse available packages and book one to get started</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {myBookings.map((booking) => (
                            <div key={booking._id} className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                                <div className="flex items-start gap-4">
                                    {booking.package?.cardImage && (
                                        <img
                                            src={booking.package.cardImage}
                                            alt={booking.package.title}
                                            className="w-20 h-20 object-cover rounded-lg"
                                        />
                                    )}
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">{booking.package?.title || booking.packageTitle}</h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                                                    {booking.tier.name} Plan - NPR {booking.tier.price.toLocaleString()}/{booking.tier.duration}
                                                </p>
                                            </div>
                                            <span className={`text-xs px-3 py-1 rounded-full ${getStatusBadge(booking.status)}`}>
                                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                            </span>
                                        </div>
                                        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                                            {booking.package?.createdBy && (
                                                <>
                                                    <div className="col-span-2 pb-3 border-b border-gray-200 dark:border-gray-700">
                                                        <p className="text-gray-500 dark:text-gray-500 font-medium mb-2">Package Provider:</p>
                                                        <div className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                                                            <User className="w-4 h-4 text-gray-500 dark:text-gray-500" />
                                                            <span className="font-medium">{booking.package.createdBy.name}</span>
                                                        </div>
                                                        {booking.package.createdBy.email && (
                                                            <div className="flex items-center gap-2 text-gray-900 dark:text-gray-100 mt-1">
                                                                <span className="material-symbols-outlined text-[18px] text-gray-500 dark:text-gray-500">mail</span>
                                                                <a href={`mailto:${booking.package.createdBy.email}`} className="hover:underline">
                                                                    {booking.package.createdBy.email}
                                                                </a>
                                                            </div>
                                                        )}
                                                    </div>
                                                </>
                                            )}
                                            <div>
                                                <span className="text-gray-500 dark:text-gray-500">Booked on:</span>
                                                <span className="ml-2 text-gray-900 dark:text-gray-100">{new Date(booking.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500 dark:text-gray-500">Phone:</span>
                                                <span className="ml-2 text-gray-900 dark:text-gray-100">{booking.customerPhone}</span>
                                            </div>
                                            <div className="col-span-2">
                                                <span className="text-gray-500 dark:text-gray-500">Address:</span>
                                                <span className="ml-2 text-gray-900 dark:text-gray-100">{booking.customerAddress}</span>
                                            </div>
                                            {booking.notes && (
                                                <div className="col-span-2">
                                                    <span className="text-gray-500 dark:text-gray-500">Notes:</span>
                                                    <span className="ml-2 text-gray-900 dark:text-gray-100">{booking.notes}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            )}

            {/* Provider View - My Packages */}
            {activeTab === 'provider' && (
                packages.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
                        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="mt-4 text-gray-600 dark:text-gray-400 dark:text-gray-500">You haven't created any AMC packages yet</p>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Go to "Add AMC Package" to create your first package</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {packages.map((pkg) => (
                            <div key={pkg._id} className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                                {/* Package Header */}
                                <div className="p-4 border-b bg-gray-50 dark:bg-gray-900 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        {pkg.cardImage && (
                                            <img
                                                src={pkg.cardImage}
                                                alt={pkg.title}
                                                className="w-16 h-16 object-cover rounded-lg"
                                            />
                                        )}
                                        <div>
                                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">{pkg.title}</h3>
                                            <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-600">
                                                {pkg.category}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {getPendingCount(pkg) > 0 && (
                                            <span className="bg-gray-50 dark:bg-gray-900 dark:bg-gray-9000 text-white text-xs px-2.5 py-1 rounded-full font-medium">
                                                {getPendingCount(pkg)} pending
                                            </span>
                                        )}
                                        <button
                                            onClick={() => setSelectedPackage(selectedPackage === pkg._id ? null : pkg._id)}
                                            className="text-sm text-[#26cf71] hover:text-[#1fb35f] font-medium"
                                        >
                                            {selectedPackage === pkg._id ? 'Hide' : 'View'} Bookings ({pkg.bookings?.length || 0})
                                        </button>
                                    </div>
                                </div>

                                {/* Bookings List */}
                                {selectedPackage === pkg._id && (
                                    <div className="p-4">
                                        {!pkg.bookings || pkg.bookings.length === 0 ? (
                                            <p className="text-center text-gray-500 dark:text-gray-500 py-8">No bookings yet</p>
                                        ) : (
                                            <div className="space-y-4">
                                                {pkg.bookings.map((booking) => (
                                                    <div key={booking._id} className="border rounded-lg p-4 hover:bg-gray-50 dark:bg-gray-900 transition">
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <User className="w-4 h-4 text-gray-500 dark:text-gray-500" />
                                                                    <span className="font-medium text-gray-900 dark:text-gray-100">
                                                                        {booking.customer?.name || booking.customerName}
                                                                    </span>
                                                                    <span className={`text- xs px - 2 py - 1 rounded - full ${getStatusBadge(booking.status)
                                                                        } `}>
                                                                        {booking.status}
                                                                    </span>
                                                                </div>
                                                                <div className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500 space-y-1">
                                                                    <div className="flex items-center gap-2">
                                                                        <Package className="w-4 h-4" />
                                                                        <span>{booking.tier.name} - NPR {booking.tier.price}/{booking.tier.duration}</span>
                                                                    </div>
                                                                    <div className="text-gray-600 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500">
                                                                        <span className="font-medium">Address:</span> {booking.customerAddress}
                                                                    </div>
                                                                    {booking.status === 'approved' && (
                                                                        <>
                                                                            {booking.customerEmail && (
                                                                                <div className="flex items-center gap-2 text-[#26cf71] font-medium">
                                                                                    <span className="material-symbols-outlined text-[18px]">mail</span>
                                                                                    <a href={`mailto:${booking.customerEmail} `} className="hover:underline">
                                                                                        {booking.customerEmail}
                                                                                    </a>
                                                                                </div>
                                                                            )}
                                                                            {booking.customerPhone && (
                                                                                <div className="flex items-center gap-2 text-[#26cf71] font-medium">
                                                                                    <span className="material-symbols-outlined text-[18px]">phone</span>
                                                                                    <a href={`tel:${booking.customerPhone} `} className="hover:underline">
                                                                                        {booking.customerPhone}
                                                                                    </a>
                                                                                </div>
                                                                            )}
                                                                        </>
                                                                    )}
                                                                    {booking.notes && (
                                                                        <p className="mt-2 text-gray-700 dark:text-gray-300 italic">"{booking.notes}"</p>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="flex gap-2 ml-4">
                                                                {booking.status === 'pending' && (
                                                                    <>
                                                                        <button
                                                                            onClick={() => handleBookingAction(booking._id, 'approve')}
                                                                            className="flex items-center gap-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm"
                                                                        >
                                                                            <CheckCircle className="w-4 h-4" />
                                                                            Approve
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleBookingAction(booking._id, 'reject')}
                                                                            className="flex items-center gap-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm"
                                                                        >
                                                                            <XCircle className="w-4 h-4" />
                                                                            Reject
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )
            )}
        </div>
    );
}
