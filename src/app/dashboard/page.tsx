import { adminDb } from '@/lib/firebase/firebaseAdmin';
import { formatCurrency } from '@/utils/formatters'; // We'll create this util
import { Users, Store, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { format } from 'date-fns';

// 1. Convert to an async Server Component
export default async function DashboardOverview() {
    let totalUsers = 0;
    let totalMerchants = 0;
    let systemTVL = 0;
    let recentTransactions: any[] = [];

    try {
        // Fetch User Stats & TVL
        const usersSnapshot = await adminDb.collection('users').get();
        totalUsers = usersSnapshot.size;

        usersSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.mainBalance && typeof data.mainBalance === 'number') {
                systemTVL += data.mainBalance;
            }
        });

        // Fetch Merchant Stats
        const merchantsSnapshot = await adminDb.collection('merchants').get();
        totalMerchants = merchantsSnapshot.size;

        // Fetch Recent 5 Transactions
        const txSnapshot = await adminDb.collection('transactions')
            .orderBy('timestamp', 'desc')
            .limit(5)
            .get();

        recentTransactions = txSnapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id
        }));

    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        // Fail gracefully, maybe show a toast or error state banner instead of crashing
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-black text-white tracking-tight">Overview</h1>
                <p className="text-slate-400 mt-1">High-level metrics across the TrainCredit ecosystem.</p>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard
                    title="System TVL (24h)"
                    value={formatCurrency(systemTVL)}
                    icon={<Activity className="w-5 h-5 text-indigo-400" />}
                    trend="+12.5%"
                    trendUp={true}
                    color="indigo"
                />
                <MetricCard
                    title="Active Consumers"
                    value={totalUsers.toLocaleString()}
                    icon={<Users className="w-5 h-5 text-emerald-400" />}
                    trend="+5.2%"
                    trendUp={true}
                    color="emerald"
                />
                <MetricCard
                    title="Integrated Merchants"
                    value={totalMerchants.toLocaleString()}
                    icon={<Store className="w-5 h-5 text-blue-400" />}
                    trend="0.0%"
                    trendUp={true}
                    color="blue"
                />
            </div>

            {/* Recent Activity Table */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-white tracking-tight">Recent Global Transactions</h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-950/50 border-b border-slate-800 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                                <th className="p-4 pl-6">Type / ID</th>
                                <th className="p-4">Amount</th>
                                <th className="p-4">Date</th>
                                <th className="p-4 pr-6 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {recentTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-slate-500 font-medium">
                                        No recent transactions found.
                                    </td>
                                </tr>
                            ) : (
                                recentTransactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-slate-800/20 transition-colors">
                                        <td className="p-4 pl-6">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.type === 'DEPOSIT' ? 'bg-emerald-500/10 text-emerald-400' :
                                                    tx.type === 'PAYMENT' ? 'bg-indigo-500/10 text-indigo-400' :
                                                        'bg-slate-500/10 text-slate-400'
                                                    }`}>
                                                    {tx.type === 'DEPOSIT' ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-white text-sm">{tx.type || 'UNKNOWN'}</p>
                                                    <p className="text-xs text-slate-500 font-mono truncate w-32">{tx.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 font-mono font-medium text-white">
                                            {formatCurrency(tx.amount || 0)}
                                        </td>
                                        <td className="p-4 text-sm text-slate-400">
                                            {(() => {
                                                if (!tx.timestamp) return 'N/A';

                                                try {
                                                    // Handle Firestore Timestamp objects or ISO strings
                                                    const date = typeof tx.timestamp?.toDate === 'function'
                                                        ? tx.timestamp.toDate()
                                                        : new Date(tx.timestamp);

                                                    // Check if it's a valid date
                                                    if (isNaN(date.getTime())) return 'Invalid Date';

                                                    return format(date, 'MMM d, h:mm a');
                                                } catch (e) {
                                                    return 'Invalid Date';
                                                }
                                            })()}
                                        </td>
                                        <td className="p-4 pr-6 text-right">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${tx.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' :
                                                tx.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400' :
                                                    'bg-rose-500/10 text-rose-400'
                                                }`}>
                                                {tx.status || 'UNKNOWN'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// Reusable Metric Card Sub-component
// Reusable Metric Card Sub-component
function MetricCard({ title, value, icon, trend, trendUp, color }: any) {
    // Tailwind requires full class names to not be purged. We use a map.
    const colorMap: Record<string, any> = {
        indigo: {
            bgGlow: 'bg-indigo-500/10 group-hover:bg-indigo-500/20',
            iconBg: 'bg-indigo-500/10 border-indigo-500/20'
        },
        emerald: {
            bgGlow: 'bg-emerald-500/10 group-hover:bg-emerald-500/20',
            iconBg: 'bg-emerald-500/10 border-emerald-500/20'
        },
        blue: {
            bgGlow: 'bg-blue-500/10 group-hover:bg-blue-500/20',
            iconBg: 'bg-blue-500/10 border-blue-500/20'
        }
    };

    const colors = colorMap[color] || colorMap.indigo;

    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 relative overflow-hidden group">
            {/* Ambient Background Glow on Hover */}
            <div className={`absolute -right-20 -top-20 w-40 h-40 blur-[50px] rounded-full transition-all duration-500 pointer-events-none ${colors.bgGlow}`} />

            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className={`p-2.5 rounded-xl border ${colors.iconBg}`}>
                    {icon}
                </div>
                <div className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${trendUp ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-rose-400 bg-rose-500/10 border-rose-500/20'}`}>
                    {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {trend}
                </div>
            </div>

            <div className="relative z-10">
                <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
                <p className="text-3xl font-black text-white tracking-tight">{value}</p>
            </div>
        </div>
    );
}
