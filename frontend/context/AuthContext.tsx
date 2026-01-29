"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

interface User {
    id: number;
    telegram_id: string;
    username?: string;
    first_name?: string;
    last_name?: string;
    photo_url?: string;
    is_admin: boolean;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (telegramUser: any) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetchUser(token);
        } else {
            setLoading(false);
        }
    }, []);

    const fetchUser = async (token: string) => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(response.data);
        } catch (error) {
            console.error("Failed to fetch user", error);
            localStorage.removeItem('token');
        } finally {
            setLoading(false);
        }
    };

    const login = async (telegramUser: any) => {
        try {
            setLoading(true);
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login/telegram`, telegramUser);
            const { access_token } = response.data;
            localStorage.setItem('token', access_token);
            await fetchUser(access_token);
        } catch (error) {
            console.error("Login failed", error);
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
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
