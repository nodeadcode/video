"use client";

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useRef } from 'react';
import { Play, Shield, Upload, LogOut, User as UserIcon } from 'lucide-react';

export default function Navbar() {
    const { user, login, logout } = useAuth();
    const scriptContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!user && scriptContainerRef.current) {
            // Clear existing content
            scriptContainerRef.current.innerHTML = '';

            const script = document.createElement('script');
            script.src = "https://telegram.org/js/telegram-widget.js?22";
            script.setAttribute('data-telegram-login', process.env.NEXT_PUBLIC_BOT_USERNAME || "");
            script.setAttribute('data-size', 'medium');
            script.setAttribute('data-radius', '8');
            script.setAttribute('data-onauth', 'onTelegramAuth(user)');
            script.setAttribute('data-request-access', 'write');
            script.async = true;

            // Global callback for Telegram Login
            (window as any).onTelegramAuth = (telegramUser: any) => {
                login(telegramUser);
            };

            scriptContainerRef.current.appendChild(script);
        }
    }, [user, login]);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass-card mx-4 mt-4 px-6 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold text-blue-400">
                <Play fill="currentColor" size={24} />
                <span>StreamVP</span>
            </Link>

            <div className="flex items-center gap-6">
                <Link href="/" className="hover:text-blue-400 transition-colors">Home</Link>

                {user?.is_admin && (
                    <>
                        <Link href="/admin" className="flex items-center gap-1 hover:text-blue-400 transition-colors">
                            <Shield size={18} />
                            <span>Admin</span>
                        </Link>
                        <Link href="/admin/upload" className="flex items-center gap-1 hover:text-blue-400 transition-colors">
                            <Upload size={18} />
                            <span>Upload</span>
                        </Link>
                    </>
                )}

                {user ? (
                    <div className="flex items-center gap-4 border-l border-white/20 pl-6">
                        <div className="flex items-center gap-2">
                            {user.photo_url ? (
                                <img src={user.photo_url} alt={user.username} className="w-8 h-8 rounded-full border border-blue-400" />
                            ) : (
                                <UserIcon size={20} className="text-gray-400" />
                            )}
                            <span className="text-sm font-medium">{user.username || user.first_name}</span>
                        </div>
                        <button onClick={logout} className="text-gray-400 hover:text-red-400 transition-colors">
                            <LogOut size={20} />
                        </button>
                    </div>
                ) : (
                    <div ref={scriptContainerRef}></div>
                )}
            </div>
        </nav>
    );
}
