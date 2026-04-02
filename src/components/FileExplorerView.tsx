'use client';

import { useEffect, useState } from 'react';
import { useWindowManager } from '@/context/WindowContext';
import SteamMediaCard from './SteamMediaCard';

type MediaAsset = {
  id: string;
  title: string;
  videoUrl: string;
  thumbnailUrl: string;
  orientation?: 'horizontal' | 'vertical' | 'unknown';
  folder?: string;
};

type ViewType = 'initial' | 'drive-d' | 'media-gallery';

export default function FileExplorerView() {
  const [view, setView] = useState<ViewType>('initial');
  const [quickMessage, setQuickMessage] = useState('');
  const [mediaItems, setMediaItems] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeVideo, setActiveVideo] = useState<MediaAsset | null>(null);
  const [orientationFilter, setOrientationFilter] = useState<'all' | 'horizontal' | 'vertical'>('all');
  const { openWindow } = useWindowManager();

  const loadAssets = async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/media');
      if (!res.ok) throw new Error('Failed to load media list');
      const data = await res.json();

      setMediaItems(data.items || []);

      if (!data.items || !data.items.length) {
        setErrorMessage('No media files found in /public/media');
      }
    } catch (err) {
      setMediaItems([]);
      setErrorMessage('Could not load media list. Check the console.');
      console.error('loadAssets error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssets();
  }, []);


  const handleDriveClick = (driveLetter: string) => {
    if (driveLetter === 'C') {
      alert('Cannot access Local Disk (C:)\nAccess Denied');
      return;
    }
    setView('drive-d');
  };

  const handleFolderClick = async () => {
    await loadAssets();
    setView('media-gallery');
  };

  const openPlayer = (item: MediaAsset) => {
    setActiveVideo(item);
  };

  const isReelItem = (item: MediaAsset) => /reel|video/i.test(item.folder || item.id || '');
  const isVideoItem = (item: MediaAsset) => /video/i.test(item.folder || item.id || '');

  const handleBack = () => {
    if (view === 'drive-d') {
      setView('initial');
    } else if (view === 'media-gallery') {
      setView('drive-d');
    }
  };

  const renderGallery = (items: MediaAsset[]) => {
    return (
      <div className="flex flex-col h-full bg-black/20">
        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-purple-300/30 bg-black/40">
          <button
            onClick={handleBack}
            className="px-4 py-2 rounded bg-white/10 hover:bg-white/20 text-white transition-all duration-200 text-sm min-h-[40px]"
            style={{ touchAction: 'manipulation' }}
          >
            ← Back
          </button>
          <h2 className="text-xl font-semibold text-white">Media Folder</h2>
          <div className="text-purple-300 text-sm">{items.length} files</div>
        </div>

        <div className="px-5 py-3 bg-black/30 border-b border-purple-400/20 flex gap-2">
          {(['all', 'horizontal', 'vertical'] as const).map((option) => (
            <button
              key={option}
              onClick={() => setOrientationFilter(option)}
              className={`px-4 py-2 rounded-full text-xs font-semibold uppercase transition min-h-[40px] ${
                orientationFilter === option
                  ? 'bg-white/20 text-white'
                  : 'bg-white/10 text-purple-100 hover:bg-white/20'
              }`}
              style={{ touchAction: 'manipulation' }}
            >
              {option === 'all' ? 'All' : option === 'horizontal' ? 'Horizontal' : 'Vertical'}
            </button>
          ))}
        </div>

        {/* Reels and Videos Sections */}
        <div className="flex-1 overflow-auto p-5">
          {(() => {
            const filteredItems = items.filter((item) => orientationFilter === 'all' || item.orientation === orientationFilter);
            const reelItems = filteredItems.filter(isReelItem);
            const videoItems = filteredItems.filter((item) => isVideoItem(item) && !isReelItem(item));
            const otherItems = filteredItems.filter((item) => !isReelItem(item) && !isVideoItem(item));

            const renderSection = (title: string, sectionItems: MediaAsset[]) => {
              if (!sectionItems.length) return null;
              return (
                <div className="mb-6">
                  <div className="mb-3 text-sm uppercase tracking-wider text-purple-200 font-medium">{title}</div>
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {sectionItems.map((item, idx) => (
                      <div key={`${title}-${idx}`} className="group">
                        <div className="relative cursor-pointer" onClick={() => openPlayer(item)} style={{ touchAction: 'manipulation' }}>
                          <div className="relative overflow-hidden rounded-lg bg-transparent">
                            {item.thumbnailUrl ? (
                              <img
                                src={item.thumbnailUrl}
                                alt={item.title}
                                className="w-full h-auto object-contain transition-transform duration-200 group-hover:scale-105"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-purple-400 bg-slate-800">
                                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                              </div>
                            )}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100">
                              <svg className="w-10 h-10 text-white/90" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          </div>
                          <div className="mt-2 text-xs sm:text-sm text-white truncate">{item.title}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            };

            return (
              <>
                {renderSection('Reels', reelItems)}
                {renderSection('Videos', videoItems)}
                {otherItems.length > 0 && renderSection('Other media', otherItems)}
              </>
            );
          })()}
        </div>

        {activeVideo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-2 sm:p-4">
            <div className="w-full max-w-xl sm:max-w-3xl bg-gray-900 border border-purple-400/40 rounded-lg overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between px-3 py-2 bg-black/90 border-b border-purple-300/20 text-xs sm:text-sm">
                <div className="text-white text-xs sm:text-sm font-semibold">Playing: {activeVideo.title}</div>
                <button
                  onClick={() => setActiveVideo(null)}
                  className="px-3 py-1 text-xs bg-red-600 hover:bg-red-500 rounded text-white"
                >
                  Close
                </button>
              </div>
              <div className="bg-black p-4">
                <video
                  className="w-full h-96 bg-black"
                  controls
                  autoPlay
                  muted
                  playsInline
                  poster={activeVideo.thumbnailUrl}
                >
                  <source src={activeVideo.videoUrl} type="video/mp4" />
                  Your browser does not support HTML video.
                </video>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="h-full flex items-center justify-center text-white text-lg">
          Loading videos from /media folders...
        </div>
      );
    }

    if (view === 'initial') {
      return (
        <div className="flex flex-col md:flex-row h-full">
          <div className="w-full md:w-48 bg-white/10 backdrop-blur-sm border-b md:border-b-0 md:border-r border-purple-300/30 p-4">
            <div className="space-y-2">
              <div className="px-3 py-2 text-xs font-semibold text-purple-200 uppercase tracking-wide">Quick Access</div>
              <div
                className="px-3 py-2 text-sm text-white hover:bg-white/10 rounded cursor-pointer transition-all duration-200 hover:scale-105"
                onClick={() => setQuickMessage('This section is not available in this system')}
              >
                Quick Access
              </div>
              <div
                className="px-3 py-2 text-sm text-white hover:bg-white/10 rounded cursor-pointer transition-all duration-200 hover:scale-105"
                onClick={() => setQuickMessage('This section is not available in this system')}
              >
                Documents
              </div>
              <div
                className="px-3 py-2 text-sm text-white hover:bg-white/10 rounded cursor-pointer transition-all duration-200 hover:scale-105"
                onClick={() => setQuickMessage('This section is not available in this system')}
              >
                Videos
              </div>
            </div>
          </div>

          <div className="flex-1 p-6">
            <h2 className="text-xl font-semibold text-white mb-6">This PC</h2>
            {quickMessage && (
              <div className="mb-4 text-sm text-green-300 bg-black/20 p-3 rounded border border-purple-300/30 backdrop-blur-sm">{quickMessage}</div>
            )}
            <div className="grid grid-cols-2 gap-6">
              <div
                onClick={() => handleDriveClick('C')}
                className="flex items-center gap-3 p-4 rounded-lg hover:bg-white/10 cursor-pointer transition-all duration-200 hover:scale-105"
              >
                <img src="/Images/Local Disk C.png" alt="Local Disk C" className="w-10 h-10 object-contain" />
                <div>
                  <p className="text-sm font-semibold text-white">Local Disk (C:)</p>
                  <p className="text-xs text-purple-200">OS Drive</p>
                </div>
              </div>
              <div
                onClick={() => handleDriveClick('D')}
                className="flex items-center gap-3 p-4 rounded-lg hover:bg-white/10 cursor-pointer transition-all duration-200 hover:scale-105"
              >
                <img src="/Images/Local Disk D.png" alt="Local Disk D" className="w-10 h-10 object-contain" />
                <div>
                  <p className="text-sm font-semibold text-white">Local Disk (D:)</p>
                  <p className="text-xs text-purple-200">Storage</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (view === 'drive-d') {
      return (
        <div className="p-6">
          <button
            onClick={handleBack}
            className="mb-4 px-4 py-2 bg-white/10 hover:bg-white/20 rounded text-sm font-medium text-white transition-all duration-200 hover:scale-105 backdrop-blur-sm border border-purple-300/30 min-h-[40px]"
            style={{ touchAction: 'manipulation' }}
          >
             Back
          </button>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Local Disk (D:)</h2>
            <button
              onClick={loadAssets}
              className="px-3 py-1 text-xs font-semibold bg-purple-600 hover:bg-purple-500 rounded min-h-[40px]"
              style={{ touchAction: 'manipulation' }}
            >
              Refresh Media
            </button>
          </div>
          {errorMessage && (
            <div className="mb-4 text-sm text-orange-200 bg-black/40 p-2 rounded border border-orange-300/30">{errorMessage}</div>
          )}
          <div className="grid grid-cols-3 gap-6">
            <div
              onClick={handleFolderClick}
              className="flex flex-col items-center gap-3 p-4 rounded-lg hover:bg-white/10 cursor-pointer transition-all duration-200 hover:scale-105 backdrop-blur-sm"
              style={{ touchAction: 'manipulation' }}
            >
              <div className="text-5xl">📁</div>
              <span className="text-sm font-medium text-white text-center">Media Reels</span>
            </div>
          </div>
        </div>
      );
    }

    if (view === 'media-gallery') {
      if (!mediaItems.length) {
        return (
          <div className="h-full flex flex-col items-center justify-center text-white text-center p-8 gap-4">
            <div className="text-3xl">📁</div>
            <div>No media files in /public/media</div>
            <div className="text-sm text-slate-300">Current count: {mediaItems.length}</div>
            <div className="text-sm text-slate-200">Add files like:</div>
            <div className="text-xs text-slate-400 font-mono">reel1.mp4 + reel1.jpg</div>
            <div className="text-xs text-slate-400 font-mono">reel2.mp4 + reel2.jpg</div>
            <button
              onClick={() => {
                loadAssets();
              }}
              className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded text-sm"
            >
              Refresh
            </button>
          </div>
        );
      }
      return renderGallery(mediaItems);
    }

    return null;
  };

  return <div className="h-full bg-black/20">{renderContent()}</div>;
}
