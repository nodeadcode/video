'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { Upload, X, ChevronLeft, Loader2 } from 'lucide-react';

export default function UploadPage() {
    const router = useRouter();
    const { token, user } = useAuth();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isPublic, setIsPublic] = useState(true);
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [thumbFile, setThumbFile] = useState<File | null>(null);

    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!videoFile) return setError('Please select a video file');

        setIsUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('is_public', String(isPublic));
        formData.append('video_file', videoFile);
        if (thumbFile) formData.append('thumbnail_file', thumbFile);

        try {
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/videos/`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            router.push('/admin');
        } catch (err) {
            setError('Upload failed. Check file size and format.');
        } finally {
            setIsUploading(false);
        }
    };

    if (!user?.is_admin) return <div className="py-20 text-center text-red-600">Access Denied</div>;

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <button
                onClick={() => router.back()}
                className="flex items-center text-gray-500 hover:text-primary-600 transition-colors"
            >
                <ChevronLeft size={20} />
                <span>Back to Dashboard</span>
            </button>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Upload New Video</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Title</label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                            placeholder="Enter video title"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all h-32 resize-none"
                            placeholder="Enter video description"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Video File</label>
                            <div className="relative">
                                <input
                                    type="file"
                                    accept="video/*"
                                    onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                                    className="hidden"
                                    id="video-upload"
                                />
                                <label
                                    htmlFor="video-upload"
                                    className="flex items-center justify-center w-full px-4 py-3 bg-primary-50 text-primary-600 border-2 border-dashed border-primary-200 rounded-xl cursor-pointer hover:bg-primary-100 transition-colors"
                                >
                                    <Upload size={20} className="mr-2" />
                                    <span className="truncate">{videoFile ? videoFile.name : 'Choose Video'}</span>
                                </label>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Thumbnail (Optional)</label>
                            <div className="relative">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setThumbFile(e.target.files?.[0] || null)}
                                    className="hidden"
                                    id="thumb-upload"
                                />
                                <label
                                    htmlFor="thumb-upload"
                                    className="flex items-center justify-center w-full px-4 py-3 bg-gray-50 text-gray-600 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors"
                                >
                                    <Upload size={20} className="mr-2" />
                                    <span className="truncate">{thumbFile ? thumbFile.name : 'Choose Thumbnail'}</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <input
                            type="checkbox"
                            id="isPublic"
                            checked={isPublic}
                            onChange={(e) => setIsPublic(e.target.checked)}
                            className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                        />
                        <label htmlFor="isPublic" className="text-sm text-gray-700">Make this video public</label>
                    </div>

                    {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}

                    <button
                        type="submit"
                        disabled={isUploading}
                        className="w-full flex items-center justify-center space-x-2 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-200"
                    >
                        {isUploading ? (
                            <>
                                <Loader2 size={24} className="animate-spin" />
                                <span>Uploading...</span>
                            </>
                        ) : (
                            <>
                                <Upload size={24} />
                                <span>Publish Video</span>
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
