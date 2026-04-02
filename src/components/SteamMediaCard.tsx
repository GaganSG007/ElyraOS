'use client';

import { useState } from 'react';

type SteamMediaCardProps = {
  url: string;
  thumbnail?: string;
  title?: string;
  platform?: string;
  isSelected?: boolean;
  onClick?: () => void;
};

export default function SteamMediaCard({
  url,
  thumbnail,
  title,
  platform,
  isSelected = false,
  onClick,
}: SteamMediaCardProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [imgError, setImgError] = useState(false);

  const aspectClass = 'aspect-[16/9]';

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={`rounded-lg overflow-hidden transition-all duration-200 text-left group ${
        isSelected ? 'ring-2 ring-purple-400 scale-105' : 'hover:scale-105'
      }`}
      style={{
        boxShadow: isHovering
          ? '0 16px 32px rgba(147, 51, 234, 0.3)'
          : '0 8px 16px rgba(0, 0, 0, 0.3)',
      }}
    >
      <div className={`${aspectClass} relative bg-black/20 overflow-hidden`}>
        {thumbnail && !imgError ? (
          <>
            <img
              src={thumbnail}
              alt={title || 'Media'}
              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-110"
              onError={() => setImgError(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="text-4xl text-white">▶</div>
            </div>
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-500/30 to-indigo-500/30 flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl mb-2">📹</div>
              <div className="text-xs text-white/70">{platform || 'Media'}</div>
            </div>
          </div>
        )}
      </div>
      <div className="bg-black/60 px-3 py-2 border-t border-purple-300/20">
        <div className="text-white text-xs font-semibold truncate">{title || 'Untitled'}</div>
        <div className="text-purple-300 text-[10px] truncate mt-0.5">{platform || 'Link'}</div>
      </div>
    </button>
  );
}
