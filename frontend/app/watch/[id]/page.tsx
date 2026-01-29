"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import VideoPlayer from '@/components/VideoPlayer';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

interface Video {
    id: number;
    title: string;
    description: string;
}

export default function WatchPage() {
    const { id } = useParams();
    const router = useRouter();
    const [video, setVideo] = useState<Video | null>(null);
    const [allVideos, setAllVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [videoRes, allRes] = await Promise.all([
                    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/videos/${id}`),
                    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/videos/`)
                ]);
                setVideo(videoRes.data);
                setAllVideos(allRes.data);
            } catch (error) {
                console.error("Failed to fetch video", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) return <div>Loading...</div>;
    if (!video) return <div>Video not found</div>;

    const currentIndex = allVideos.findIndex(v => v.id === Number(id));
    const nextVideo = allVideos[currentIndex - 1]; // Reverse sorted
    const prevVideo = allVideos[currentIndex + 1];

    return (
        <div className="max-w-5xl mx-auto">
            <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
                <ChevronLeft size={20} />
                <span>Back to Home</span>
            </Link>

            <VideoPlayer
                src={`${process.env.NEXT_PUBLIC_API_URL}/api/videos/stream/${id}`}
                onNext={nextVideo ? () => router.push(`/watch/${nextVideo.id}`) : undefined}
                onPrev={prevVideo ? () => router.push(`/watch/${prevVideo.id}`) : undefined}
            />

            <div className="mt-8 glass-card p-6">
                <h1 className="text-2xl font-bold mb-4">{video.title}</h1>
                <p className="text-gray-300 whitespace-pre-wrap">{video.description || "No description."}</p>
            </div>

            <div className="mt-12">
                <h2 className="text-xl font-bold mb-6">More Videos</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {allVideos.filter(v => v.id !== Number(id)).slice(0, 3).map(v => (
                        <Link key={v.id} href={`/watch/${v.id}`} className="group">
                            <div className="glass-card hover:border-blue-500/50 transition-all duration-300">
                                <div className="aspect-video bg-gray-900 overflow-hidden">
                                    <img src={`${process.env.NEXT_PUBLIC_API_URL}/api/videos/thumbnail/${v.id}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                </div>
                                <div className="p-3">
                                    <h3 className="font-medium line-clamp-1 group-hover:text-blue-400 transition-colors">{v.title}</h3>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
