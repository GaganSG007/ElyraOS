'use client';

import { useState } from 'react';

type MediaPlayerProps = {
  url: string;
  title?: string;
  thumbnail?: string;
  platform?: string;
  orientation?: 'vertical' | 'horizontal';
};

export default function MediaPlayer({ url, title, thumbnail, platform, orientation }: MediaPlayerProps) {
  const [activeTab, setActiveTab] = useState<'player' | 'browser'>('player');
  const [browserUrl, setBrowserUrl] = useState(url);
  const [browserHistory, setBrowserHistory] = useState<string[]>([url]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [iframeError, setIframeError] = useState(false);

  const goBack = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setBrowserUrl(browserHistory[historyIndex - 1]);
    }
  };

  const goForward = () => {
    if (historyIndex < browserHistory.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setBrowserUrl(browserHistory[historyIndex + 1]);
    }
  };

  const navigateTo = (newUrl: string) => {
    const newHistory = browserHistory.slice(0, historyIndex + 1);
    newHistory.push(newUrl);
    setBrowserHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setBrowserUrl(newUrl);
    setIframeError(false);
  };

  const handleUrlChange = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const target = e.currentTarget.value;
      let urlToNavigate = target;
      if (!urlToNavigate.startsWith('http')) {
        urlToNavigate = 'https://' + urlToNavigate;
      }
      navigateTo(urlToNavigate);
    }
  };

  const isVertical = orientation === 'vertical';

  return (
    <div className="h-full flex flex-col bg-black/30 rounded-lg overflow-hidden border border-purple-300/30">
      {/* Tabs */}
      <div className="flex border-b border-purple-300/30 bg-black/50">
        <button
          onClick={() => setActiveTab('player')}
          className={`flex-1 py-2 px-3 text-sm font-medium transition-all ${
            activeTab === 'player'
              ? 'bg-purple-500/50 text-white border-b-2 border-purple-400'
              : 'text-purple-200 hover:bg-white/10'
          }`}
        >
          Player
        </button>
        <button
          onClick={() => setActiveTab('browser')}
          className={`flex-1 py-2 px-3 text-sm font-medium transition-all ${
            activeTab === 'browser'
              ? 'bg-purple-500/50 text-white border-b-2 border-purple-400'
              : 'text-purple-200 hover:bg-white/10'
          }`}
        >
          Browser
        </button>
      </div>

      {/* Player Tab */}
      {activeTab === 'player' && (
        <div className={`flex-1 flex flex-col ${isVertical ? 'h-full' : 'h-full'}`}>
          {/* Video/Content Area */}
          <div className={`flex-1 bg-black/80 flex items-center justify-center overflow-hidden ${isVertical ? '' : ''}`}>
            {thumbnail ? (
              <div className="w-full h-full relative group">
                <img src={thumbnail} alt={title || 'Media'} className="w-full h-full object-contain" />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 flex items-center justify-center transition-all">
                  <div className="text-6xl text-white/80">▶</div>
                </div>
              </div>
            ) : (
              <div className="text-white/50 text-center">
                <div className="text-6xl mb-3">📹</div>
                <div className="text-sm">No preview available</div>
                <div className="text-xs text-purple-300 mt-2">Use Browser tab to view content</div>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="bg-black/60 px-4 py-3 border-t border-purple-300/30">
            <div className="text-white text-sm font-semibold truncate">{title || 'Media Player'}</div>
            <div className="text-purple-300 text-xs mt-1 truncate">{platform || 'Unknown Source'}</div>
          </div>
        </div>
      )}

      {/* Browser Tab */}
      {activeTab === 'browser' && (
        <div className="flex-1 flex flex-col">
          {/* Browser Address Bar */}
          <div className="bg-black/70 border-b border-purple-300/30 p-3 flex items-center gap-2">
            <button
              onClick={goBack}
              disabled={historyIndex === 0}
              className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Back
            </button>
            <button
              onClick={goForward}
              disabled={historyIndex === browserHistory.length - 1}
              className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Forward →
            </button>
            <input
              type="text"
              defaultValue={browserUrl}
              onKeyDown={handleUrlChange}
              placeholder="Enter URL..."
              className="flex-1 px-3 py-1 rounded bg-white/10 border border-purple-300/30 text-white text-sm placeholder:text-purple-300/50 focus:outline-none focus:border-purple-400/50"
            />
          </div>

          {/* Browser Content */}
          <div className="flex-1 relative bg-black/80 overflow-hidden">
            {!iframeError ? (
              <iframe
                src={browserUrl}
                title="Browser View"
                className="w-full h-full border-none"
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-presentation allow-modals allow-top-navigation"
                onError={() => setIframeError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl text-white/50 mb-3">⚠️</div>
                  <div className="text-white text-sm">Content blocked or unavailable</div>
                  <div className="text-purple-300 text-xs mt-2">Try a different URL in the address bar</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
