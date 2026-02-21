'use client';

import React, { useState, useTransition } from 'react';
import { processRefund } from '@/app/actions/ledgerActions';
import { toast } from 'sonner';
import { AlertCircle, Loader2, ArrowLeftRight } from 'lucide-react';

interface RefundButtonProps {
    transactionId: string;
    status: string;
    amount: number;
    adminEmail: string;
}

export default function RefundButton({ transactionId, status, amount, adminEmail }: RefundButtonProps) {
    const [isPending, startTransition] = useTransition();
    const [showModal, setShowModal] = useState(false);
    const [confirmationText, setConfirmationText] = useState('');

    // Only COMPLETED payments can be reversed.
    if (status !== 'COMPLETED') {
        return null;
    }

    const handleConfirm = () => {
        if (confirmationText !== 'REFUND') {
            toast.error('You must type EXACTLY "REFUND" to proceed.');
            return;
        }

        setShowModal(false);

        startTransition(async () => {
            const result = await processRefund(transactionId, adminEmail);
            if (result.success) {
                toast.success('Funds have been atomized and returned to the Consumer.', {
                    description: `Transaction ${transactionId.slice(0, 8)} marked as REFUNDED.`
                });
            } else {
                toast.error('Refund Aborted', {
                    description: result.error || 'The atomic transaction failed. Check ledger logs.'
                });
            }
        });
    };

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                disabled={isPending}
                className="inline-flex items-center justify-center px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 hover:text-rose-400 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors border border-rose-500/20 hover:border-rose-500/40"
            >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Force Refund'}
            </button>

            {/* Titanium UX Strict Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
                    <div className="bg-slate-900 border border-red-500/30 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="bg-red-500/10 border-b border-red-500/20 p-6 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4 border border-red-500/30">
                                <AlertCircle className="w-8 h-8 text-red-500" />
                            </div>
                            <h2 className="text-xl font-black text-white">REVERSE TRANSACTION</h2>
                            <p className="text-red-400 text-sm mt-1 font-mono tracking-widest uppercase">Tier-1 Override Protocol</p>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-6">
                            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                                <p className="text-sm text-slate-300">
                                    You are about to forcefully execute a ledger reversal for <strong className="text-white font-mono">{transactionId}</strong>.
                                </p>
                                <div className="flex items-center gap-3 text-sm font-bold text-white bg-slate-900 border border-slate-700 p-3 rounded-lg justify-center shadow-inner">
                                    <span className="text-red-400">Debit Merchant</span>
                                    <ArrowLeftRight className="w-4 h-4 text-slate-500" />
                                    <span className="text-emerald-400">Credit Consumer</span>
                                </div>
                                <p className="text-xs text-slate-500 text-center uppercase tracking-wider font-bold">
                                    Total Value: <span className="text-white">${amount.toFixed(2)}</span>
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase">Type "REFUND" to confirm</label>
                                <input
                                    type="text"
                                    value={confirmationText}
                                    onChange={(e) => setConfirmationText(e.target.value)}
                                    placeholder="REFUND"
                                    autoComplete="off"
                                    className="w-full bg-slate-950 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 font-mono font-bold placeholder-red-500/20 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all text-center tracking-widest"
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 bg-slate-950/50 border-t border-slate-800 flex gap-3">
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setConfirmationText('');
                                }}
                                className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-colors"
                            >
                                Abort
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={confirmationText !== 'REFUND'}
                                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-500 disabled:bg-red-900/50 disabled:text-red-300/50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors shadow-lg shadow-red-500/20"
                            >
                                Execute Reversal
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
