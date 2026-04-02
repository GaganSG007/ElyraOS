'use client';

import { useState } from 'react';
import { useWindowManager } from '@/context/WindowContext';
import { verticalLinks } from '@/data/verticalLinks';
import { horizontalLinks } from '@/data/horizontalLinks';
import { parseLink } from '@/utils/linkParser';

type ViewType = 'initial' | 'drive-d' | 'vertical-stories' | 'cinematic-cuts';

type LinkEntry = {
  url: string;
  thumbnail?: string;
  title?: string;
  orientation: 'vertical' | 'horizontal';
};

const fallbackThumbnail = '/Images/thumbnails/fallback.jpg';

function FolderIcon({ type }: { type: 'vertical' | 'horizontal' }) {
  return (
    <div className="w-16 h-16 flex items-center justify-center bg-white/10 rounded-xl border border-purple-300/40">
      {type === 'vertical' ? (
        <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10 text-indigo-200">
          <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" stroke="currentColor" strokeWidth="1.5" />
          <path d="M7 8v8" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10 text-emerald-200">
          <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" stroke="currentColor" strokeWidth="1.5" />
          <path d="M17 8v8" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      )}
    </div>
  );
}

function GalleryItem({ thumbnail, title, orientation, onOpen }: {
  thumbnail?: string;
  title?: string;
  orientation: 'vertical' | 'horizontal';
  onOpen: () => void;
}) {
  const [isHovering, setIsHovering] = useState(false);
  const [src, setSrc] = useState(thumbnail || fallbackThumbnail);
  const aspectClass = orientation === 'vertical' ? 'aspect-[9/16]' : 'aspect-[16/9]';

  const onError = () => {
    if (src !== fallbackThumbnail) {
      setSrc(fallbackThumbnail);
    }
  };

  return (
    <button
      onClick={onOpen}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className="rounded-lg overflow-hidden transition-all duration-150 ease-out hover:scale-105 hover:brightness-105"
      style={{
        boxShadow: isHovering ? '0 14px 28px rgba(0,0,0,0.3)' : '0 6px 14px rgba(0,0,0,0.2)',
      }}
    >
      <div className={`${aspectClass} relative bg-black/10`}>
        <img
          src={src}
          alt={title || 'Media thumbnail'}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={onError}
        />
      </div>
      {title && <div className="px-2 py-1 bg-black/40 text-white text-xs font-medium truncate">{title}</div>}
    </button>
  );
}

