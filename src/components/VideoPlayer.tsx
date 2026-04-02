'use client';

import { Video } from '@/data/videos';
import { useState } from 'react';

interface VideoPlayerProps {
  video: Video | null;
  onClose: () => void;
}

export default function VideoPlayer({ video, onClose }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  if (!video) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
      <div className="bg-gray-900 rounded-lg shadow-2xl overflow-hidden w-full max-w-2xl border border-gray-700">
        {/* Window header */}
        <div className="bg-gray-800 px-4 py-3 flex justify-between items-center border-b border-gray-700">
          <span className="text-sm font-medium text-gray-300">{video.title}</span>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Video container */}
        <div className="relative bg-black aspect-video flex items-center justify-center">
          <video
            src={video.url}
            controls
            autoPlay
            className="w-full h-full"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        </div>

        {/* Info panel */}
        <div className="bg-gray-800 px-6 py-4 border-t border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-2">{video.title}</h3>
          <p className="text-sm text-gray-400 mb-4">{video.description}</p>
          {video.link && (
            <a
              href={video.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
            >
              View More
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
