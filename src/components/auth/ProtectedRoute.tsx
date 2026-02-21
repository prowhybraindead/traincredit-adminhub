'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';
import { AdminRole } from '../../types/auth';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: AdminRole[]; // Optional: If specific sub-pages need stricter roles later
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { user, adminRole, loading } = useAdminAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            // Priority 1: No user or no role means they shouldn't be here
            if (!user || !adminRole) {
                router.replace('/login');
                return;
            }

            // Priority 2: Stricter route-level RBAC check
            if (allowedRoles && allowedRoles.length > 0) {
                if (!allowedRoles.includes(adminRole)) {
                    // They are logged in, but lack the specific role for this page
                    console.warn(`Access Denied. Role ${adminRole} is not in allowed list: ${allowedRoles.join(', ')}`);
                    router.replace('/dashboard'); // Kick back to overview
                }
            }
        }
    }, [user, adminRole, loading, router, allowedRoles]);

    // Show full screen sleek loader while authenticating
    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-slate-950">
                <div className="flex flex-col items-center gap-4 text-indigo-500">
                    <Loader2 className="h-10 w-10 animate-spin" />
                    <p className="font-mono text-sm tracking-widest text-slate-400">AUTHENTICATING SECURE CONNECTION...</p>
                </div>
            </div>
        );
    }

    // Double check to prevent flash of unauthorized content before useEffect triggers router push
    if (!user || !adminRole) {
        return null;
    }

    // Stricter layout flash prevention
    if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(adminRole)) {
        return null;
    }

    // Authorized
    return <>{children}</>;
}
