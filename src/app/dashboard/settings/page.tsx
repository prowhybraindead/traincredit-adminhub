import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { AdminRole } from '@/types/auth';

export default function SettingsPage() {
    return (
        <ProtectedRoute allowedRoles={[AdminRole.ROOT]}>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Admin Settings</h1>
                    <p className="text-slate-400 mt-1">God mode configurations. Danger Zone.</p>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center mb-4 border border-rose-500/20">
                        <span className="text-2xl">⚡</span>
                    </div>
                    <h3 className="text-lg font-bold text-white">System Settings</h3>
                    <p className="text-slate-400 max-w-sm mt-2">
                        Manage other administrators and system-wide feature flags here.
                    </p>
                </div>
            </div>
        </ProtectedRoute>
    );
}
