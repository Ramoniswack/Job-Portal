'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, User, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface Booking {
    _id: string;
    service: {
        _id: string;
        title: string;
        price: number;
        images: Array<{ url: string }>;
        createdBy: {
            _id: string;
            name: string;
            email: string;
        };
    };
    bookingDate: string;
    bookingTime: string;
    status: 'pending' | 'approved' | 'rejected' | 'completed';
    createdAt: string;
}

interface MyBookingsSectionProps {
    token: string;
}

export default function MyBookingsSection({ token }: MyBookingsSectionProps) {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadMyBookings();
    }, []);

    const loadMyBookings = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/bookings/my-bookings', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data.success) {
                setBookings(data.data);
            } else {
                console.error('Failed to load bookings:', data.message);
            }
        } catch (error) {
            console.error('Error loading bookings:', error);
            // Set empty array on error so UI doesn't break
            setBookings([]);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return 'bg-green-50 text-green-700 border border-green-200';
            case 'pending':
                return 'bg-gray-50 text-gray-700 border border-gray-200';
            case 'rejected':
                return 'bg-red-50 text-red-700 border border-red-200';
            case 'completed':
                return 'bg-blue-50 text-blue-700 border border-blue-200';
            default:
                return 'bg-gray-50 text-gray-700 border border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved':
                return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'pending':
                return <AlertCircle className="w-5 h-5 text-gray-600" />;
            case 'rejected':
                return <XCircle className="w-5 h-5 text-red-600" />;
            case 'completed':
                return <CheckCircle className="w-5 h-5 text-blue-600" />;
            default:
                return <AlertCircle className="w-5 h-5 text-gray-600" />;
        }
    };

    if (loading) {
        return (
            <div className="p-8">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
                <p className="text-gray-500 mt-1">View all your service bookings and their status</p>
            </div>

            {bookings.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calendar className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Bookings Yet</h3>
                    <p className="text-gray-500">You haven't booked any services yet. Browse services to make your first booking.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {bookings
                        .filter((booking) => booking.service != null) // Filter out bookings with null service
                        .map((booking) => (
                            <div key={booking._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                                <div className="p-6">
                                    <div className="flex gap-6">
                                        {/* Service Image */}
                                        <div className="flex-shrink-0">
                                            <img
                                                src={booking.service.images?.[0]?.url || '/placeholder-service.jpg'}
                                                alt={booking.service.title || 'Service'}
                                                className="w-32 h-32 object-cover rounded-lg"
                                            />
                                        </div>

                                        {/* Booking Details */}
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                                        {booking.service.title || 'Service'}
                                                    </h3>
                                                    {booking.service?.createdBy && (
                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                            <User className="w-4 h-4" />
                                                            <span>Provider: {booking.service.createdBy.name}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {getStatusIcon(booking.status)}
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(booking.status)}`}>
                                                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mb-3">
                                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                                    <Calendar className="w-4 h-4 text-gray-500" />
                                                    <span>{new Date(booking.bookingDate).toLocaleDateString('en-US', {
                                                        weekday: 'short',
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                                    <Clock className="w-4 h-4 text-gray-500" />
                                                    <span>{booking.bookingTime}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                                <div className="text-lg font-bold text-[#f97316]">
                                                    NPR {booking.service.price || 0}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    Booked on {new Date(booking.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>

                                            {booking.status === 'approved' && (
                                                <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                                                    <p className="text-sm text-green-800">
                                                        ✓ Your booking has been approved! You can now message the provider.
                                                    </p>
                                                </div>
                                            )}

                                            {booking.status === 'pending' && (
                                                <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                    <p className="text-sm text-gray-700">
                                                        ⏳ Waiting for provider approval. You'll be notified once approved.
                                                    </p>
                                                </div>
                                            )}

                                            {booking.status === 'rejected' && (
                                                <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                                                    <p className="text-sm text-red-800">
                                                        ✗ This booking was rejected by the provider.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
            )}
        </div>
    );
}
