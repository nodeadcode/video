"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { Play } from 'lucide-react';

interface Video {
    id: number;
    title: string;
    description: string;
    thumbnail_path?: string;
}

export default function Home() {
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/videos/`);
                setVideos(response.data);
            } catch (error) {
                console.error("Failed to fetch videos", error);
            } finally {
                setLoading(false);
            }
        };
        fetchVideos();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">Featured Videos</h1>

            {videos.length === 0 ? (
                <div className="text-center py-20 glass-card">
                    <p className="text-gray-400">No videos uploaded yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {videos.map((video) => (
                        <Link key={video.id} href={`/watch/${video.id}`} className="group">
                            <div className="glass-card hover:border-blue-500/50 transition-all duration-300">
                                <div className="relative aspect-video bg-gray-900">
                                    {video.thumbnail_path ? (
                                        <img
                                            src={`${process.env.NEXT_PUBLIC_API_URL}/api/videos/thumbnail/${video.id}`}
                                            alt={video.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Play size={48} className="text-gray-700" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <div className="bg-blue-600 p-3 rounded-full">
                                            <Play fill="white" size={24} />
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h2 className="font-bold text-lg mb-1 group-hover:text-blue-400 transition-colors line-clamp-1">
                                        {video.title}
                                    </h2>
                                    <p className="text-gray-400 text-sm line-clamp-2">
                                        {video.description || "No description provided."}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
