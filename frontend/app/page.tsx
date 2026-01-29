'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { Play } from 'lucide-react';

interface Video {
    id: number;
    title: string;
    description: string;
    thumbnail_path: string;
}

export default function Home() {
    const { token, user, isLoading } = useAuth();
    const [videos, setVideos] = useState<Video[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (token) {
            fetchVideos();
        }
    }, [token]);

    const fetchVideos = async () => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/videos`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setVideos(response.data);
        } catch (err) {
            setError('Failed to load videos. Make sure you are logged in.');
        }
    };

    if (isLoading) return <div className="flex justify-center py-20">Loading...</div>;

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <h1 className="text-4xl font-bold text-gray-900">Welcome to StreamMVP</h1>
                <p className="text-gray-500 text-lg">Please login with Telegram to start watching.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">Library</h1>
            </div>

            {error && <div className="p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>}

            <div className="video-grid">
                {videos.map((video) => (
                    <Link key={video.id} href={`/watch/${video.id}`} className="group">
                        <div className="relative aspect-video bg-gray-200 rounded-xl overflow-hidden mb-3">
                            {video.thumbnail_path ? (
                                <img
                                    src={`${process.env.NEXT_PUBLIC_API_URL}/api/videos/thumbnail/${video.id}`}
                                    alt={video.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <Play size={48} />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <div className="p-3 bg-primary-500 text-white rounded-full">
                                    <Play size={24} fill="currentColor" />
                                </div>
                            </div>
                        </div>
                        <h3 className="font-semibold text-gray-900 line-clamp-1">{video.title}</h3>
                        <p className="text-sm text-gray-500 line-clamp-2">{video.description}</p>
                    </Link>
                ))}
            </div>

            {videos.length === 0 && !error && (
                <div className="text-center py-20 text-gray-500">
                    No videos available yet.
                </div>
            )}
        </div>
    );
}
