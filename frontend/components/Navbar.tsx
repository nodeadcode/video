'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { Search, User, LogOut, LayoutDashboard, Film } from 'lucide-react';

const Navbar = () => {
    const { user, login, logout } = useAuth();

    useEffect(() => {
        // Load Telegram Login Widget script
        const script = document.createElement('script');
        script.src = 'https://telegram.org/js/telegram-widget.js?22';
        script.setAttribute('data-telegram-login', process.env.NEXT_PUBLIC_BOT_USERNAME || '');
        script.setAttribute('data-size', 'medium');
        script.setAttribute('data-onauth', 'onTelegramAuth(user)');
        script.setAttribute('data-request-access', 'write');
        script.async = true;

        // Global callback for Telegram login
        (window as any).onTelegramAuth = (userData: any) => {
            login(userData);
        };

        const container = document.getElementById('telegram-login-container');
        if (container && !user) {
            container.appendChild(script);
        }

        return () => {
            // Cleanup if needed
        };
    }, [user, login]);

    return (
        <nav className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 z-50 px-6 flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2 text-primary-600 font-bold text-2xl">
                <Film size={28} />
                <span>StreamMVP</span>
            </Link>

            <div className="flex-1 max-w-md mx-8 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                    type="text"
                    placeholder="Search videos..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-full focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all outline-none"
                />
            </div>

            <div className="flex items-center space-x-4">
                {user ? (
                    <>
                        {user.is_admin && (
                            <Link href="/admin" className="text-gray-600 hover:text-primary-600 flex items-center space-x-1">
                                <LayoutDashboard size={20} />
                                <span className="hidden md:inline">Admin</span>
                            </Link>
                        )}
                        <div className="flex items-center space-x-3">
                            <div className="flex flex-col items-end">
                                <span className="text-sm font-medium text-gray-900 leading-none">{user.first_name}</span>
                                <span className="text-xs text-gray-500 uppercase">{user.is_admin ? 'Admin' : 'User'}</span>
                            </div>
                            {user.photo_url ? (
                                <img src={user.photo_url} alt="Profile" className="w-10 h-10 rounded-full border-2 border-primary-100" />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                                    <User size={20} />
                                </div>
                            )}
                            <button onClick={logout} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                                <LogOut size={20} />
                            </button>
                        </div>
                    </>
                ) : (
                    <div id="telegram-login-container"></div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
