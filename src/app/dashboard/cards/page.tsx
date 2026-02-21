import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { AdminRole } from '@/types/auth';

export default function CardsPage() {
    return (
        <ProtectedRoute allowedRoles={[AdminRole.ROOT, AdminRole.SUPER_ADMIN, AdminRole.WALLET_MANAGER]}>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Virtual Cards</h1>
                    <p className="text-slate-400 mt-1">Monitor provisioning, block lists, and card statistics.</p>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-4 border border-emerald-500/20">
                        <span className="text-2xl">💳</span>
                    </div>
                    <h3 className="text-lg font-bold text-white">Card Ledger Empty</h3>
                    <p className="text-slate-400 max-w-sm mt-2">
                        Virtual card generation statistics will appear here.
                    </p>
                </div>
            </div>
        </ProtectedRoute>
    );
}
