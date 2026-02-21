'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAdminAuth } from '../../context/AuthContext';
import { auth } from '../../lib/firebase/clientApp';
import { signOut } from 'firebase/auth';
import { AdminRole } from '../../types/auth';
import {
    LayoutDashboard, Users, CreditCard,
    Store, Receipt, ShieldAlert, LogOut
} from 'lucide-react';

interface NavItem {
    title: string;
    href: string;
    icon: React.ElementType;
    allowedRoles: AdminRole[];
}

const NAV_ITEMS: NavItem[] = [
    {
        title: 'Overview',
        href: '/dashboard',
        icon: LayoutDashboard,
        allowedRoles: [AdminRole.ROOT, AdminRole.SUPER_ADMIN, AdminRole.TRAINCREDIT_MANAGER, AdminRole.WALLET_MANAGER]
    },
    {
        title: 'Users & KYC',
        href: '/dashboard/users',
        icon: Users,
        allowedRoles: [AdminRole.ROOT, AdminRole.SUPER_ADMIN, AdminRole.WALLET_MANAGER]
    },
    {
        title: 'Virtual Cards',
        href: '/dashboard/cards',
        icon: CreditCard,
        allowedRoles: [AdminRole.ROOT, AdminRole.SUPER_ADMIN, AdminRole.WALLET_MANAGER]
    },
    {
        title: 'Merchants',
        href: '/dashboard/merchants',
        icon: Store,
        allowedRoles: [AdminRole.ROOT, AdminRole.SUPER_ADMIN, AdminRole.TRAINCREDIT_MANAGER]
    },
    {
        title: 'Global Ledger',
        href: '/dashboard/ledger',
        icon: Receipt,
        allowedRoles: [AdminRole.ROOT, AdminRole.SUPER_ADMIN]
    },
    {
        title: 'Admin Settings',
        href: '/dashboard/settings',
        icon: ShieldAlert,
        allowedRoles: [AdminRole.ROOT]
    }
];

export default function Sidebar() {
    const pathname = usePathname();
    const { adminRole } = useAdminAuth();

    const handleSignOut = async () => {
        await signOut(auth);
    };

    if (!adminRole) return null; // Defensive check, handled by ProtectedRoute but good practice

    return (
        <aside className="w-64 h-screen bg-slate-950 border-r border-slate-800 flex flex-col fixed top-0 left-0 z-40 text-slate-300">
            {/* Logo Area */}
            <div className="h-20 flex items-center px-6 border-b border-slate-800/50 mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-500/10 border border-indigo-500/30 rounded-lg flex items-center justify-center">
                        <ShieldAlert className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div>
                        <h1 className="font-bold text-white tracking-tight">TrainCredit</h1>
                        <p className="text-[10px] font-mono text-indigo-400 tracking-widest uppercase">Admin Hub</p>
                    </div>
                </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
                {NAV_ITEMS.map((item) => {
                    // RBAC check: Only render if user role is in allowedRoles
                    if (!item.allowedRoles.includes(adminRole)) return null;

                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${isActive
                                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                                }`}
                        >
                            <item.icon className={`w-5 h-5 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                            <span className="font-medium text-sm">{item.title}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer / Sign Out */}
            <div className="p-4 border-t border-slate-800/50">
                <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium text-sm">Sign Out</span>
                </button>
            </div>
        </aside>
    );
}
