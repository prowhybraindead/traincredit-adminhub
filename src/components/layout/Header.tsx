'use client';

import React from 'react';
import { useAdminAuth } from '../../context/AuthContext';
import { format } from 'date-fns'; // We'll install date-fns next
import { Bell } from 'lucide-react';

export default function Header() {
    const { user, adminRole } = useAdminAuth();

    if (!user || !adminRole) return null;

    // Format the role to be more readable (e.g. SUPER_ADMIN -> Super Admin)
    const formattedRole = adminRole.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());

    return (
        <header className="h-20 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800 flex items-center justify-between px-8 sticky top-0 z-30" style={{ transform: 'translateZ(0)', willChange: 'filter' }}>
            <div>
                <h2 className="text-xl font-bold text-white tracking-tight">System Overview</h2>
                <p className="text-xs font-mono text-slate-400 mt-0.5">
                    {format(new Date(), 'EEEE, MMMM do, yyyy')}
                </p>
            </div>

            <div className="flex items-center gap-6">
                <button className="relative p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-slate-800">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-slate-950"></span>
                </button>

                <div className="flex items-center gap-3 pl-6 border-l border-slate-800">
                    <div className="text-right">
                        <p className="text-sm font-semibold text-white">{user.email}</p>
                        <p className="text-[10px] font-mono font-bold tracking-widest text-indigo-400 uppercase">
                            {formattedRole}
                        </p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
                        {user.email?.charAt(0).toUpperCase()}
                    </div>
                </div>
            </div>
        </header>
    );
}
