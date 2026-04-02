'use client';

import { useWindowManager } from '@/context/WindowContext';
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';

function clampScale(index: number, activeIndex: number | null): { scale: number; translateY: number } {
  if (activeIndex === null) return { scale: 1, translateY: 0 };
  const distance = Math.abs(index - activeIndex);
  if (distance === 0) return { scale: 1.5, translateY: -6 };
  if (distance === 1) return { scale: 1.2, translateY: -3 };
  if (distance === 2) return { scale: 1.1, translateY: -1 };
  return { scale: 1, translateY: 0 };
}

export default function Taskbar() {
  const { windows, focusWindow, restoreWindow, closeWindow, openWindow } = useWindowManager();
  const [time, setTime] = useState('00:00');
  const [showContextMenu, setShowContextMenu] = useState<string | null>(null);
  const [contextPos, setContextPos] = useState({ x: 0, y: 0 });
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const taskbarRef = useRef<HTMLDivElement>(null);

  const pinnedApps = useMemo(
    () => [
      { name: 'Photoshop', icon: '/Images/photoshop.png' },
      { name: 'Premiere', icon: '/Images/premiere-pro.png' },
      { name: 'After Effects', icon: '/Images/after-effects.png' },
      { name: 'Illustrator', icon: '/Images/illustrator.png' },
      { name: 'DaVinci', icon: '/Images/davinci.png' },
      { name: 'CapCut', icon: '/Images/capcut.png' },
      { name: 'Filmora', icon: '/Images/filmora.png' },
      { name: 'Figma', icon: '/Images/figma.png' },
      { name: 'Canva', icon: '/Images/canva.png' },
      { name: 'VS Code', icon: '/Images/vs code.png' },
      { name: 'Spotify', icon: '/Images/spotify.png' },
      { name: 'Steam', icon: '/Images/steam.png' },
    ],
    []
  );

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setStartMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleEsc);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!taskbarRef.current?.contains(event.target as Node)) {
        setStartMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleWindowClick = (windowId: string) => {
    const windowItem = windows.find((w) => w.id === windowId);
    if (windowItem?.isMinimized) {
      restoreWindow(windowId);
    } else {
      focusWindow(windowId);
    }
  };

  const handleCloseFromContext = (windowId: string) => {
    closeWindow(windowId);
    setShowContextMenu(null);
  };

  const visibleWindows = windows.filter((w) => !w.isMinimized);
  const minimizedWindows = windows.filter((w) => w.isMinimized);

  return (
    <>
      <div
        ref={taskbarRef}
        className="fixed bottom-0 left-0 right-0 h-16 backdrop-blur-2xl bg-white/6 border-t border-purple-300/40 shadow-lg flex items-center px-4 gap-3 z-50"
      >
        <button
          onClick={() => setStartMenuOpen((prev) => !prev)}
          className="px-4 py-1 rounded-full bg-white text-purple-400 shadow-md hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-200 hover:scale-105"
        >
          Elyra
        </button>

        <div className="absolute left-1/2 transform -translate-x-1/2 flex gap-3 items-end pb-1">
          {pinnedApps.map((app, index) => {
            const { scale, translateY } = clampScale(index, hoveredIndex);
            return (
              <button
                key={app.name}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onMouseDown={() => {}}
                className="flex items-center justify-center text-xs transition-all duration-300"
                style={{
                  transform: `scale(${scale}) translateY(${translateY}px)`,
                  transition: 'transform 250ms cubic-bezier(0.25, 0.8, 0.25, 1)',
                }}
              >
                <img src={app.icon} alt={app.name} className="w-8 h-8 object-contain" />
              </button>
            );
          })}

          {/* Grouped File Explorer Windows */}
          {windows.filter(w => w.title.includes('File Explorer')).length > 0 && (
            <div className="relative">
              <button
                onMouseEnter={() => setHoveredIndex(pinnedApps.length)}
                onMouseLeave={() => setHoveredIndex(null)}
                onMouseDown={() => openWindow('explorer', 'File Explorer')}
                className="flex items-center justify-center text-xs transition-all duration-300"
                style={{
                  transform: `scale(${hoveredIndex === pinnedApps.length ? 1.5 : 1}) translateY(${hoveredIndex === pinnedApps.length ? -6 : 0}px)`,
                  transition: 'transform 250ms cubic-bezier(0.25, 0.8, 0.25, 1)',
                }}
              >
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.89 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
                </svg>
              </button>
              {hoveredIndex === pinnedApps.length && (
                <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-md rounded-lg p-2 shadow-xl border border-white/20">
                  <div className="flex gap-1">
                    {windows.filter(w => w.title.includes('File Explorer')).map((windowItem, idx) => (
                      <button
                        key={windowItem.id}
                        onClick={() => handleWindowClick(windowItem.id)}
                        className="w-16 h-12 bg-gray-700 rounded text-xs text-white hover:bg-gray-600 transition-colors"
                      >
                        PC {idx + 1}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="ml-auto text-xs text-white/80">{time}</div>
      </div>

      {startMenuOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-16 left-4 w-80 rounded-xl bg-white/6 backdrop-blur-2xl border border-purple-300/40 shadow-xl p-4 z-40"
        >
          <p className="text-sm text-white font-semibold mb-3">Recently Opened</p>
          <ul className="space-y-2 text-xs text-purple-200">
            <li className="flex items-center gap-2 hover:bg-white/10 rounded px-2 py-1 transition-all duration-200 hover:scale-105 cursor-pointer">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.89 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
              </svg>
              File Explorer
            </li>
            <li className="flex items-center gap-2 hover:bg-white/10 rounded px-2 py-1 transition-all duration-200 hover:scale-105 cursor-pointer">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="10"/><path d="M8 14l8-4-8-4v8z"/>
              </svg>
              Video Player
            </li>
            <li className="flex items-center gap-2 hover:bg-white/10 rounded px-2 py-1 transition-all duration-200 hover:scale-105 cursor-pointer">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0L19.2 12l-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
              </svg>
              Design Studio
            </li>
          </ul>
          <div className="mt-4 border-t border-purple-300/30 pt-3">
            <p className="text-sm text-white">About</p>
            <p className="text-sm text-purple-200">Contact</p>
          </div>
          <div className="mt-4 text-[11px] text-purple-300">System running smoothly 🚀</div>
        </motion.div>
      )}

      {showContextMenu && (
        <>
          <div className="fixed inset-0" onClick={() => setShowContextMenu(null)} />
          <div
            className="fixed bg-black/80 backdrop-blur-2xl border border-purple-300/40 rounded-lg shadow-2xl z-50"
            style={{ left: `${contextPos.x}px`, top: `${contextPos.y}px` }}
          >
            <button
              onClick={() => handleCloseFromContext(showContextMenu)}
              className="w-full px-4 py-2 text-sm text-white hover:bg-white/10 transition-all duration-200 hover:scale-105 text-left"
            >
              Close Window
            </button>
          </div>
        </>
      )}
    </>
  );
}
