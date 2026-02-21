import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { adminDb } from '@/lib/firebase/firebaseAdmin';
import { AdminRole } from '@/types/auth';
import { formatCurrency, truncateId } from '@/utils/formatters';
import { ShieldAlert, ShieldCheck, ArrowLeft, User as UserIcon, Wallet, CreditCard, Activity, ArrowUpRight, ArrowDownRight, LayoutTemplate } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { toggleUserStatus } from '@/app/actions/userActions';

export default async function UserDetailPage({ params }: { params: { id: string } }) {
    const userId = params.id;
    let user: any = null;
    let cards: any[] = [];
    let transactions: any[] = [];

    try {
        // Fetch User, Cards, and Transactions in parallel to optimize TTFB
        const [userDoc, cardsSnap, sentTxSnap, receivedTxSnap] = await Promise.all([
            adminDb.collection('users').doc(userId).get(),
            adminDb.collection('cards').where('userId', '==', userId).get(),
            adminDb.collection('transactions').where('senderId', '==', userId).orderBy('timestamp', 'desc').limit(20).get(),
            adminDb.collection('transactions').where('receiverId', '==', userId).orderBy('timestamp', 'desc').limit(20).get(),
        ]);

        if (userDoc.exists) {
            user = { id: userDoc.id, ...userDoc.data() };
        }

        cards = cardsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Merge and sort transactions
        const allTx: any[] = [
            ...sentTxSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })),
            ...receivedTxSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        ];

        // Deduplicate in case a transaction loops back or is caught in both (rare but safe)
        const uniqueTx = Array.from(new Map(allTx.map(tx => [tx.id, tx])).values());

        transactions = uniqueTx.sort((a, b) => {
            const timeA = new Date(a.timestamp || 0).getTime();
            const timeB = new Date(b.timestamp || 0).getTime();
            return timeB - timeA;
        }).slice(0, 20); // Keep top 20 latest

    } catch (error) {
        console.error("Error fetching user data:", error);
    }

    if (!user) {
        return (
            <ProtectedRoute allowedRoles={[AdminRole.ROOT, AdminRole.SUPER_ADMIN, AdminRole.WALLET_MANAGER]}>
                <div className="flex flex-col items-center justify-center p-20 text-slate-400">
                    <ShieldAlert className="w-12 h-12 mb-4 text-rose-500" />
                    <h2 className="text-xl font-bold text-white">User Not Found</h2>
                    <p className="mt-2 text-sm">The requested UID ({userId}) does not exist in the database.</p>
                    <Link href="/dashboard/users" className="mt-6 text-indigo-400 hover:text-indigo-300 flex items-center gap-2 text-sm font-semibold">
                        <ArrowLeft className="w-4 h-4" /> Back to Directory
                    </Link>
                </div>
            </ProtectedRoute>
        );
    }

    const isFrozen = user.isFrozen || false;

    return (
        <ProtectedRoute allowedRoles={[AdminRole.ROOT, AdminRole.SUPER_ADMIN, AdminRole.WALLET_MANAGER]}>
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header Profile Section */}
                <div>
                    <Link href="/dashboard/users" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm font-semibold mb-6 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to Users
                    </Link>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-slate-800">
                        <div className="flex items-center gap-5">
                            <div className="w-20 h-20 bg-slate-800 border-2 border-slate-700 rounded-2xl flex items-center justify-center shadow-xl">
                                <UserIcon className="w-10 h-10 text-slate-400" />
                            </div>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-3xl font-black text-white tracking-tight">{user.fullName || 'Anonymous User'}</h1>
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase border ${isFrozen
                                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
                                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                                        }`}>
                                        {isFrozen ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                                        {isFrozen ? 'ACCOUNT FROZEN' : 'ACTIVE'}
                                    </span>
                                </div>
                                <div className="mt-2 text-slate-400 space-y-1">
                                    <p className="font-mono text-xs"><span className="text-slate-500">UID:</span> {user.id}</p>
                                    <p className="text-sm"><span className="text-slate-500">Email:</span> {user.email || 'N/A'}</p>
                                    <p className="text-sm"><span className="text-slate-500">Phone:</span> {user.phoneNumber || 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Mutation Action */}
                        <form action={async () => {
                            "use server";
                            await toggleUserStatus(userId, isFrozen);
                        }}>
                            <button
                                type="submit"
                                className={`px-6 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all border ${isFrozen
                                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500'
                                    : 'bg-rose-600/10 hover:bg-rose-600 hover:text-white text-rose-500 border-rose-600/30'
                                    }`}
                            >
                                {isFrozen ? 'UNFREEZE ACCOUNT' : 'FREEZE ACCOUNT'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Financial Overview Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 relative overflow-hidden group">
                        <div className="absolute -right-20 -top-20 w-40 h-40 bg-indigo-500/10 blur-[50px] rounded-full group-hover:bg-indigo-500/20 transition-all duration-500 pointer-events-none" />
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                                <Wallet className="w-5 h-5 text-indigo-400" />
                            </div>
                        </div>
                        <div className="relative z-10">
                            <p className="text-slate-400 text-sm font-medium mb-1">Total Main Balance</p>
                            <p className="text-4xl font-black text-white tracking-tight font-mono">{formatCurrency(user.mainBalance || 0)}</p>
                        </div>
                    </div>

                    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 relative overflow-hidden group">
                        <div className="absolute -right-20 -top-20 w-40 h-40 bg-blue-500/10 blur-[50px] rounded-full group-hover:bg-blue-500/20 transition-all duration-500 pointer-events-none" />
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
                                <LayoutTemplate className="w-5 h-5 text-blue-400" />
                            </div>
                        </div>
                        <div className="relative z-10">
                            <p className="text-slate-400 text-sm font-medium mb-1">Active Virtual Cards</p>
                            <p className="text-4xl font-black text-white tracking-tight font-mono">{cards.length}</p>
                        </div>
                    </div>
                </div>

                {/* Virtual Cards Section */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-slate-400" /> Issued Virtual Cards
                    </h3>
                    {cards.length === 0 ? (
                        <div className="p-8 border border-slate-800 border-dashed rounded-2xl text-center text-slate-500 italic text-sm">
                            This user has not generated any virtual cards yet.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {cards.map(card => (
                                <div key={card.id} className="p-5 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl shadow-lg relative overflow-hidden">
                                    <div className="flex justify-between items-center mb-6">
                                        <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">{card.issuer || 'UNKNOWN ISSUER'}</span>
                                        <CreditCard className="w-4 h-4 text-slate-600" />
                                    </div>
                                    <p className="text-lg font-mono text-white tracking-[0.2em] mb-2">
                                        •••• •••• •••• {card.cardNumber ? card.cardNumber.slice(-4) : '????'}
                                    </p>
                                    <div className="flex justify-between items-end text-xs text-slate-500 font-mono">
                                        <p>EXP {card.expiryMonth || 'XX'}/{card.expiryYear || 'XX'}</p>
                                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${card.isFrozen ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'
                                            }`}>
                                            {card.isFrozen ? 'Frozen' : 'Active'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Transaction History Section */}
                <div className="space-y-4 pt-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Activity className="w-5 h-5 text-slate-400" /> Recent Activity (Last 20)
                    </h3>

                    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[800px]">
                                <thead>
                                    <tr className="bg-slate-950/50 border-b border-slate-800 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                                        <th className="p-4 pl-6">Type / ID</th>
                                        <th className="p-4">Amount</th>
                                        <th className="p-4">Counterparty</th>
                                        <th className="p-4">Date</th>
                                        <th className="p-4 pr-6 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/50">
                                    {transactions.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-slate-500 font-medium">
                                                No transactions found for this user.
                                            </td>
                                        </tr>
                                    ) : (
                                        transactions.map((tx) => {
                                            const isSender = tx.senderId === userId;

                                            // Format date safely
                                            let dateFormatted = 'N/A';
                                            if (tx.timestamp) {
                                                try {
                                                    const date = typeof tx.timestamp?.toDate === 'function' ? tx.timestamp.toDate() : new Date(tx.timestamp);
                                                    if (!isNaN(date.getTime())) dateFormatted = format(date, 'MMM d, yyyy HH:mm');
                                                } catch (e) { }
                                            }

                                            return (
                                                <tr key={tx.id} className="hover:bg-slate-800/20 transition-colors">
                                                    <td className="p-4 pl-6">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${!isSender ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400'
                                                                }`}>
                                                                {!isSender ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-white text-sm">{tx.type || 'UNKNOWN'}</p>
                                                                <p className="text-xs text-slate-500 font-mono truncate w-32">{truncateId(tx.id)}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className={`p-4 font-mono font-medium ${!isSender ? 'text-emerald-400' : 'text-white'}`}>
                                                        {!isSender ? '+' : '-'}{formatCurrency(tx.amount || 0)}
                                                    </td>
                                                    <td className="p-4 text-sm text-slate-400 font-mono">
                                                        {isSender ? `To: ${truncateId(tx.receiverId || tx.merchantId)}` : `From: ${truncateId(tx.senderId)}`}
                                                    </td>
                                                    <td className="p-4 text-sm text-slate-500">
                                                        {dateFormatted}
                                                    </td>
                                                    <td className="p-4 pr-6 text-right">
                                                        <span className={`inline-flex items-center px-2 py-1 rounded-lg text-[10px] font-bold tracking-widest uppercase border ${tx.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
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
        </ProtectedRoute>
    );
}
