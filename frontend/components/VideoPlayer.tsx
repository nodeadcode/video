"use client";

import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, RotateCw, SkipBack, SkipForward, Volume2, Maximize } from 'lucide-react';

interface VideoPlayerProps {
    src: string;
    onNext?: () => void;
    onPrev?: () => void;
}

export default function VideoPlayer({ src, onNext, onPrev }: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [volume, setVolume] = useState(1);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const skip = (seconds: number) => {
        if (videoRef.current) {
            videoRef.current.currentTime += seconds;
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const current = videoRef.current.currentTime;
            const duration = videoRef.current.duration;
            setProgress((current / duration) * 100);
        }
    };

    const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (videoRef.current) {
            const newTime = (Number(e.target.value) / 100) * videoRef.current.duration;
            videoRef.current.currentTime = newTime;
            setProgress(Number(e.target.value));
        }
    };

    return (
        <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden group">
            <video
                ref={videoRef}
                src={src}
                className="w-full h-full"
                onTimeUpdate={handleTimeUpdate}
                onClick={togglePlay}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
            />

            {/* Overlay Controls */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Progress Bar */}
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={progress}
                    onChange={handleProgressChange}
                    className="w-full h-1 bg-gray-600 appearance-none cursor-pointer rounded-lg mb-4 accent-blue-500"
                />

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={onPrev} className="text-white hover:text-blue-400 disabled:opacity-50" disabled={!onPrev}>
                            <SkipBack fill="currentColor" />
                        </button>
                        <button onClick={() => skip(-10)} className="text-white hover:text-blue-400">
                            <RotateCcw />
                        </button>
                        <button onClick={togglePlay} className="text-white hover:text-blue-400">
                            {isPlaying ? <Pause fill="currentColor" /> : <Play fill="currentColor" />}
                        </button>
                        <button onClick={() => skip(10)} className="text-white hover:text-blue-400">
                            <RotateCw />
                        </button>
                        <button onClick={onNext} className="text-white hover:text-blue-400 disabled:opacity-50" disabled={!onNext}>
                            <SkipForward fill="currentColor" />
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 group/vol">
                            <Volume2 size={20} className="text-white" />
                            <input
                                type="range" min="0" max="1" step="0.1" value={volume}
                                onChange={(e) => {
                                    const v = Number(e.target.value);
                                    setVolume(v);
                                    if (videoRef.current) videoRef.current.volume = v;
                                }}
                                className="w-20 h-1 bg-gray-600 appearance-none cursor-pointer rounded-lg accent-blue-500"
                            />
                        </div>
                        <button onClick={() => videoRef.current?.requestFullscreen()} className="text-white hover:text-blue-400">
                            <Maximize size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
