'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

export default function GatewayBookingsSection() {
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState<any>(null);
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [approvalAmount, setApprovalAmount] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchGatewayBookings();
    }, []);

    const fetchGatewayBookings = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('http://localhost:5000/api/bookings/all', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                // Filter only gateway_pending bookings
                const gatewayPending = data.data.filter((b: any) => b.status === 'gateway_pending');
                setBookings(gatewayPending);
            }
        } catch (error) {
            console.error('Error fetching gateway bookings:', error);
            toast.error('Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    const handleApproveClick = (booking: any) => {
        setSelectedBooking(booking);
        setApprovalAmount('');
        setShowApprovalModal(true);
    };

    const handleGatewayApprove = async () => {
        if (!selectedBooking || !approvalAmount.trim()) {
            toast.error('Please enter an amount');
            return;
        }

        const amount = parseFloat(approvalAmount);
        if (isNaN(amount) || amount <= 0) {
            toast.error('Please enter a valid amount greater than 0');
            return;
        }

        setActionLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`http://localhost:5000/api/bookings/${selectedBooking._id}/gateway-approve`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ amount })
            });
            const data = await response.json();
            if (data.success) {
                toast.success('Booking approved! Transaction created successfully.');
                setShowApprovalModal(false);
                setApprovalAmount('');
                setSelectedBooking(null);
                fetchGatewayBookings();
            } else {
                toast.error(data.message || 'Failed to approve booking');
            }
        } catch (error) {
            console.error('Error approving booking:', error);
            toast.error('Failed to approve booking');
        } finally {
            setActionLoading(false);
        }
    };

    const handleGatewayReject = async (bookingId: string) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}/gateway-reject`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                toast.success('Booking rejected');
                fetchGatewayBookings();
            } else {
                toast.error(data.message || 'Failed to reject booking');
            }
        } catch (error) {
            console.error('Error rejecting booking:', error);
            toast.error('Failed to reject booking');
        }
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-32 bg-gray-200 rounded"></div>
                    <div className="h-32 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 lg:p-8">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Gateway Approval</h2>
                <p className="text-gray-600 mt-1">Review and approve booking requests before they reach service providers</p>
            </div>

            {bookings.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                    <div className="text-gray-400 mb-2">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">No Pending Bookings</h3>
                    <p className="text-gray-600">All booking requests have been processed</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {bookings.map((booking) => (
                        <div key={booking._id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-start gap-4">
                                        {booking.service?.images?.[0] && (
                                            <img
                                                src={booking.service.images[0].url}
                                                alt={booking.serviceTitle}
                                                className="w-20 h-20 rounded-lg object-cover"
                                            />
                                        )}
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                                {booking.serviceTitle || booking.service?.title}
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                                                <div>
                                                    <span className="font-medium">Customer:</span> {booking.customerName}
                                                </div>
                                                <div>
                                                    <span className="font-medium">Email:</span> {booking.customerEmail}
                                                </div>
                                                <div>
                                                    <span className="font-medium">Phone:</span> {booking.customerPhone}
                                                </div>
                                                <div>
                                                    <span className="font-medium">Address:</span> {booking.customerAddress}
                                                </div>
                                            </div>
                                            {booking.notes && (
                                                <div className="mt-2 text-sm text-gray-600">
                                                    <span className="font-medium">Notes:</span> {booking.notes}
                                                </div>
                                            )}
                                            <div className="mt-2 text-xs text-gray-500">
                                                Submitted: {new Date(booking.createdAt).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleApproveClick(booking)}
                                        disabled={actionLoading}
                                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-medium disabled:opacity-50 flex items-center gap-2"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleGatewayReject(booking._id)}
                                        disabled={actionLoading}
                                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium disabled:opacity-50 flex items-center gap-2"
                                    >
                                        <XCircle className="w-4 h-4" />
                                        Reject
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Approval Modal */}
            {showApprovalModal && selectedBooking && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                    Approve Booking
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Enter transaction amount
                                </p>
                            </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-4">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                                {selectedBooking.serviceTitle || selectedBooking.service?.title}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                Customer: {selectedBooking.customerName}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                Phone: {selectedBooking.customerPhone}
                            </p>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Amount (NPR) <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-semibold">
                                    NPR
                                </span>
                                <input
                                    type="number"
                                    value={approvalAmount}
                                    onChange={(e) => setApprovalAmount(e.target.value)}
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01"
                                    className="w-full pl-14 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-lg font-semibold"
                                    autoFocus
                                />
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                This amount will be recorded in the transaction history
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowApprovalModal(false);
                                    setApprovalAmount('');
                                    setSelectedBooking(null);
                                }}
                                disabled={actionLoading}
                                className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleGatewayApprove}
                                disabled={actionLoading || !approvalAmount.trim()}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {actionLoading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Approving...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-5 h-5" />
                                        Approve
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
