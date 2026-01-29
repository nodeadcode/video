'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { Plus, Trash2, Edit, ExternalLink } from 'lucide-react';

interface Video {
    id: number;
    title: string;
    is_public: boolean;
    created_at: string;
}

export default function AdminDashboard() {
    const { token, user } = useAuth();
    const [videos, setVideos] = useState<Video[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (token && user?.is_admin) {
            fetchVideos();
        }
    }, [token, user]);

    const fetchVideos = async () => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/videos`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setVideos(response.data);
        } catch (err) {
            console.error('Failed to fetch videos');
        } finally {
            setIsLoading(false);
        }
    };

    const deleteVideo = async (id: number) => {
        if (!confirm('Are you sure you want to delete this video?')) return;
        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/videos/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setVideos(videos.filter(v => v.id !== id));
        } catch (err) {
            alert('Failed to delete video');
        }
    };

    if (!user?.is_admin) return <div className="py-20 text-center text-red-600">Access Denied</div>;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <Link
                    href="/admin/upload"
                    className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
                >
                    <Plus size={20} />
                    <span>Upload Video</span>
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-900">Title</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-900">Status</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-900">Uploaded</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {videos.map((video) => (
                            <tr key={video.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <span className="font-medium text-gray-900">{video.title}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${video.is_public ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {video.is_public ? 'Public' : 'Private'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {new Date(video.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right space-x-3">
                                    <Link href={`/watch/${video.id}`} className="text-gray-400 hover:text-primary-600 inline-block">
                                        <ExternalLink size={18} />
                                    </Link>
                                    <button onClick={() => deleteVideo(video.id)} className="text-gray-400 hover:text-red-600">
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {videos.length === 0 && !isLoading && (
                    <div className="py-10 text-center text-gray-500">No videos found.</div>
                )}
            </div>
        </div>
    );
}
