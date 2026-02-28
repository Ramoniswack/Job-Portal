'use client';

import { useState } from 'react';

interface ApprovalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (amount: number) => void;
    title: string;
    itemTitle: string;
    userName: string;
}

export default function ApprovalModal({ isOpen, onClose, onConfirm, title, itemTitle, userName }: ApprovalModalProps) {
    const [amount, setAmount] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const amountValue = parseFloat(amount);
        if (amountValue > 0) {
            onConfirm(amountValue);
            setAmount('');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{title}</h3>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Item
                        </label>
                        <p className="text-gray-900 dark:text-gray-100 font-semibold">{itemTitle}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Posted by
                        </label>
                        <p className="text-gray-900 dark:text-gray-100">{userName}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Transaction Amount (NPR) *
                        </label>
                        <input
                            type="number"
                            required
                            min="0"
                            step="0.01"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            placeholder="Enter amount"
                            autoFocus
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            This amount will be recorded in the transaction history
                        </p>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                        >
                            Approve & Record
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setAmount('');
                                onClose();
                            }}
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-semibold"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
