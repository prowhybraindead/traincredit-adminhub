import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { AdminRole } from '@/types/auth';

export default function MerchantsPage() {
    return (
        <ProtectedRoute allowedRoles={[AdminRole.ROOT, AdminRole.SUPER_ADMIN, AdminRole.TRAINCREDIT_MANAGER]}>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Merchants</h1>
                    <p className="text-slate-400 mt-1">Manage B2B integrations, API keys, and enterprise limits.</p>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-4 border border-blue-500/20">
                        <span className="text-2xl">🏪</span>
                    </div>
                    <h3 className="text-lg font-bold text-white">No Merchants Integrated</h3>
                    <p className="text-slate-400 max-w-sm mt-2">
                        B2B accounts from TrainCredit Core will be managed here.
                    </p>
                </div>
            </div>
        </ProtectedRoute>
    );
}
