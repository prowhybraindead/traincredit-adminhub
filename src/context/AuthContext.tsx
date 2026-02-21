'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase/clientApp';
import { AdminRole } from '../types/auth';

interface AuthContextType {
    user: User | null;
    adminRole: AdminRole | null;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    adminRole: null,
    loading: true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [adminRole, setAdminRole] = useState<AdminRole | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    // Fetch token and force refresh to get latest custom claims
                    const tokenResult = await firebaseUser.getIdTokenResult(true);
                    const role = tokenResult.claims.role as AdminRole;

                    if (!role) {
                        // CRITICAL: They are a normal user, kick them out IMMEDIATELY
                        console.error('Unauthorized access attempt by standard user.');
                        await signOut(auth);
                        setUser(null);
                        setAdminRole(null);
                        alert('Unauthorized. Admin privileges are required to access this system.');
                    } else {
                        // They are an admin
                        setUser(firebaseUser);
                        setAdminRole(role);
                    }
                } catch (error) {
                    console.error('Error fetching custom claims:', error);
                    await signOut(auth);
                    setUser(null);
                    setAdminRole(null);
                }
            } else {
                setUser(null);
                setAdminRole(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, adminRole, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAdminAuth = () => useContext(AuthContext);
