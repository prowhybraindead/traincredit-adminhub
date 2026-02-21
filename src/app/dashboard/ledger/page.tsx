import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { AdminRole } from '@/types/auth';

export default function LedgerPage() {
    return (
        <ProtectedRoute allowedRoles={[AdminRole.ROOT, AdminRole.SUPER_ADMIN]}>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Global Ledger</h1>
                    <p className="text-slate-400 mt-1">Omniscient view of all TrainApp transactions crossing the database.</p>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-4 border border-purple-500/20">
                        <span className="text-2xl">🧾</span>
                    </div>
                    <h3 className="text-lg font-bold text-white">Global Feed Empty</h3>
                    <p className="text-slate-400 max-w-sm mt-2">
                        Transactions between Straight Wallet and TrainCredit Core will appear here.
                    </p>
                </div>
            </div>
        </ProtectedRoute>
    );
}
