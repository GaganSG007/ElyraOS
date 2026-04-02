'use client';

import { useEffect, useRef, useState } from 'react';

type VideoPlayerWindowProps = {
  videoUrl: string;
  thumbnailUrl?: string;
  title?: string;
  orientation?: 'vertical' | 'horizontal';
};

export default function VideoPlayerWindow({ videoUrl, thumbnailUrl, title, orientation = 'horizontal' }: VideoPlayerWindowProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const [videoError, setVideoError] = useState<string | null>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const target = e.target as HTMLVideoElement;
    const error = target.error;
    let errorMessage = 'Unknown video error';

    if (error) {
      switch (error.code) {
        case MediaError.MEDIA_ERR_ABORTED:
          errorMessage = 'Video loading aborted';
          break;
        case MediaError.MEDIA_ERR_NETWORK:
          errorMessage = 'Network error while loading video';
          break;
        case MediaError.MEDIA_ERR_DECODE:
          errorMessage = 'Video decode error';
          break;
        case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
          errorMessage = 'Video format not supported';
          break;
        default:
          errorMessage = `Video error: ${error.message}`;
      }
    }

    console.error('🎬 Video error:', errorMessage, 'Code:', error?.code);
    setVideoError(errorMessage);
  };

  const handleVideoLoadStart = () => {
    console.log('🎬 Video load start');
    setVideoError(null);
    setIsVideoLoaded(false);
  };

  const handleVideoCanPlay = () => {
    console.log('🎬 Video can play');
    setIsVideoLoaded(true);
  };

  const handleVideoPlay = () => {
    console.log('🎬 Video started playing');
  };

  const handleManualPlay = () => {
    if (videoRef.current) {
      console.log('🎬 Manual play clicked');
      videoRef.current.play().catch((e) => {
        console.error('🎬 Manual play failed:', e);
        setVideoError('Failed to play video: ' + (e as Error).message);
      });
    }
  };


  return (
    <div className="h-full w-full bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center p-4">
      <div className="w-full h-full max-w-md bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-2xl flex flex-col items-center justify-center p-6">
        <div className="text-white text-2xl font-bold mb-4 text-center">🎬 VIDEO PLAYER WINDOW</div>
        <div className="text-white text-lg mb-4 text-center">Video: {videoUrl}</div>
        <div className="w-full bg-black rounded-lg overflow-hidden relative">
          <video
            ref={videoRef}
            poster={thumbnailUrl}
            className="w-full h-60 object-contain bg-black"
            controls
            preload="metadata"
            autoPlay
            muted
            playsInline
            onError={handleVideoError}
            onLoadStart={handleVideoLoadStart}
            onCanPlay={handleVideoCanPlay}
            onPlay={handleVideoPlay}
            onLoadedData={() => console.log('🎬 Video loaded data')}
            onWaiting={() => console.log('🎬 Video waiting')}
            onStalled={() => console.log('🎬 Video stalled')}
          >
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support HTML5 video.
          </video>
          {!isVideoLoaded && !videoError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="text-white text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                <div>Loading video...</div>
              </div>
            </div>
          )}
          {videoError && (
            <div className="absolute inset-0 flex items-center justify-center bg-red-900/80">
              <div className="text-white text-center p-4">
                <div className="text-red-300 mb-2">❌ Video Error</div>
                <div className="text-sm">{videoError}</div>
                <button
                  onClick={handleManualPlay}
                  className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                >
                  Try Play Again
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="text-white text-sm mt-4 text-center opacity-75">
          If you can see this, the component is rendering!
        </div>
      </div>
    </div>
  );
}
