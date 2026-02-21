export default function DashboardOverview() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-black text-white tracking-tight">Overview</h1>
                <p className="text-slate-400 mt-1">High-level metrics across the TrainCredit ecosystem.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Placeholder Metric Cards */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                    <p className="text-slate-400 text-sm font-medium">Total Volume (24h)</p>
                    <p className="text-3xl font-bold text-white mt-2">$0.00</p>
                </div>
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                    <p className="text-slate-400 text-sm font-medium">Active Users</p>
                    <p className="text-3xl font-bold text-white mt-2">0</p>
                </div>
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                    <p className="text-slate-400 text-sm font-medium">Active Merchants</p>
                    <p className="text-3xl font-bold text-white mt-2">0</p>
                </div>
            </div>
        </div>
    );
}
