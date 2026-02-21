import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { adminDb } from '@/lib/firebase/firebaseAdmin';
import { AdminRole } from '@/types/auth';
import { formatCurrency, truncateId } from '@/utils/formatters';
import { Search, Store, Building2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 120; // Revalidate every 2 minutes to heavily cache initial load

export default async function MerchantsPage() {
    let merchants: any[] = [];

    try {
        // Fetch up to 50 latest merchants from TrainCredit (B2B)
        const merchantsSnapshot = await adminDb.collection('merchants')
            .limit(50)
            .get();

        merchants = merchantsSnapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id
        }));
    } catch (error) {
        console.error("Error fetching merchants:", error);
    }

    return (
        <ProtectedRoute allowedRoles={[AdminRole.ROOT, AdminRole.SUPER_ADMIN, AdminRole.TRAINCREDIT_MANAGER]}>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tight">Merchants</h1>
                        <p className="text-slate-400 mt-1">Manage B2B integrations, API keys, and enterprise pipelines.</p>
                    </div>

                    {/* Placeholder Search Bar */}
                    <div className="relative w-full sm:w-auto">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-slate-500" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by ID or Name..."
                            className="w-full sm:w-64 pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                        />
                    </div>
                </div>

                {/* Merchants Data Table */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="bg-slate-950/50 border-b border-slate-800 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                                    <th className="p-4 pl-6">Business</th>
                                    <th className="p-4">Contact Email</th>
                                    <th className="p-4">Current Plan</th>
                                    <th className="p-4">Acquired Revenue</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 pr-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {merchants.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-12 text-center text-slate-500">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mb-3">
                                                    <Store className="w-6 h-6 text-slate-400" />
                                                </div>
                                                <p className="font-medium text-white">No Merchants Found</p>
                                                <p className="text-sm mt-1">B2B accounts from TrainCredit Core will populate here.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    merchants.map((merchant) => (
                                        <tr key={merchant.id} className="hover:bg-slate-800/20 transition-colors group">
                                            <td className="p-4 pl-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
                                                        <Building2 className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-white">{merchant.businessName || 'Unnamed Business'}</p>
                                                        <p className="text-xs text-slate-500 font-mono" title={merchant.id}>
                                                            {truncateId(merchant.id, 8, 4)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-sm text-slate-300">
                                                {merchant.email || 'N/A'}
                                            </td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold ${merchant.plan === 'premium'
                                                    ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                                                    }`}>
                                                    {merchant.plan ? merchant.plan.toUpperCase() : 'FREE'}
                                                </span>
                                            </td>
                                            <td className="p-4 font-mono font-medium text-white">
                                                {formatCurrency(merchant.balance || 0)}
                                            </td>
                                            <td className="p-4">
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    ACTIVE
                                                </span>
                                            </td>
                                            <td className="p-4 pr-6 text-right relative">
                                                <Link
                                                    href={`/dashboard/merchants/${merchant.id}`}
                                                    className="inline-flex items-center justify-center px-3 py-1.5 bg-slate-800 hover:bg-indigo-600 text-white text-xs font-semibold rounded-lg transition-colors border border-slate-700 hover:border-indigo-500"
                                                >
                                                    Manage
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
