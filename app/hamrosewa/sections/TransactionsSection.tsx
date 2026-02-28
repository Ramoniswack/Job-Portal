'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { DollarSign, TrendingUp, Package, Wrench, Calendar, User, Filter, Download, RefreshCw } from 'lucide-react';

interface Transaction {
    _id: string;
    amount: number;
    userName: string;
    userId: string | {
        _id: string;
        name: string;
        email: string;
    };
    itemType: 'service' | 'package' | 'booking';
    itemTitle: string;
    itemId: string;
    status: 'pending' | 'completed' | 'failed';
    paymentMethod: string;
    notes?: string;
    approvedBy?: string | {
        _id: string;
        name: string;
        email: string;
    };
    createdAt: string;
    updatedAt: string;
}

interface TransactionsSectionProps {
    token: string;
}

export default function TransactionsSection({ token }: TransactionsSectionProps) {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [totalAmount, setTotalAmount] = useState(0);

    useEffect(() => {
        fetchTransactions();
    }, [filterType, filterStatus]);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            let url = 'http://localhost:5000/api/transactions';
            const params = new URLSearchParams();

            if (filterType !== 'all') {
                params.append('itemType', filterType);
            }

            if (filterStatus !== 'all') {
                params.append('status', filterStatus);
            }

            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            console.log('Fetching transactions from:', url);

            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            console.log('Response status:', response.status);

            const data = await response.json();
            console.log('Transactions data:', data);

            if (data.success) {
                setTransactions(data.data || []);
                setTotalAmount(data.totalAmount || 0);
            } else {
                console.error('API returned success: false', data);
                toast.error(data.message || 'Failed to load transactions');
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
            toast.error('Failed to load transactions');
        } finally {
            setLoading(false);
        }
    };

    const getItemTypeIcon = (type: string) => {
        switch (type) {
            case 'service':
                return <Wrench className="w-4 h-4" />;
            case 'package':
                return <Package className="w-4 h-4" />;
            case 'booking':
                return <Calendar className="w-4 h-4" />;
            default:
                return <DollarSign className="w-4 h-4" />;
        }
    };

    const getItemTypeBadge = (type: string) => {
        const colors = {
            service: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            package: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
            booking: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
        };

        return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-700';
    };

    const getStatusBadge = (status: string) => {
        const colors = {
            completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
            pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
            failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        };

        return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700';
    };

    const exportToCSV = () => {
        if (transactions.length === 0) {
            toast.error('No transactions to export');
            return;
        }

        const headers = ['Date', 'User', 'Type', 'Item', 'Amount', 'Status', 'Approved By'];
        const rows = transactions.map(t => [
            new Date(t.createdAt).toLocaleDateString(),
            t.userName,
            t.itemType,
            t.itemTitle,
            t.amount,
            t.status,
            typeof t.approvedBy === 'object' && t.approvedBy?.name ? t.approvedBy.name : 'System'
        ]);

        const csv = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);

        toast.success('Transactions exported successfully');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B35]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Transactions</h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        View and manage all payment transactions
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => fetchTransactions()}
                        disabled={loading}
                        className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                    <button
                        onClick={exportToCSV}
                        disabled={transactions.length === 0}
                        className="flex items-center gap-2 bg-[#FF6B35] hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Download className="w-5 h-5" />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</span>
                        <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        NPR {totalAmount.toLocaleString()}
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Transactions</span>
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {transactions.length}
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Services</span>
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <Wrench className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {transactions.filter(t => t.itemType === 'service').length}
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Packages</span>
                        <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                            <Package className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {transactions.filter(t => t.itemType === 'package').length}
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Bookings</span>
                        <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {transactions.filter(t => t.itemType === 'booking').length}
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filters:</span>
                    </div>

                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                    >
                        <option value="all">All Types</option>
                        <option value="service">Services</option>
                        <option value="package">Packages</option>
                        <option value="booking">Bookings</option>
                    </select>

                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                    >
                        <option value="all">All Status</option>
                        <option value="completed">Completed</option>
                        <option value="pending">Pending</option>
                        <option value="failed">Failed</option>
                    </select>

                    {(filterType !== 'all' || filterStatus !== 'all') && (
                        <button
                            onClick={() => {
                                setFilterType('all');
                                setFilterStatus('all');
                            }}
                            className="text-sm text-[#FF6B35] hover:text-green-600 font-medium"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                {transactions.length === 0 ? (
                    <div className="p-12 text-center">
                        <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            No Transactions Found
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            {filterType !== 'all' || filterStatus !== 'all'
                                ? 'Try adjusting your filters'
                                : 'Transactions will appear here once approvals are made'}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                        User
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                        Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                        Item
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                        Approved By
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {transactions.map((transaction) => (
                                    <tr key={transaction._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-white">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                {new Date(transaction.createdAt).toLocaleDateString()}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                {new Date(transaction.createdAt).toLocaleTimeString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                                    <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {transaction.userName}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        {typeof transaction.userId === 'object' && transaction.userId?.email
                                                            ? transaction.userId.email
                                                            : 'N/A'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${getItemTypeBadge(transaction.itemType)}`}>
                                                {getItemTypeIcon(transaction.itemType)}
                                                {transaction.itemType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white max-w-xs truncate">
                                                {transaction.itemTitle}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-green-600 dark:text-green-400">
                                                NPR {transaction.amount.toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusBadge(transaction.status)}`}>
                                                {transaction.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900 dark:text-white">
                                                {typeof transaction.approvedBy === 'object' && transaction.approvedBy?.name
                                                    ? transaction.approvedBy.name
                                                    : 'System'}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