export default function FileExplorer() {
  const [view, setView] = useState<ViewType>('initial');
  const [quickMessage, setQuickMessage] = useState('');
  const [customLinks, setCustomLinks] = useState<LinkEntry[]>([]);
  const [newLink, setNewLink] = useState<LinkEntry>({ url: '', title: '', thumbnail: '', orientation: 'vertical' });
  const { openWindow } = useWindowManager();

  const handleFolderClick = (folder: ViewType) => setView(folder);
  const handleBack = () => {
    if (view === 'drive-d') setView('initial');
    else setView('drive-d');
  };

  const openBrowser = (link: LinkEntry) => {
    const parsed = parseLink(link.url);
    const thumbnail = link.thumbnail || parsed.thumbnail || fallbackThumbnail;
    const title = link.title || parsed.title || 'Viewer';

    openWindow('browser', `browser-${Date.now()}`, {
      url: parsed.embedUrl || link.url,
      originalUrl: link.url,
      iframeAllowed: parsed.iframeAllowed,
      thumbnail,
      platform: parsed.type,
      title,
    });
  };

  const folderCard = (name: string, type: 'vertical' | 'horizontal', target: ViewType) => (
    <div
      onClick={() => handleFolderClick(target)}
      className="w-[120px] flex flex-col items-center gap-2 p-3 rounded-lg cursor-pointer bg-white/10 border border-transparent hover:border-purple-300/40 hover:bg-white/15 hover:scale-105 hover:shadow-lg transition-all duration-200"
    >
      <FolderIcon type={type} />
      <span className="text-center text-sm text-white font-semibold">{name}</span>
    </div>
  );

  const renderGallery = (items: Array<any>, orientation: 'vertical' | 'horizontal') => {
    const customItems = customLinks.filter((link) => link.orientation === orientation);
    const allItems = [...items, ...customItems];

    return (
      <div className="flex flex-col h-full bg-black/20">
      <div className="px-5 py-4 flex items-center justify-between border-b border-white/15">
        <button onClick={handleBack} className="px-4 py-2 rounded bg-white/10 hover:bg-white/20 text-white transition-all duration-200">
          ← Back
        </button>
        <div>
          <h2 className="text-xl font-semibold text-white">{orientation === 'vertical' ? 'Vertical Stories' : 'Cinematic Cuts'}</h2>
          <p className="text-xs text-purple-200">{items.length} items</p>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-5">
        <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}>
              {allItems.map((link, idx) => {
                const parsed = parseLink(link.url);
                const thumbnail = link.thumbnail || parsed.thumbnail || fallbackThumbnail;
                const title = link.title || parsed.title || 'Viewer';
                return (
                  <GalleryItem
                    key={`${orientation}-${idx}`}
                    thumbnail={thumbnail}
                    title={title}
                    orientation={orientation}
                    onOpen={() => openBrowser(link)}
                  />
                );
              })}
        </div>
      </div>
    </div>
  );
};

  const addNewLink = () => {
    if (!newLink.url.trim()) {
      setQuickMessage('URL is required to add a link.');
      return;
    }

    setCustomLinks((prev) => [...prev, newLink]);
    setNewLink({ url: '', title: '', thumbnail: '', orientation: 'vertical' });
    setQuickMessage('Custom link added successfully.');
  };

  const renderContent = () => {
    if (view === 'initial') {
      return (
        <div className="flex h-full">
          <div className="w-64 bg-white/10 backdrop-blur-sm border-r border-white/20 p-4">
            <div className="space-y-2">
              <div className="px-3 py-2 text-xs font-semibold text-purple-200 uppercase tracking-wide">Quick Access</div>
              {['Quick Access', 'Documents', 'Videos'].map((item) => (
                <div
                  key={item}
                  onClick={() => setQuickMessage('This section is not available in this system')}
                  className="px-3 py-2 text-sm text-white hover:bg-white/10 rounded cursor-pointer transition-all duration-200"
                >
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-5 bg-black/20 p-3 rounded-lg border border-purple-300/30">
              <div className="text-xs text-purple-200 mb-2">Add manual link</div>
              <input
                value={newLink.url}
                onChange={(e) => setNewLink((prev) => ({ ...prev, url: e.target.value }))}
                placeholder="URL"
                className="w-full px-2 py-1 mb-2 rounded bg-black/30 border border-purple-300/30 text-white text-xs"
              />
              <input
                value={newLink.title}
                onChange={(e) => setNewLink((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Title"
                className="w-full px-2 py-1 mb-2 rounded bg-black/30 border border-purple-300/30 text-white text-xs"
              />
              <input
                value={newLink.thumbnail}
                onChange={(e) => setNewLink((prev) => ({ ...prev, thumbnail: e.target.value }))}
                placeholder="Thumbnail URL (optional)"
                className="w-full px-2 py-1 mb-2 rounded bg-black/30 border border-purple-300/30 text-white text-xs"
              />
              <select
                value={newLink.orientation}
                onChange={(e) => setNewLink((prev) => ({ ...prev, orientation: e.target.value as 'vertical' | 'horizontal' }))}
                className="w-full px-2 py-1 mb-2 rounded bg-black/30 border border-purple-300/30 text-white text-xs"
              >
                <option value="vertical">Vertical</option>
                <option value="horizontal">Horizontal</option>
              </select>
              <button
                onClick={addNewLink}
                className="w-full py-1 px-2 rounded bg-purple-500/70 hover:bg-purple-500 text-white text-xs"
              >
                Add Link
              </button>
            </div>
          </div>
          <div className="flex-1 p-6 flex flex-col h-full">
            <h2 className="text-xl font-semibold text-white mb-4">This PC</h2>
            {quickMessage && <div className="mb-4 text-sm text-green-300 bg-black/20 p-3 rounded border border-purple-300/30">{quickMessage}</div>}
            <div className="flex-1 overflow-auto">
              <div className="flex flex-wrap gap-5">
                {folderCard('Vertical Stories', 'vertical', 'vertical-stories')}
                {folderCard('Cinematic Cuts', 'horizontal', 'cinematic-cuts')}
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (view === 'drive-d') {
      return (
        <div className="flex flex-col h-full p-6">
          <button onClick={handleBack} className="mb-4 px-4 py-2 rounded bg-white/10 hover:bg-white/20 text-sm text-white transition-all duration-200 w-max">← Back</button>
          <h2 className="text-2xl text-white font-semibold mb-2">Local Disk (D:)</h2>
          <p className="text-sm text-purple-200 mb-4">Select a folder to open</p>
          <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))' }}>
            {folderCard('Vertical Stories', 'vertical', 'vertical-stories')}
            {folderCard('Cinematic Cuts', 'horizontal', 'cinematic-cuts')}
          </div>
        </div>
      );
    }

    if (view === 'vertical-stories') return renderGallery(verticalLinks, 'vertical');
    if (view === 'cinematic-cuts') return renderGallery(horizontalLinks, 'horizontal');

    return null;
  };

  return <div className="h-full flex flex-col bg-black/20">{renderContent()}</div>;
}
