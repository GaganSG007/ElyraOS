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
  const [isMobile, setIsMobile] = useState(false);
  const taskbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
          hour12: true,
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
      <style jsx>{`
        .mobile-scroll-icons {
          -webkit-overflow-scrolling: touch;
          scroll-behavior: smooth;
        }

        .mobile-scroll-icons::-webkit-scrollbar {
          display: none;
        }

        .mobile-scroll-icons {
          scrollbar-width: none;
        }
      `}</style>
      <div
        ref={taskbarRef}
        className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 backdrop-blur-3xl bg-gradient-to-b from-white/20 to-white/5 shadow-2xl flex items-center justify-between z-50 rounded-3xl border border-white/15 ${isMobile ? 'h-18 px-3' : 'h-14 px-6'}`}
        style={{ touchAction: 'manipulation' }}
      >
        {/* Start Button */}
        <button
          onClick={() => setStartMenuOpen((prev) => !prev)}
          className={`rounded-lg bg-gradient-to-b from-cyan-600/50 to-cyan-700/40 backdrop-blur-3xl text-white shadow-lg hover:shadow-xl hover:from-cyan-600/60 hover:to-cyan-700/50 transition-all duration-200 hover:scale-105 font-medium whitespace-nowrap flex-shrink-0 border border-cyan-400/30 ${isMobile ? 'px-2 py-1 text-[10px]' : 'px-3 py-1.5 text-xs'}`}
          style={{ touchAction: 'manipulation' }}
        >
          Elyra
        </button>

        {/* Center Icons - Desktop: Centered with animation, Mobile: Horizontal scroll */}
        <div className={isMobile ? 'flex gap-2 items-center flex-1 overflow-x-auto mobile-scroll-icons pb-1 ml-3' : 'flex gap-2 items-end flex-1 justify-center pb-2 mx-4'}>
          {pinnedApps.map((app, index) => {
            const { scale, translateY } = clampScale(index, hoveredIndex);
            return (
              <button
                key={app.name}
                onMouseEnter={() => !isMobile && setHoveredIndex(index)}
                onMouseLeave={() => !isMobile && setHoveredIndex(null)}
                onClick={() => {}}
                className="flex items-center justify-center transition-all duration-300 flex-shrink-0"
                style={{
                  transform: isMobile ? `scale(1) translateY(0px)` : `scale(${scale}) translateY(${translateY}px)`,
                  transition: 'transform 350ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                  touchAction: 'manipulation',
                }}
                title={app.name}
              >
                <img src={app.icon} alt={app.name} className={isMobile ? 'w-7 h-7 object-contain' : 'w-8 h-8 object-contain'} />
              </button>
            );
          })}

          {/* File Explorer Window */}
          {windows.filter(w => w.title.includes('File Explorer')).length > 0 && (
            <button
              onMouseEnter={() => !isMobile && setHoveredIndex(pinnedApps.length)}
              onMouseLeave={() => !isMobile && setHoveredIndex(null)}
              onClick={() => {
                const explorerWindow = windows.find(w => w.title.includes('File Explorer'));
                if (explorerWindow) {
                  handleWindowClick(explorerWindow.id);
                }
              }}
              className="flex items-center justify-center transition-all duration-300 flex-shrink-0"
              style={{
                transform: isMobile ? `scale(1) translateY(0px)` : `scale(${hoveredIndex === pinnedApps.length ? 1.5 : 1}) translateY(${hoveredIndex === pinnedApps.length ? -6 : 0}px)`,
                transition: 'transform 350ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                touchAction: 'manipulation',
              }}
              title="File Explorer"
            >
              <svg className={isMobile ? 'w-7 h-7' : 'w-8 h-8'} viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.89 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
              </svg>
            </button>
          )}
        </div>

        {/* Time Display */}
        {!isMobile && <div className="text-xs text-cyan-50/40 font-medium ml-2">{time}</div>}
      </div>

      {startMenuOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className={`fixed rounded-2xl bg-gradient-to-b from-cyan-950/70 to-cyan-900/60 backdrop-blur-3xl shadow-2xl p-6 z-40 border border-cyan-400/40 ${isMobile ? 'bottom-24 left-2 right-2 w-auto' : 'bottom-20 left-1/2 transform -translate-x-1/2 w-80'}`}
        >
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-white">GAGAN S G</h2>
              <p className="text-xs text-cyan-200/80 mt-1">Freelancer • Graphic Designer • Video Editor</p>
            </div>
            
            <div className="border-t border-white/10 pt-3">
              <p className="text-xs text-cyan-100/90 leading-relaxed">
                Portfolio to showcase my video editing skills. Transforming ideas into stunning visual content with precision and creativity.
              </p>
            </div>
            
            <div className="border-t border-white/10 pt-3 space-y-2">
              <div className="text-[11px]">
                <p className="text-cyan-200/70">📧 gagansg2506@gmail.com</p>
                <p className="text-cyan-200/70">📍 Bengaluru, India</p>
                <p className="text-cyan-200/70">🔗 github.com/GaganSG007</p>
              </div>
            </div>
            
            <div className="border-t border-white/10 pt-3">
              <p className="text-[10px] text-cyan-100/60 italic">Bringing visualized ideas to life. One frame at a time. ✨</p>
            </div>
          </div>
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
