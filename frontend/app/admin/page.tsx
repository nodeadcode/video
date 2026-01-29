"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Trash2, Plus, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';

interface Video {
    id: number;
    title: string;
    created_at: string;
}

export default function AdminDashboard() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && (!user || !user.is_admin)) {
            router.push('/');
            return;
        }

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

        if (user?.is_admin) fetchVideos();
    }, [user, authLoading, router]);

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this video?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/videos/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setVideos(videos.filter(v => v.id !== id));
        } catch (error) {
            alert("Failed to delete video");
        }
    };

    if (authLoading || loading) return <div>Loading...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <LayoutDashboard className="text-blue-500" />
                    <span>Admin Dashboard</span>
                </h1>
                <Link href="/admin/upload" className="btn-primary flex items-center gap-2">
                    <Plus size={20} />
                    <span>Upload New Video</span>
                </Link>
            </div>

            <div className="glass-card overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-white/10 text-gray-300">
                        <tr>
                            <th className="px-6 py-4">Title</th>
                            <th className="px-6 py-4">Uploaded At</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                        {videos.map((v) => (
                            <tr key={v.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 font-medium">{v.title}</td>
                                <td className="px-6 py-4 text-gray-400">
                                    {new Date(v.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => handleDelete(v.id)}
                                        className="text-gray-400 hover:text-red-500 transition-colors p-2"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {videos.length === 0 && (
                            <tr>
                                <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                                    No videos found. Start by uploading one!
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
