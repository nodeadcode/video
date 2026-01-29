'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import VideoPlayer from '@/components/VideoPlayer';
import { ChevronLeft } from 'lucide-react';

interface Video {
    id: number;
    title: string;
    description: string;
}

export default function WatchPage() {
    const { id } = useParams();
    const router = useRouter();
    const { token, user } = useAuth();
    const [video, setVideo] = useState<Video | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (token && id) {
            fetchVideo();
        }
    }, [token, id]);

    const fetchVideo = async () => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/videos/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setVideo(response.data);
        } catch (err) {
            setError('Failed to load video or access denied.');
        }
    };

    if (!user) return <div className="py-20 text-center">Please login to watch.</div>;
    if (error) return <div className="py-20 text-center text-red-600">{error}</div>;
    if (!video) return <div className="py-20 text-center">Loading...</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <button
                onClick={() => router.back()}
                className="flex items-center text-gray-500 hover:text-primary-600 transition-colors"
            >
                <ChevronLeft size={20} />
                <span>Back</span>
            </button>

            <VideoPlayer
                src={`${process.env.NEXT_PUBLIC_API_URL}/api/videos/stream/${id}?token=${token}`}
            />

            <div className="space-y-2">
                <h1 className="text-3xl font-bold text-gray-900">{video.title}</h1>
                <p className="text-gray-600 text-lg leading-relaxed">{video.description}</p>
            </div>
        </div>
    );
}
