import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { adminDb, adminAuth } from '@/lib/firebase/firebaseAdmin';
import { cookies } from 'next/headers';
import { AdminRole } from '@/types/auth';
import { formatCurrency, truncateId } from '@/utils/formatters';
import RefundButton from '@/components/ledger/RefundButton';
import { Receipt, Search, ArrowUpRight, ArrowDownRight, RefreshCcw } from 'lucide-react';
import { format } from 'date-fns';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default async function LedgerPage() {
    let transactions: any[] = [];

    try {
        // Fetch up to 100 latest transactions across the entire ecosystem
        const txSnapshot = await adminDb.collection('transactions')
            .orderBy('timestamp', 'desc')
            .limit(100)
            .get();

        transactions = txSnapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id
        }));
    } catch (error) {
        console.error("Error fetching ledger:", error);
    }

    // Retrieve Admin Identity for accountability logging in the Server Action
    let adminEmail = 'unknown@admin.com';
    try {
        const cookieStore = await cookies();
        const session = cookieStore.get('session')?.value;
        if (session) {
            const decodedClaims = await adminAuth.verifySessionCookie(session, true);
            adminEmail = decodedClaims.email || 'unknown@admin.com';
        }
    } catch (e) {
        console.log("Could not parse admin session for ledger.", e);
    }

    return (
        <ProtectedRoute allowedRoles={[AdminRole.ROOT, AdminRole.SUPER_ADMIN]}>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tight">Global Ledger</h1>
                        <p className="text-slate-400 mt-1">Omniscient view of all TrainApp transactions crossing the database.</p>
                    </div>

                    {/* Placeholder Filters */}
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-64">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-slate-500" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search Ledger ID..."
                                className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                            />
                        </div>
                        <button className="flex items-center justify-center p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                            <RefreshCcw className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Global Ledger Data Table */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[1000px]">
                            <thead>
                                <tr className="bg-slate-950/80 border-b border-slate-800 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                                    <th className="p-4 pl-6">TX ID</th>
                                    <th className="p-4">Type</th>
                                    <th className="p-4">Amount</th>
                                    <th className="p-4">Participants (Sender -&gt; Receiver)</th>
                                    <th className="p-4">Date/Time</th>
                                    <th className="p-4 pr-6 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-12 text-center text-slate-500">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mb-3">
                                                    <Receipt className="w-6 h-6 text-slate-400" />
                                                </div>
                                                <p className="font-medium text-white">Global Feed Empty</p>
                                                <p className="text-sm mt-1">Cross-domain transactions will stream here.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.map((tx) => (
                                        <tr key={tx.id} className="hover:bg-slate-800/20 transition-colors font-mono text-sm">
                                            <td className="p-4 pl-6">
                                                <span className="text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer truncate w-24 block" title={tx.id}>
                                                    {truncateId(tx.id, 6, 4)}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    {tx.type === 'DEPOSIT' ? <ArrowDownRight className="w-4 h-4 text-emerald-400" /> :
                                                        tx.type === 'PAYMENT' ? <ArrowUpRight className="w-4 h-4 text-indigo-400" /> :
                                                            <ArrowUpRight className="w-4 h-4 text-slate-500" />}
                                                    <span className={`font-bold ${tx.type === 'DEPOSIT' ? 'text-emerald-400' :
                                                        tx.type === 'PAYMENT' ? 'text-indigo-400' :
                                                            'text-slate-400'
                                                        }`}>
                                                        {tx.type || 'UNKNOWN'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4 font-bold text-white text-[15px]">
                                                {formatCurrency(tx.amount || 0)}
                                            </td>
                                            <td className="p-4 text-slate-400 text-xs">
                                                <div className="flex items-center gap-2">
                                                    <span className="truncate w-24 bg-slate-950 px-2 py-1 rounded border border-slate-800" title={tx.senderId || 'Network'}>
                                                        {truncateId(tx.senderId || 'Net_Auth', 4, 4)}
                                                    </span>
                                                    <span className="text-slate-600">→</span>
                                                    <span className="truncate w-24 bg-slate-950 px-2 py-1 rounded border border-slate-800" title={tx.merchantId || tx.receiverId || 'Network'}>
                                                        {truncateId(tx.merchantId || tx.receiverId || 'System', 4, 4)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-slate-400 text-xs whitespace-nowrap">
                                                {(() => {
                                                    if (!tx.timestamp) return 'Time Error';
                                                    try {
                                                        const date = typeof tx.timestamp?.toDate === 'function'
                                                            ? tx.timestamp.toDate()
                                                            : new Date(tx.timestamp);
                                                        if (isNaN(date.getTime())) return 'Invalid';
                                                        return format(date, 'MMM d, yyyy HH:mm:ss');
                                                    } catch (e) {
                                                        return 'Invalid';
                                                    }
                                                })()}
                                            </td>
                                            <td className="p-4 pr-6 text-right flex items-center justify-end gap-2">
                                                <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold tracking-widest uppercase border ${tx.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                                                    tx.status === 'REFUNDED' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' :
                                                        tx.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                                                            'bg-rose-500/10 text-rose-400 border-rose-500/30'
                                                    }`}>
                                                    {tx.status || 'UNKNOWN'}
                                                </span>
                                                <RefundButton
                                                    transactionId={tx.id}
                                                    status={tx.status}
                                                    amount={tx.amount || 0}
                                                    adminEmail={adminEmail}
                                                />
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
