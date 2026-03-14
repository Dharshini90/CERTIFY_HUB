'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { getUser, setUser as saveUser, removeAuthToken } from '@/lib/auth';

interface AuthContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUserState] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Load user from localStorage on mount
        const storedUser = getUser();
        if (storedUser) {
            setUserState(storedUser);
        }
        setLoading(false);
    }, []);

    const setUser = (user: User | null) => {
        setUserState(user);
        if (user) {
            saveUser(user);
        }
    };

    const logout = () => {
        setUserState(null);
        removeAuthToken();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                setUser,
                logout,
                isAuthenticated: !!user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
