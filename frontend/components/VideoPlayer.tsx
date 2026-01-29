'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, RotateCw, SkipBack, SkipForward, Volume2, Maximize } from 'lucide-react';

interface VideoPlayerProps {
    src: string;
    onNext?: () => void;
    onPrev?: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, onNext, onPrev }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);

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

    const skip = (amount: number) => {
        if (videoRef.current) {
            videoRef.current.currentTime += amount;
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const current = videoRef.current.currentTime;
            const total = videoRef.current.duration;
            setProgress((current / total) * 100);
        }
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (videoRef.current) {
            const time = (Number(e.target.value) / 100) * duration;
            videoRef.current.currentTime = time;
            setProgress(Number(e.target.value));
        }
    };

    return (
        <div className="relative group w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
            <video
                ref={videoRef}
                src={src}
                className="w-full h-full"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onClick={togglePlay}
            />

            {/* Controls Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {/* Progress Bar */}
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={progress}
                    onChange={handleSeek}
                    className="w-full h-1 mb-4 accent-primary-500 cursor-pointer"
                />

                <div className="flex items-center justify-between text-white">
                    <div className="flex items-center space-x-6">
                        <button onClick={onPrev} className="hover:text-primary-400"><SkipBack size={24} /></button>
                        <button onClick={() => skip(-10)} className="hover:text-primary-400"><RotateCcw size={24} /></button>
                        <button onClick={togglePlay} className="p-2 bg-primary-500 rounded-full hover:bg-primary-600 transition-colors">
                            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                        </button>
                        <button onClick={() => skip(10)} className="hover:text-primary-400"><RotateCw size={24} /></button>
                        <button onClick={onNext} className="hover:text-primary-400"><SkipForward size={24} /></button>
                    </div>

                    <div className="flex items-center space-x-4">
                        <Volume2 size={24} className="hover:text-primary-400 cursor-pointer" />
                        <Maximize size={24} className="hover:text-primary-400 cursor-pointer" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoPlayer;
