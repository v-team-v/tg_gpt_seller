'use client';

import { useState } from 'react';
import { sendManualRevenue } from './actions';

interface ManualRevenueProps {
    orderId: number;
    initialIsSent: boolean;
    initialAmount: number | null;
    hasClientId: boolean;
}

export function ManualRevenueControl({ orderId, initialIsSent, initialAmount, hasClientId }: ManualRevenueProps) {
    const [isSent, setIsSent] = useState(initialIsSent);
    const [sentAmount, setSentAmount] = useState(initialAmount);
    const [isOpen, setIsOpen] = useState(false);
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);

    if (!hasClientId) {
        return <span className="text-gray-400 text-xs">No CID</span>;
    }

    if (isSent) {
        return (
            <span className="text-green-600 font-medium text-xs flex items-center gap-1">
                ✅ {sentAmount} ₽
            </span>
        );
    }

    const handleSend = async () => {
        if (!amount || isNaN(Number(amount))) return alert('Введите корректную сумму');

        setLoading(true);
        const res = await sendManualRevenue(orderId, Number(amount));
        setLoading(false);

        if (res.success) {
            setIsSent(true);
            setSentAmount(Number(amount));
            setIsOpen(false);
        } else {
            alert(res.error);
        }
    };

    if (isOpen) {
        return (
            <div className="flex items-center gap-1">
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="₽"
                    className="w-20 px-1 py-0.5 border rounded text-sm"
                    autoFocus
                />
                <button
                    onClick={handleSend}
                    disabled={loading}
                    className="bg-green-600 text-white px-2 py-0.5 rounded text-xs hover:bg-green-700 disabled:opacity-50"
                >
                    {loading ? '...' : 'OK'}
                </button>
                <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-500 hover:text-gray-700 px-1"
                >
                    ✕
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={() => setIsOpen(true)}
            className="text-blue-600 text-xs hover:underline bg-blue-50 px-2 py-1 rounded border border-blue-100"
        >
            Send Revenue
        </button>
    );
}
