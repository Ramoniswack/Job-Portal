'use client';

import React, { useState, useEffect } from 'react';
import { User, Calendar, Clock, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

interface ServiceBooking {
    _id: string;
    service: {
        _id: string;
        title: string;
        images: Array<{ url: string }>;
    };
    customer?: {
        _id: string;
        name: string;
        email: string;
    };
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    bookingDate: string;
    bookingTime: string;
    status: 'pending' | 'approved' | 'rejected' | 'completed';
    message?: string;
    createdAt: string;
}

interface MyService {
    _id: string;
    title: string;
    images: Array<{ url: string }>;
    status: string;
    bookings: ServiceBooking[];
}

interface MyServicesSectionProps {
    token: string;
}

export default function MyServicesSection({ token }: MyServicesSectionProps) {
    const [services, setServices] = useState<MyService[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedService, setSelectedService] = useState<string | null>(null);

    useEffect(() => {
        loadMyServices();
    }, []);

    const loadMyServices = async () => {
        setLoading(true);
        try {
            console.log('=== LOADING MY SERVICES ===');
            console.log('Token:', token ? 'exists' : 'missing');

            const response = await fetch('http://localhost:5000/api/services/my-services', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                if (response.status === 401) {
                    toast.error('Session Expired', {
                        description: 'Please log out and log back in.',
                        duration: 4000,
                    });
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Response data:', data);

            if (data.success) {
                console.log('Services loaded:', data.data.length);
                setServices(data.data);
            } else {
                console.error('Failed to load services:', data.message);
                toast.error('Failed to Load Services', {
                    description: data.message || 'Unable to load your services.',
                    duration: 4000,
                });
            }
        } catch (error) {
            console.error('Error loading services:', error);
            toast.error('Connection Error', {
                description: 'Failed to load services. Please check your connection and try again.',
                duration: 4000,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleBookingAction = async (bookingId: string, action: 'approve' | 'reject') => {
        try {
            const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}/${action}`, {
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
                loadMyServices();
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

    const handleDeleteService = async (serviceId: string) => {
        if (!confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/services/${serviceId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (data.success) {
                toast.success('Service Deleted!', {
                    description: 'The service has been deleted successfully.',
                    duration: 4000,
                });
                loadMyServices();
            } else {
                toast.error('Delete Failed', {
                    description: data.message || 'Failed to delete service.',
                    duration: 4000,
                });
            }
        } catch (error) {
            console.error('Error deleting service:', error);
            toast.error('Connection Error', {
                description: 'Failed to delete service. Please try again.',
                duration: 4000,
            });
        }
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            pending: 'bg-gray-100 text-gray-700 border border-gray-300',
            approved: 'bg-green-50 text-green-600 border border-green-200',
            rejected: 'bg-red-50 text-red-600 border border-red-200',
            completed: 'bg-blue-50 text-blue-600 border border-blue-200'
        };
        return styles[status as keyof typeof styles] || styles.pending;
    };

    const getPendingCount = (service: MyService) => {
        return service.bookings?.filter(b => b.status === 'pending').length || 0;
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
                <h2 className="text-2xl font-bold text-gray-900">My Services</h2>
                <p className="text-gray-500 mt-1">Manage your services and booking requests</p>
            </div>

            {services.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                    <span className="material-symbols-outlined text-gray-300 text-6xl">inventory_2</span>
                    <p className="mt-4 text-gray-600">You haven't created any services yet</p>
                    <p className="text-sm text-gray-500 mt-2">Go to "Add Service" to create your first service</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {services.map((service) => (
                        <div key={service._id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                            {/* Service Header */}
                            <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    {service.images[0]?.url && (
                                        <img
                                            src={service.images[0].url}
                                            alt={service.title}
                                            className="w-16 h-16 object-cover rounded-lg"
                                        />
                                    )}
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{service.title}</h3>
                                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(service.status)}`}>
                                            {service.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {getPendingCount(service) > 0 && (
                                        <span className="bg-gray-500 text-white text-xs px-2.5 py-1 rounded-full font-medium">
                                            {getPendingCount(service)} pending
                                        </span>
                                    )}
                                    <button
                                        onClick={() => window.location.href = `/dashboard?section=add-service&edit=${service._id}`}
                                        className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteService(service._id)}
                                        className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition-colors"
                                    >
                                        Delete
                                    </button>
                                    <button
                                        onClick={() => setSelectedService(selectedService === service._id ? null : service._id)}
                                        className="text-sm text-[#26cf71] hover:text-[#1fb35f] font-medium"
                                    >
                                        {selectedService === service._id ? 'Hide' : 'View'} Bookings ({service.bookings?.length || 0})
                                    </button>
                                </div>
                            </div>

                            {/* Bookings List */}
                            {selectedService === service._id && (
                                <div className="p-4">
                                    {!service.bookings || service.bookings.length === 0 ? (
                                        <p className="text-center text-gray-500 py-8">No bookings yet</p>
                                    ) : (
                                        <div className="space-y-4">
                                            {service.bookings.map((booking) => (
                                                <div key={booking._id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <User className="w-4 h-4 text-gray-500" />
                                                                <span className="font-medium text-gray-900">
                                                                    {booking.customer?.name || booking.customerName || 'Unknown Customer'}
                                                                </span>
                                                                <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(booking.status)}`}>
                                                                    {booking.status}
                                                                </span>
                                                            </div>
                                                            <div className="text-sm text-gray-600 space-y-1">
                                                                <div className="flex items-center gap-2">
                                                                    <Calendar className="w-4 h-4" />
                                                                    <span>{new Date(booking.bookingDate).toLocaleDateString()}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <Clock className="w-4 h-4" />
                                                                    <span>{booking.bookingTime}</span>
                                                                </div>
                                                                {booking.status === 'approved' && (
                                                                    <>
                                                                        {booking.customerEmail && (
                                                                            <div className="flex items-center gap-2 text-[#26cf71] font-medium">
                                                                                <span className="material-symbols-outlined text-[18px]">mail</span>
                                                                                <a href={`mailto:${booking.customerEmail}`} className="hover:underline">
                                                                                    {booking.customerEmail}
                                                                                </a>
                                                                            </div>
                                                                        )}
                                                                        {booking.customerPhone && (
                                                                            <div className="flex items-center gap-2 text-[#26cf71] font-medium">
                                                                                <span className="material-symbols-outlined text-[18px]">phone</span>
                                                                                <a href={`tel:${booking.customerPhone}`} className="hover:underline">
                                                                                    {booking.customerPhone}
                                                                                </a>
                                                                            </div>
                                                                        )}
                                                                    </>
                                                                )}
                                                                {booking.message && (
                                                                    <p className="mt-2 text-gray-700 italic">"{booking.message}"</p>
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
            )}
        </div>
    );
}
