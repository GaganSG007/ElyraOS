'use client';

import React, { useState } from 'react';

type BrowserWindowProps = {
  url: string;
  originalUrl?: string;
  title?: string;
  thumbnail?: string | null;
  platform?: string;
  iframeAllowed?: boolean;
};

function trimUrl(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.origin + parsed.pathname + (parsed.search || '');
  } catch {
    return url;
  }
}

export default function BrowserWindow({ url, originalUrl, title, thumbnail, platform, iframeAllowed }: BrowserWindowProps) {
  const [iframeError, setIframeError] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);
  const trimmed = trimUrl(url);

  const openInTab = () => {
    window.open(originalUrl || url, '_blank', 'noopener,noreferrer');
  };

  const showIframe = iframeAllowed && !iframeError;

  return (
    <div className="h-full flex flex-col bg-black/30 backdrop-blur-md border border-purple-300/30 rounded-lg overflow-hidden shadow-inner">
      <div className="px-3 py-2 border-b border-purple-300/30 bg-white/5 flex items-center gap-3">
        <div className="w-3 h-3 rounded-full bg-red-400" />
        <div className="w-3 h-3 rounded-full bg-yellow-400" />
        <div className="w-3 h-3 rounded-full bg-green-400" />
        <div className="flex-1 text-xs text-purple-200 truncate">{trimmed}</div>
        <button
          onClick={openInTab}
          className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-white transition-all duration-200"
        >
          Open in new tab
        </button>
      </div>

      <div className="flex-1 h-0 relative bg-black/80">
        {showIframe ? (
          <iframe
            src={url}
            title={title || 'Browser view'}
            className="w-full h-full border-none"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            onError={() => setIframeError(true)}
          />
        ) : (
          <div className="absolute inset-0 p-5 flex flex-col items-center justify-center gap-4 text-center">
            <div className="w-full max-w-md rounded-xl overflow-hidden bg-gradient-to-br from-purple-900/40 via-indigo-800/30 to-black/40 border border-purple-300/20">
              {thumbnail && !thumbnailError ? (
                <img src={thumbnail} alt={title || 'Preview'} className="w-full h-56 object-cover" loading="lazy" onError={() => setThumbnailError(true)} />
              ) : (
                <div className="w-full h-56 bg-white/10 flex items-center justify-center text-white/70 text-center">
                  <div>
                    <div className="text-lg mb-2">📷</div>
                    <div>No preview image available</div>
                    <div className="text-xs mt-1">Add thumbnail to public/Images/thumbnails/</div>
                  </div>
                </div>
              )}
            </div>
            <div className="text-white text-sm font-semibold">{title || platform || 'External Link'}</div>
            {!iframeAllowed && (
              <div className="text-xs text-purple-200 text-center">
                Content preview - {platform} restricts embedding in web applications.
                <br />
                Your work is showcased here within the ElyraOS interface.
              </div>
            )}
            {iframeAllowed && (
              <div className="text-xs text-purple-200">
                Embed failed. The site may block iframes, but you can still browse inside the OS preview.
              </div>
            )}
            {iframeAllowed && (
              <button
                onClick={openInTab}
                className="px-4 py-2 rounded-lg bg-purple-500/70 hover:bg-purple-500 text-white transition-all duration-200"
              >
                View on {platform ? platform : 'site'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
