import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { adminDb } from '@/lib/firebase/firebaseAdmin';
import { AdminRole } from '@/types/auth';
import { formatCurrency, truncateId } from '@/utils/formatters';
import { Search, MoreVertical, ShieldAlert, ShieldCheck, Users } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export const dynamic = 'force-dynamic';
export const revalidate = 120; // Revalidate every 2 minutes to heavily cache initial load

export default async function UsersPage() {
    let users: any[] = [];

    try {
        // Fetch up to 50 latest users from Straight Wallet (B2C)
        const usersSnapshot = await adminDb.collection('users')
            .orderBy('createdAt', 'desc')
            .limit(50)
            .get();

        users = usersSnapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id
        }));
    } catch (error) {
        console.error("Error fetching users:", error);
    }

    return (
        <ProtectedRoute allowedRoles={[AdminRole.ROOT, AdminRole.SUPER_ADMIN, AdminRole.WALLET_MANAGER]}>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tight">Users & KYC</h1>
                        <p className="text-slate-400 mt-1">Manage Straight Wallet consumers and verification statuses.</p>
                    </div>

                    {/* Placeholder Search Bar */}
                    <div className="relative w-full sm:w-auto">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-slate-500" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by ID or Email..."
                            className="w-full sm:w-64 pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                        />
                    </div>
                </div>

                {/* Users Data Table */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="bg-slate-950/50 border-b border-slate-800 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                                    <th className="p-4 pl-6">Identifier</th>
                                    <th className="p-4">Contact</th>
                                    <th className="p-4">Main Balance</th>
                                    <th className="p-4">Created Date</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 pr-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-12 text-center text-slate-500">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mb-3">
                                                    <Users className="w-6 h-6 text-slate-400" />
                                                </div>
                                                <p className="font-medium text-white">No Users Found</p>
                                                <p className="text-sm mt-1">Consumer data will populate here when users register.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user) => (
                                        <tr key={user.id} className="hover:bg-slate-800/20 transition-colors group">
                                            <td className="p-4 pl-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-white font-bold border border-slate-700">
                                                        {user.fullName ? user.fullName.charAt(0).toUpperCase() : '?'}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-white">{user.fullName || 'Anonymous User'}</p>
                                                        <p className="text-xs text-slate-500 font-mono" title={user.id}>
                                                            {truncateId(user.id, 8, 4)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <p className="text-sm text-slate-300">{user.email || 'N/A'}</p>
                                                <p className="text-xs text-slate-500">{user.phoneNumber || 'No phone'}</p>
                                            </td>
                                            <td className="p-4 font-mono font-medium text-white">
                                                {formatCurrency(user.mainBalance || 0)}
                                            </td>
                                            <td className="p-4 text-sm text-slate-400">
                                                {(() => {
                                                    if (!user.createdAt) return 'Unknown';
                                                    try {
                                                        const date = typeof user.createdAt?.toDate === 'function'
                                                            ? user.createdAt.toDate()
                                                            : new Date(user.createdAt);
                                                        if (isNaN(date.getTime())) return 'Invalid';
                                                        return format(date, 'MMM d, yyyy');
                                                    } catch (e) {
                                                        return 'Invalid';
                                                    }
                                                })()}
                                            </td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border ${user.isFrozen
                                                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                    }`}>
                                                    {user.isFrozen ? <ShieldAlert className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                                                    {user.isFrozen ? 'FROZEN' : 'ACTIVE'}
                                                </span>
                                            </td>
                                            <td className="p-4 pr-6 text-right relative">
                                                <Link
                                                    href={`/dashboard/users/${user.id}`}
                                                    className="inline-flex items-center justify-center px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg transition-colors border border-slate-700 hover:border-slate-600"
                                                >
                                                    View Details
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
