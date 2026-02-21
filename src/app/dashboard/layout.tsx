import React from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-slate-950 flex">
                <Sidebar />
                <div className="flex-1 ml-64 flex flex-col min-h-screen overflow-hidden">
                    <Header />
                    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-950 p-8">
                        {children}
                    </main>
                </div>
            </div>
        </ProtectedRoute>
    );
}
