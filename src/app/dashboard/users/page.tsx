import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { AdminRole } from '@/types/auth';

export default function UsersPage() {
    return (
        <ProtectedRoute allowedRoles={[AdminRole.ROOT, AdminRole.SUPER_ADMIN, AdminRole.WALLET_MANAGER]}>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Users & KYC</h1>
                    <p className="text-slate-400 mt-1">Manage Straight Wallet consumers and verification statuses.</p>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-4 border border-indigo-500/20">
                        <span className="text-2xl">👥</span>
                    </div>
                    <h3 className="text-lg font-bold text-white">No Users Found</h3>
                    <p className="text-slate-400 max-w-sm mt-2">
                        Consumer data will populate here once the Wallet ecosystem receives traffic.
                    </p>
                </div>
            </div>
        </ProtectedRoute>
    );
}
