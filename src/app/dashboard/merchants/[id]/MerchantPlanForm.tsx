"use client";

import { useState } from 'react';
import { updateMerchantPlan } from '@/app/actions/merchantActions';
import { toast } from 'sonner';

interface MerchantPlanFormProps {
    merchantId: string;
    currentPlan: 'FREE' | 'BASIC' | 'PREMIUM' | 'ENTERPRISE';
}

export default function MerchantPlanForm({ merchantId, currentPlan }: MerchantPlanFormProps) {
    const [plan, setPlan] = useState<'FREE' | 'BASIC' | 'PREMIUM' | 'ENTERPRISE'>(currentPlan || 'FREE');
    const [loading, setLoading] = useState(false);

    const handleUpdate = async () => {
        setLoading(true);
        const res = await updateMerchantPlan(merchantId, plan);
        if (res.success) {
            toast.success("Merchant plan updated successfully!");
        } else {
            toast.error(res.error || "Failed to update merchant plan.");
        }
        setLoading(false);
    };

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-slate-800/50 p-4 rounded-xl border border-slate-700">
            <div className="flex-1">
                <p className="text-sm font-semibold text-white">Modify Subscription Tier</p>
                <p className="text-xs text-slate-400">Override the merchant's SaaS plan manually.</p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                <select
                    value={plan}
                    onChange={(e) => setPlan(e.target.value as any)}
                    disabled={loading}
                    className="flex-1 sm:flex-none bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 outline-none transition-all disabled:opacity-50"
                >
                    <option value="FREE">Free Tier</option>
                    <option value="BASIC">Basic Tier</option>
                    <option value="PREMIUM">Premium Tier</option>
                    <option value="ENTERPRISE">Enterprise Tier</option>
                </select>
                <button
                    onClick={handleUpdate}
                    disabled={loading || plan === currentPlan}
                    className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white px-5 py-2 rounded-lg text-sm font-bold tracking-wide transition-all shadow-lg"
                >
                    {loading ? 'Updating...' : 'Apply Update'}
                </button>
            </div>
        </div>
    );
}
