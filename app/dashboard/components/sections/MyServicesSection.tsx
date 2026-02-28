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
    approvalStatus?: 'pending' | 'approved' | 'rejected';
    rejectionReason?: string;
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

    const handleBookingAction = async (bookingId: string, action: 'approve' | 'reject' | 'cancel-approval' | 'complete') => {
        try {
            let endpoint = '';
            let successMessage = '';

            if (action === 'cancel-approval') {
                // Reset to pending status using the new endpoint
                endpoint = `http://localhost:5000/api/bookings/${bookingId}/reset-to-pending`;
                const response = await fetch(endpoint, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                const data = await response.json();
                if (data.success) {
                    toast.success('Approval Cancelled', {
                        description: 'The booking has been reset to pending status.',
                        duration: 4000,
                    });
                    loadMyServices();
                } else {
                    toast.error('Action Failed', {
                        description: data.message || 'Failed to cancel approval.',
                        duration: 4000,
                    });
                }
                return;
            }

            if (action === 'complete') {
                endpoint = `http://localhost:5000/api/bookings/${bookingId}/complete`;
                const response = await fetch(endpoint, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                const data = await response.json();
                if (data.success) {
                    toast.success('Booking Completed!', {
                        description: 'The booking has been marked as completed.',
                        duration: 4000,
                    });
                    loadMyServices();
                } else {
                    toast.error('Action Failed', {
                        description: data.message || 'Failed to complete booking.',
                        duration: 4000,
                    });
                }
                return;
            }

            endpoint = `http://localhost:5000/api/bookings/${bookingId}/${action}`;
            const response = await fetch(endpoint, {
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
            pending: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600',
            approved: 'bg-green-50 text-green-600 border border-green-200',
            rejected: 'bg-red-50 text-red-600 border border-red-200',
            completed: 'bg-blue-50 text-blue-600 border border-blue-200'
        };
        return styles[status as keyof typeof styles] || styles.pending;
    };

    const getApprovalBadge = (approvalStatus?: string) => {
        if (!approvalStatus) {
            return 'bg-green-50 text-green-600 border border-green-200'; // Legacy data - assume approved
        }
        const styles = {
            pending: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
            approved: 'bg-green-50 text-green-600 border border-green-200',
            rejected: 'bg-red-50 text-red-600 border border-red-200'
        };
        return styles[approvalStatus as keyof typeof styles] || styles.pending;
    };

    const getApprovalText = (approvalStatus?: string) => {
        if (!approvalStatus) {
            return 'Active'; // Legacy data
        }
        const texts = {
            pending: 'Inactive',
            approved: 'Active',
            rejected: 'Rejected'
        };
        return texts[approvalStatus as keyof typeof texts] || 'Inactive';
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
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Services</h2>
                <p className="text-gray-500 dark:text-gray-500 mt-1">Manage your services and booking requests</p>
            </div>

            {services.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
                    <span className="material-symbols-outlined text-gray-300 text-6xl">inventory_2</span>
                    <p className="mt-4 text-gray-600 dark:text-gray-400 dark:text-gray-500">You haven't created any services yet</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Go to "Add Service" to create your first service</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {services.map((service) => (
                        <div key={service._id} className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                            {/* Service Header */}
                            <div className="p-4 border-b bg-gray-50 dark:bg-gray-900 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    {service.images[0]?.url && (
                                        <img
                                            src={service.images[0].url}
                                            alt={service.title}
                                            className="w-16 h-16 object-cover rounded-lg"
                                        />
                                    )}
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">{service.title}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getApprovalBadge(service.approvalStatus)}`}>
                                                {getApprovalText(service.approvalStatus)}
                                            </span>
                                        </div>
                                        {service.approvalStatus === 'rejected' && service.rejectionReason && (
                                            <p className="text-xs text-red-600 mt-1">
                                                Reason: {service.rejectionReason}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {getPendingCount(service) > 0 && (
                                        <span className="bg-gray-50 dark:bg-gray-900 dark:bg-gray-9000 text-white text-xs px-2.5 py-1 rounded-full font-medium">
                                            {getPendingCount(service)} pending
                                        </span>
                                    )}
                                    <button
                                        onClick={() => setSelectedService(selectedService === service._id ? null : service._id)}
                                        className="px-4 py-2 bg-[#FF6B35] hover:bg-[#FF5722] text-white text-sm rounded-lg transition-colors font-medium"
                                    >
                                        {selectedService === service._id ? 'Hide' : 'View'} Bookings ({service.bookings?.length || 0})
                                    </button>
                                </div>
                            </div>

                            {/* Bookings List */}
                            {selectedService === service._id && (
                                <div className="p-4">
                                    {!service.bookings || service.bookings.length === 0 ? (
                                        <p className="text-center text-gray-500 dark:text-gray-500 py-8">No bookings yet</p>
                                    ) : (
                                        <div className="space-y-4">
                                            {service.bookings.map((booking) => (
                                                <div key={booking._id} className="border rounded-lg p-4 hover:bg-gray-50 dark:bg-gray-900 transition">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <User className="w-4 h-4 text-gray-500 dark:text-gray-500" />
                                                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                                                    {booking.customer?.name || booking.customerName || 'Unknown Customer'}
                                                                </span>
                                                                <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(booking.status)}`}>
                                                                    {booking.status}
                                                                </span>
                                                            </div>
                                                            <div className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500 space-y-1">
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
                                                                    <p className="mt-2 text-gray-700 dark:text-gray-300 italic">"{booking.message}"</p>
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
                                                            {booking.status === 'approved' && (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleBookingAction(booking._id, 'cancel-approval')}
                                                                        className="flex items-center gap-1 px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition text-sm"
                                                                    >
                                                                        <XCircle className="w-4 h-4" />
                                                                        Cancel Approval
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleBookingAction(booking._id, 'complete')}
                                                                        className="flex items-center gap-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm"
                                                                    >
                                                                        <CheckCircle className="w-4 h-4" />
                                                                        Mark as Completed
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
