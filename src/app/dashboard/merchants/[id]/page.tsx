import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { adminDb, adminAuth } from '@/lib/firebase/firebaseAdmin';
import { AdminRole } from '@/types/auth';
import { formatCurrency, truncateId } from '@/utils/formatters';
import { ShieldAlert, ShieldCheck, ArrowLeft, Building2, Activity, ArrowDownRight, Lock, Mail, Phone } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import MerchantPlanForm from './MerchantPlanForm';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default async function MerchantDetailPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const merchantId = params.id;

    let merchant: any = null;
    let transactions: any[] = [];
    let authRecord: any = null;

    try {
        const fetchAuth = async () => {
            try { return await adminAuth.getUser(merchantId); }
            catch (e) { return null; }
        };

        const [merchantDoc, authSnap, txSnap] = await Promise.all([
            adminDb.collection('merchants').doc(merchantId).get().catch(e => { console.error("Merchant fetch failed", e); return null; }),
            fetchAuth(),
            adminDb.collection('transactions').where('receiverId', '==', merchantId).orderBy('timestamp', 'desc').limit(20).get().catch(e => { console.error("Merchant TX fetch failed", e); return { docs: [] }; })
        ]);

        authRecord = authSnap;

        if (merchantDoc && merchantDoc.exists) {
            merchant = { id: merchantDoc.id, ...merchantDoc.data() };
        }

        transactions = txSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    } catch (error) {
        console.error("Critical Error fetching merchant data:", error);
    }

    if (!merchant) {
        return (
            <ProtectedRoute allowedRoles={[AdminRole.ROOT, AdminRole.SUPER_ADMIN, AdminRole.WALLET_MANAGER]}>
                <div className="flex flex-col items-center justify-center p-20 text-slate-400">
                    <ShieldAlert className="w-12 h-12 mb-4 text-rose-500" />
                    <h2 className="text-xl font-bold text-white">Merchant Not Found</h2>
                    <p className="mt-2 text-sm">The requested ID ({merchantId}) does not exist.</p>
                    <Link href="/dashboard/merchants" className="mt-6 text-indigo-400 hover:text-indigo-300 flex items-center gap-2 text-sm font-semibold">
                        <ArrowLeft className="w-4 h-4" /> Back to Directory
                    </Link>
                </div>
            </ProtectedRoute>
        );
    }

    // Colors
    const planColors: Record<string, { bg: string, text: string, border: string }> = {
        FREE: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20' },
        BASIC: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
        PREMIUM: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20' },
        ENTERPRISE: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
    };

    const currentPlan = (merchant.currentPlan || 'FREE').toUpperCase();
    const planStyle = planColors[currentPlan] || planColors.FREE;
    const isOrphan = !authRecord;

    // Check if missing keys
    const publicKey = merchant.publicKey || 'Missing_Public_Key';
    const secretKey = merchant.secretKey || 'Missing_Secret_Key';

    return (
        <ProtectedRoute allowedRoles={[AdminRole.ROOT, AdminRole.SUPER_ADMIN, AdminRole.WALLET_MANAGER]}>
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header Nav */}
                <Link href="/dashboard/merchants" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm font-semibold mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Merchants
                </Link>

                {/* Header Profile Section */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-8 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[80px] rounded-full pointer-events-none" />

                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 relative z-10">
                        <div className="flex items-center gap-6">
                            <div className="w-24 h-24 bg-slate-800 border-2 border-slate-700 rounded-3xl flex items-center justify-center shadow-inner">
                                <Building2 className="w-12 h-12 text-slate-400" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-white tracking-tight mb-2 flex items-center gap-3">
                                    {merchant.companyName || merchant.businessName || 'Unnamed Business'}
                                </h1>
                                <div className="flex items-center gap-4 text-sm text-slate-400 font-medium">
                                    <span className="flex items-center gap-1.5"><Mail className="w-4 h-4 text-slate-500" /> {merchant.email || 'N/A'}</span>
                                    {merchant.phone && (
                                        <span className="flex items-center gap-1.5"><Phone className="w-4 h-4 text-slate-500" /> {merchant.phone}</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Status Badges */}
                        <div className="flex flex-col items-end gap-3">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase border ${planStyle.bg} ${planStyle.text} ${planStyle.border}`}>
                                {currentPlan} TIER
                            </span>

                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase border ${isOrphan
                                ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                }`}>
                                {isOrphan ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                                {isOrphan ? 'AUTH ORPHAN' : 'ACTIVE'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Financials & Admin Actions */}
                    <div className="lg:col-span-1 space-y-6">

                        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 relative overflow-hidden group">
                            <div className="absolute -right-20 -top-20 w-40 h-40 bg-emerald-500/10 blur-[50px] rounded-full group-hover:bg-emerald-500/20 transition-all duration-500 pointer-events-none" />
                            <div className="relative z-10">
                                <p className="text-slate-400 text-sm font-medium mb-1">Total Revenue Earned</p>
                                <p className="text-4xl font-black text-white tracking-tight font-mono">{formatCurrency(merchant.balance || 0)}</p>
                            </div>
                        </div>

                        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 relative overflow-hidden">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                                <Lock className="w-5 h-5 text-slate-400" /> API Keys
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Public Key</p>
                                    <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-300 break-all select-all">
                                        {publicKey}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Secret Key</p>
                                    <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-500 break-all select-none blur-[4px] hover:blur-none transition-all cursor-pointer">
                                        {secretKey}
                                    </div>
                                    <p className="text-[10px] text-slate-600 mt-1">Hover to reveal secret key.</p>
                                </div>
                            </div>
                        </div>

                        {/* Plan Override Form */}
                        <MerchantPlanForm merchantId={merchantId} currentPlan={currentPlan as any} />

                    </div>

                    {/* Right Column: Transactions */}
                    <div className="lg:col-span-2">
                        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
                                <Activity className="w-5 h-5 text-slate-400" /> Incoming Payments (Last 20)
                            </h3>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[600px]">
                                    <thead>
                                        <tr className="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                                            <th className="pb-4">Transaction</th>
                                            <th className="pb-4">Amount</th>
                                            <th className="pb-4">Sender</th>
                                            <th className="pb-4">Date</th>
                                            <th className="pb-4 text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/50">
                                        {transactions.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="py-8 text-center text-slate-500 font-medium italic">
                                                    No payments received yet.
                                                </td>
                                            </tr>
                                        ) : (
                                            transactions.map((tx) => {
                                                let dateFormatted = 'N/A';
                                                if (tx.timestamp) {
                                                    try {
                                                        const date = typeof tx.timestamp?.toDate === 'function' ? tx.timestamp.toDate() : new Date(tx.timestamp);
                                                        if (!isNaN(date.getTime())) dateFormatted = format(date, 'MMM d, yy HH:mm');
                                                    } catch (e) { }
                                                }

                                                return (
                                                    <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                                                        <td className="py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                                                                    <ArrowDownRight className="w-4 h-4" />
                                                                </div>
                                                                <div>
                                                                    <p className="font-semibold text-white text-sm">{tx.type || 'PAYMENT'}</p>
                                                                    <p className="text-xs text-slate-500 font-mono" title={tx.id}>{truncateId(tx.id)}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 font-mono font-bold text-white">
                                                            {formatCurrency(tx.amount || 0)}
                                                        </td>
                                                        <td className="py-4 text-sm text-slate-400 font-mono">
                                                            {truncateId(tx.senderId)}
                                                        </td>
                                                        <td className="py-4 text-sm text-slate-500">
                                                            {dateFormatted}
                                                        </td>
                                                        <td className="py-4 text-right">
                                                            <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold tracking-widest uppercase border ${tx.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                                    tx.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                                        'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                                                }`}>
                                                                {tx.status || 'UNKNOWN'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </ProtectedRoute>
    );
}
