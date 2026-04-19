'use client';

import { useRef, useState } from 'react';

type VideoPlayerWindowProps = {
  videoUrl: string;
  thumbnailUrl?: string;
  title?: string;
  orientation?: 'vertical' | 'horizontal';
};

export default function VideoPlayerWindow({ videoUrl, thumbnailUrl, title, orientation = 'horizontal' }: VideoPlayerWindowProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <div className="h-full w-full bg-black flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 px-4 py-3 border-b border-gray-700 flex-shrink-0">
        <h2 className="text-white font-semibold text-sm">{title || 'Video Player'}</h2>
      </div>

      {/* Video Container - Let video element handle everything */}
      <div className="flex-1 bg-black overflow-auto flex items-center justify-center p-4">
        <video
          ref={videoRef}
          src={videoUrl}
          poster={thumbnailUrl}
          controls
          autoPlay
          playsInline
          style={{ 
            maxWidth: '100%',
            maxHeight: '100%',
            width: 'auto',
            height: 'auto'
          }}
        />
      </div>
    </div>
  );
}
