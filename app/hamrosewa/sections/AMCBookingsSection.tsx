'use client';

import { useState, useEffect } from 'react';
import { Calendar, Mail, Phone, MapPin, FileText, RefreshCw, CheckCircle, Clock, XCircle, Trash2, Package } from 'lucide-react';
import { toast } from 'sonner';
import ConfirmDialog from '../../components/ConfirmDialog';

interface AMCBooking {
    _id: string;
    package: {
        _id: string;
        title: string;
        category: string;
    };
    packageTitle: string;
    tier: {
        name: string;
        price: number;
        duration: string;
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
    notes: string;
    status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
    createdAt: string;
}

interface AMCBookingsSectionProps {
    token: string;
}

export default function AMCBookingsSection({ token }: AMCBookingsSectionProps) {
    const [bookings, setBookings] = useState<AMCBooking[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; bookingId: string | null }>({
        isOpen: false,
        bookingId: null
    });

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/amc-bookings/all', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (data.success) {
                setBookings(data.data);
            } else {
                toast.error('Failed to Load Bookings', {
                    description: data.message || 'Unable to load AMC bookings.',
                    duration: 4000,
                });
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
            toast.error('Connection Error', {
                description: 'Failed to load bookings. Please try again.',
                duration: 4000,
            });
        } finally {
            setLoading(false);
        }
    };

    const updateBookingStatus = async (bookingId: string, newStatus: string) => {
        try {
            const response = await fetch(`http://localhost:5000/api/amc-bookings/${bookingId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Status Updated', {
                    description: `Booking status changed to ${newStatus}.`,
                    duration: 4000,
                });
                fetchBookings();
            } else {
                toast.error('Update Failed', {
                    description: data.message || 'Failed to update status.',
                    duration: 4000,
                });
            }
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Connection Error', {
                description: 'Failed to update status. Please try again.',
                duration: 4000,
            });
        }
    };

    const acceptBooking = async (bookingId: string) => {
        await updateBookingStatus(bookingId, 'approved');
    };

    const rejectBooking = async (bookingId: string) => {
        await updateBookingStatus(bookingId, 'rejected');
    };

    const deleteBooking = async (bookingId: string) => {
        try {
            const response = await fetch(`http://localhost:5000/api/amc-bookings/${bookingId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Booking Deleted', {
                    description: 'The booking has been deleted successfully.',
                    duration: 4000,
                });
                fetchBookings();
            } else {
                toast.error('Delete Failed', {
                    description: data.message || 'Failed to delete booking.',
                    duration: 4000,
                });
            }
        } catch (error) {
            console.error('Error deleting booking:', error);
            toast.error('Connection Error', {
                description: 'Failed to delete booking. Please try again.',
                duration: 4000,
            });
        } finally {
            setDeleteConfirm({ isOpen: false, bookingId: null });
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'approved':
                return 'bg-green-100 text-green-800 border-green-300';
            case 'rejected':
                return 'bg-red-100 text-red-800 border-red-300';
            case 'completed':
                return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'cancelled':
                return 'bg-gray-100 text-gray-800 border-gray-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending':
                return <Clock className="w-4 h-4" />;
            case 'approved':
                return <CheckCircle className="w-4 h-4" />;
            case 'rejected':
                return <XCircle className="w-4 h-4" />;
            case 'completed':
                return <CheckCircle className="w-4 h-4" />;
            case 'cancelled':
                return <XCircle className="w-4 h-4" />;
            default:
                return <Clock className="w-4 h-4" />;
        }
    };

    const filteredBookings = filterStatus === 'all'
        ? bookings
        : bookings.filter(b => b.status === filterStatus);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B35]"></div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">AMC Package Bookings</h2>
                    <p className="text-gray-600 mt-1">Manage AMC package booking requests</p>
                </div>
                <button
                    onClick={fetchBookings}
                    className="flex items-center gap-2 px-4 py-2 bg-[#FF6B35] hover:bg-[#FF5722] text-white rounded-lg transition-colors"
                >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {['all', 'pending', 'approved', 'rejected', 'completed', 'cancelled'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${filterStatus === status
                            ? 'bg-gray-800 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                        <span className="ml-2 text-sm">
                            ({status === 'all' ? bookings.length : bookings.filter(b => b.status === status).length})
                        </span>
                    </button>
                ))}
            </div>

            {/* Bookings List */}
            {filteredBookings.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No AMC bookings found</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredBookings.map((booking) => (
                        <div
                            key={booking._id}
                            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                        >
                            <div className="flex flex-col lg:flex-row gap-6">
                                {/* Package Icon */}
                                <div className="flex-shrink-0">
                                    <div className="w-full lg:w-32 h-32 bg-gradient-to-br from-[#FF6B35] to-[#FF5722] rounded-lg flex items-center justify-center">
                                        <Package className="w-16 h-16 text-white" />
                                    </div>
                                </div>

                                {/* Booking Details */}
                                <div className="flex-1">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">{booking.packageTitle}</h3>
                                            <div className="flex items-center gap-4 mt-1">
                                                <p className="text-sm text-gray-500">
                                                    Booked on {new Date(booking.createdAt).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                            {booking.tier && (
                                                <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-[#FFF5F0] border border-[#FF6B35] rounded-full">
                                                    <span className="text-sm font-semibold text-[#FF6B35]">
                                                        {booking.tier.name} - NPR {booking.tier.price} / {booking.tier.duration}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(booking.status)}`}>
                                            {getStatusIcon(booking.status)}
                                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-700">
                                            <span className="material-symbols-outlined text-[18px] text-[#FF6B35]">person</span>
                                            <span className="font-medium">{booking.customerName}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-700">
                                            <Mail className="w-4 h-4 text-[#FF6B35]" />
                                            <span>{booking.customerEmail}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-700">
                                            <Phone className="w-4 h-4 text-[#FF6B35]" />
                                            <span>{booking.customerPhone}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-700">
                                            <MapPin className="w-4 h-4 text-[#FF6B35]" />
                                            <span>{booking.customerAddress}</span>
                                        </div>
                                    </div>

                                    {booking.notes && (
                                        <div className="flex items-start gap-2 text-sm text-gray-700 mb-4 p-3 bg-gray-50 rounded-lg">
                                            <FileText className="w-4 h-4 text-[#FF6B35] mt-0.5" />
                                            <div>
                                                <span className="font-medium">Notes:</span>
                                                <p className="mt-1">{booking.notes}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex flex-wrap gap-2">
                                        {booking.status === 'pending' ? (
                                            <>
                                                <button
                                                    onClick={() => acceptBooking(booking._id)}
                                                    className="flex items-center gap-1 px-4 py-2 text-sm bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-medium"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                    Accept
                                                </button>
                                                <button
                                                    onClick={() => rejectBooking(booking._id)}
                                                    className="flex items-center gap-1 px-4 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                    Reject
                                                </button>
                                            </>
                                        ) : (
                                            <select
                                                value={booking.status}
                                                onChange={(e) => updateBookingStatus(booking._id, e.target.value)}
                                                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent outline-none"
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="approved">Approved</option>
                                                <option value="rejected">Rejected</option>
                                                <option value="completed">Completed</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                        )}

                                        <button
                                            onClick={() => setDeleteConfirm({ isOpen: true, bookingId: booking._id })}
                                            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={deleteConfirm.isOpen}
                onClose={() => setDeleteConfirm({ isOpen: false, bookingId: null })}
                onConfirm={() => deleteBooking(deleteConfirm.bookingId!)}
                title="Delete AMC Booking"
                message="Are you sure you want to delete this AMC booking? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                type="danger"
            />
        </div>
    );
}
