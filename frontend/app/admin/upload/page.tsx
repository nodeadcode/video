"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Upload, X, CheckCircle2 } from 'lucide-react';

export default function UploadPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!videoFile) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('video_file', videoFile);
        if (thumbnailFile) formData.append('thumbnail_file', thumbnailFile);

        try {
            const token = localStorage.getItem('token');
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/videos/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });
            setUploadSuccess(true);
            setTimeout(() => router.push('/admin'), 2000);
        } catch (error) {
            alert("Upload failed");
        } finally {
            setIsUploading(false);
        }
    };

    if (uploadSuccess) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in duration-500">
                <CheckCircle2 size={64} className="text-green-500 mb-4" />
                <h1 className="text-2xl font-bold">Upload Successful!</h1>
                <p className="text-gray-400">Redirecting to dashboard...</p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Upload New Video</h1>

            <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6">
                <div>
                    <label className="block text-sm font-medium mb-2">Video Title</label>
                    <input
                        type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:border-blue-500 outline-none transition-colors"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                        rows={4} value={description} onChange={(e) => setDescription(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:border-blue-500 outline-none transition-colors"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">Video File</label>
                        <div className="relative isolate">
                            <input
                                type="file" required accept="video/*"
                                onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                            />
                            <div className="border-2 border-dashed border-white/20 rounded-lg p-4 text-center hover:border-blue-500 transition-colors">
                                <Upload size={24} className="mx-auto mb-2 text-gray-400" />
                                <span className="text-sm text-gray-400">
                                    {videoFile ? videoFile.name : "Select Video"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Thumbnail (Image)</label>
                        <div className="relative isolate">
                            <input
                                type="file" accept="image/*"
                                onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                            />
                            <div className="border-2 border-dashed border-white/20 rounded-lg p-4 text-center hover:border-blue-500 transition-colors">
                                <Upload size={24} className="mx-auto mb-2 text-gray-400" />
                                <span className="text-sm text-gray-400">
                                    {thumbnailFile ? thumbnailFile.name : "Select Image"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <button
                    type="submit" disabled={isUploading}
                    className="w-full btn-primary py-3 flex items-center justify-center gap-2"
                >
                    {isUploading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
                    ) : (
                        <>
                            <Upload size={20} />
                            <span>Publish Video</span>
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
