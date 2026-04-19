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

export default function FileExplorerView({ initialFolder, initialView }: { initialFolder?: 'vertical' | 'horizontal'; initialView?: 'drive-d' }) {
  const [view, setView] = useState<ViewType>(initialView || (initialFolder ? 'media-gallery' : 'initial'));
  const [quickMessage, setQuickMessage] = useState('');
  const [mediaItems, setMediaItems] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [videoLoading, setVideoLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeVideo, setActiveVideo] = useState<MediaAsset | null>(null);
  const [currentFolder, setCurrentFolder] = useState<'vertical' | 'horizontal' | null>(initialFolder || null);
  const [filteredItems, setFilteredItems] = useState<MediaAsset[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const { openWindow } = useWindowManager();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (initialView === 'drive-d') {
      setView('drive-d');
    }
  }, [initialView]);

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ESC to close video player
      if (e.key === 'Escape' && activeVideo) {
        setActiveVideo(null);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeVideo]);


  const handleDriveClick = (driveLetter: string) => {
    if (driveLetter === 'C') {
      alert('Cannot access Local Disk (C:)\nAccess Denied');
      return;
    }
    setView('drive-d');
  };

  const handleFolderClick = async (folderType: 'vertical' | 'horizontal') => {
    setCurrentFolder(folderType);
    await loadAssets();
    setView('media-gallery');
  };

  const openPlayer = (item: MediaAsset) => {
    setActiveVideo(item);
  };

  const isReelItem = (item: MediaAsset) => /reel/i.test(item.id || item.folder || '');
  const isCinemaItem = (item: MediaAsset) => /cinema|horizontal|cut/i.test(item.id || item.folder || '');

  const filterMediaByFolder = (items: MediaAsset[]) => {
    if (currentFolder === 'vertical') {
      return items.filter(item => isReelItem(item));
    } else if (currentFolder === 'horizontal') {
      return items.filter(item => isCinemaItem(item));
    }
    return items;
  };

  const handleBack = () => {
    if (view === 'drive-d') {
      setView('initial');
    } else if (view === 'media-gallery') {
      setCurrentFolder(null);
      setView('drive-d');
    }
  };

  useEffect(() => {
    const filtered = filterMediaByFolder(mediaItems);
    setFilteredItems(filtered);
  }, [mediaItems, currentFolder]);

  const renderGallery = (items: MediaAsset[]) => {
    return (
      <div className="flex flex-col h-full bg-black/10">
        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-cyan-500/15 bg-black/20">
          <button
            onClick={handleBack}
            className="px-4 py-2 rounded bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-100 transition-all duration-200 text-sm min-h-[40px]"
            style={{ touchAction: 'manipulation' }}
          >
            ← Back
          </button>
          <h2 className="text-xl font-semibold text-cyan-50">Media Folder</h2>
          <div className="text-cyan-50/50 text-sm">{items.length} files</div>
        </div>



        {/* Reels and Videos Sections */}
        <div className="flex-1 overflow-auto p-5">
          {(() => {
            const renderSection = (title: string, sectionItems: MediaAsset[]) => {
              if (!sectionItems.length) return null;
              return (
                <div className="mb-6">
                  <div className="mb-3 text-sm uppercase tracking-wider text-cyan-50/60 font-medium">{title}</div>
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
                              <div className="w-full h-full flex items-center justify-center text-cyan-50/40 bg-black/40">
                                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                              </div>
                            )}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100">
                              <svg className="w-10 h-10 text-cyan-100/90" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          </div>
                          <div className="mt-2 text-xs sm:text-sm text-cyan-50" style={{ display: 'none' }}>{item.title}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            };

            return (
              <>
                {renderSection(currentFolder === 'horizontal' ? 'Horizontal Cuts' : 'Vertical Stories', filteredItems)}
              </>
            );
          })()}
        </div>

        {activeVideo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md" style={{ touchAction: 'manipulation' }}>
            <div 
              className="bg-black border border-cyan-500/20 rounded-lg flex flex-col relative"
              style={{ 
                width: '70vw', 
                height: '65vh',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                maxWidth: '900px',
                maxHeight: '600px'
              }}
            >
              <div className="flex items-center justify-end px-3 py-2 bg-black/90 border-b border-cyan-500/15 flex-shrink-0">
                <button
                  onClick={() => setActiveVideo(null)}
                  className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 rounded text-white transition-all duration-200 font-medium flex-shrink-0"
                  style={{ touchAction: 'manipulation' }}
                >
                  {isMobile ? '✕' : 'Close'}
                </button>
              </div>
              <div className="flex-1 bg-black overflow-hidden relative" style={{ minHeight: 0 }}>
                {videoLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full border-3 border-cyan-500/30 border-t-cyan-500 animate-spin"></div>
                      <span className="text-xs text-cyan-200">Loading video...</span>
                    </div>
                  </div>
                )}
                <video
                  className="w-full h-full"
                  style={{ objectFit: 'contain' }}
                  controls
                  autoPlay
                  muted
                  playsInline
                  poster={activeVideo.thumbnailUrl}
                  onLoadStart={() => setVideoLoading(true)}
                  onCanPlay={() => setVideoLoading(false)}
                >
                  <source src={activeVideo.videoUrl} type="video/mp4" />
                  Your browser does not support HTML video.
                </video>
              </div>
              {!isMobile && (
                <div className="text-[10px] text-cyan-100/40 px-3 py-2 bg-black/50 border-t border-cyan-500/10">
                  Press ESC to close
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="h-full flex items-center justify-center text-cyan-100 text-lg bg-gradient-to-br from-black/40 to-cyan-900/20">
          Loading videos from /media folders...
        </div>
      );
    }

    if (view === 'initial') {
      return (
        <div className="flex flex-col md:flex-row h-full">
          <div className="w-full md:w-48 bg-white/10 backdrop-blur-sm border-b md:border-b-0 md:border-r border-cyan-500/15 p-4">
            <div className="space-y-2">
              <div className="px-3 py-2 text-xs font-semibold text-cyan-100 uppercase tracking-wide">Quick Access</div>
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
              <div className="mb-4 text-sm text-cyan-300 bg-black/20 p-3 rounded border border-cyan-500/15 backdrop-blur-sm">{quickMessage}</div>
            )}
            <div className="grid grid-cols-2 gap-6">
              <div
                onClick={() => handleDriveClick('C')}
                className="flex items-center gap-3 p-4 rounded-lg hover:bg-white/10 cursor-pointer transition-all duration-200 hover:scale-105"
              >
                <img src="/Images/Local Disk C.png" alt="Local Disk C" className="w-10 h-10 object-contain" />
                <div>
                  <p className="text-sm font-semibold text-white">Local Disk (C:)</p>
                  <p className="text-xs text-cyan-100">OS Drive</p>
                </div>
              </div>
              <div
                onClick={() => handleDriveClick('D')}
                className="flex items-center gap-3 p-4 rounded-lg hover:bg-white/10 cursor-pointer transition-all duration-200 hover:scale-105"
              >
                <img src="/Images/Local Disk D.png" alt="Local Disk D" className="w-10 h-10 object-contain" />
                <div>
                  <p className="text-sm font-semibold text-white">Local Disk (D:)</p>
                  <p className="text-xs text-cyan-100">Storage</p>
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
            className="mb-4 px-4 py-2 bg-cyan-500/15 hover:bg-cyan-500/25 rounded text-sm font-medium text-cyan-100 transition-all duration-200 hover:scale-105 backdrop-blur-sm border border-cyan-500/20 min-h-[40px]"
            style={{ touchAction: 'manipulation' }}
          >
             Back
          </button>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Local Disk (D:)</h2>
            <button
              onClick={loadAssets}
              className="px-3 py-1 text-xs font-semibold bg-cyan-500/20 hover:bg-cyan-500/30 rounded min-h-[40px] text-cyan-100"
              style={{ touchAction: 'manipulation' }}
            >
              Refresh Media
            </button>
          </div>
          {errorMessage && (
            <div className="mb-4 text-sm text-cyan-200 bg-black/40 p-2 rounded border border-cyan-500/20">{errorMessage}</div>
          )}
          <div className="grid grid-cols-3 gap-6">
            <div
              onClick={() => handleFolderClick('vertical')}
              className="flex flex-col items-center gap-3 p-4 rounded-lg hover:bg-white/10 cursor-pointer transition-all duration-200 hover:scale-105 backdrop-blur-sm"
              style={{ touchAction: 'manipulation' }}
            >
              <div className="text-5xl">📁</div>
              <span className="text-sm font-medium text-white text-center">Vertical Stories</span>
            </div>
            <div
              onClick={() => handleFolderClick('horizontal')}
              className="flex flex-col items-center gap-3 p-4 rounded-lg hover:bg-white/10 cursor-pointer transition-all duration-200 hover:scale-105 backdrop-blur-sm"
              style={{ touchAction: 'manipulation' }}
            >
              <div className="text-5xl">📁</div>
              <span className="text-sm font-medium text-white text-center">Horizontal Cuts</span>
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
              className="mt-4 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 rounded text-sm text-cyan-100"
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
