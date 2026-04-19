'use client';

import { useWindowManager } from '@/context/WindowContext';
import { OSWindow } from '@/types/window';
import { motion } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';

interface WindowComponentProps {
  window: OSWindow;
  children: React.ReactNode;
  onClose: (id: string) => void;
}

export default function WindowComponent({
  window: osWindow,
  children,
  onClose,
}: WindowComponentProps) {
  const { focusWindow, updateWindowPosition, updateWindowSize, minimizeWindow, maximizeWindow, restoreFromMaximize } = useWindowManager();
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const windowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Auto-maximize windows on mobile
      if (mobile && !osWindow.isMaximized) {
        maximizeWindow(osWindow.id);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [osWindow.id, osWindow.isMaximized, maximizeWindow]);

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (osWindow.isMaximized || isMobile) return;
    if ((e.target as HTMLElement).closest('[data-no-drag]')) return;
    focusWindow(osWindow.id);
    setIsDragging(true);
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    setDragStart({
      x: clientX - osWindow.position.x,
      y: clientY - osWindow.position.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    updateWindowPosition(osWindow.id, {
      x: clientX - dragStart.x,
      y: clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleResizeStart = (e: React.MouseEvent | React.TouchEvent, corner: string) => {
    e.stopPropagation();
    if (isMobile) return;
    focusWindow(osWindow.id);
    setIsResizing(true);
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    setResizeStart({
      x: clientX,
      y: clientY,
      width: osWindow.size.width,
      height: osWindow.size.height,
    });
  };

  const handleResizeMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isResizing || isMobile) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const deltaX = clientX - resizeStart.x;
    const deltaY = clientY - resizeStart.y;

    let newWidth = resizeStart.width + deltaX;
    let newHeight = resizeStart.height + deltaY;

    newWidth = Math.max(320, newWidth);
    newHeight = Math.max(240, newHeight);

    updateWindowSize(osWindow.id, { width: newWidth, height: newHeight });
  };

  const handleResizeMouseUp = () => {
    setIsResizing(false);
  };

  const windowStyle = osWindow.isMaximized
    ? {
        left: '8px',
        top: '8px',
        width: 'calc(100vw - 16px)',
        height: 'calc(100vh - 64px)',
      }
    : {
        left: Math.max(0, Math.min(osWindow.position.x, window.innerWidth - 100)),
        top: Math.max(0, Math.min(osWindow.position.y, window.innerHeight - 100)),
        width: Math.min(osWindow.size.width, window.innerWidth - 20),
        height: Math.min(osWindow.size.height, window.innerHeight - 80),
      };

  return (
    <motion.div
      ref={windowRef}
      className={`${isMobile ? 'fixed inset-0' : 'fixed'} bg-black/50 backdrop-blur-md rounded-xl shadow-2xl border border-cyan-500/20 overflow-hidden flex flex-col`}
      style={isMobile ? { zIndex: osWindow.zIndex } : {
        ...windowStyle,
        zIndex: osWindow.zIndex,
        willChange: 'transform, opacity',
        transform: 'translateZ(0)',
      }}
      onMouseMove={(e) => {
        handleMouseMove(e);
        handleResizeMouseMove(e);
      }}
      onMouseUp={() => {
        handleMouseUp();
        handleResizeMouseUp();
      }}
      onMouseLeave={() => {
        handleMouseUp();
        handleResizeMouseUp();
      }}
      onTouchMove={(e) => {
        handleMouseMove(e);
        handleResizeMouseMove(e);
      }}
      onTouchEnd={() => {
        handleMouseUp();
        handleResizeMouseUp();
      }}
      onMouseDownCapture={focusWindow.bind(null, osWindow.id)}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      {/* Title Bar */}
      <div
        onMouseDown={!isMobile ? handleMouseDown : undefined}
        onTouchStart={!isMobile ? handleMouseDown : undefined}
        className={`bg-black/40 backdrop-blur-md px-4 py-2.5 border-b border-cyan-500/15 flex justify-between items-center ${!isMobile ? 'cursor-move' : ''} select-none hover:bg-black/50 transition-all duration-300`}
        style={{ touchAction: 'none' }}
      >
        <span className={`font-medium text-cyan-50 truncate ${isMobile ? 'text-sm' : 'text-xs'}`}>{osWindow.title}</span>
        <div className="flex gap-1">
          {!isMobile && (
            <button
              data-no-drag
              onClick={() => minimizeWindow(osWindow.id)}
              className="w-7 h-7 flex items-center justify-center hover:bg-yellow-500/20 text-white hover:text-yellow-200 rounded transition-all duration-200"
              style={{ touchAction: 'manipulation' }}
            >
              —
            </button>
          )}
          {!isMobile && (
            <button
              data-no-drag
              onClick={() => {
                if (osWindow.isMaximized) {
                  restoreFromMaximize(osWindow.id);
                } else {
                  maximizeWindow(osWindow.id);
                }
              }}
              className="w-7 h-7 flex items-center justify-center hover:bg-green-500/20 text-white hover:text-green-200 rounded transition-all duration-200"
              style={{ touchAction: 'manipulation' }}
            >
              {osWindow.isMaximized ? '🗗' : '▢'}
            </button>
          )}
          <button
            data-no-drag
            onClick={() => onClose(osWindow.id)}
            className={`flex items-center justify-center rounded transition-all duration-200 hover:bg-red-500/20 text-white hover:text-red-200 ${isMobile ? 'w-10 h-10' : 'w-7 h-7'}`}
            style={{ touchAction: 'manipulation' }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-black/30 backdrop-blur-sm" style={{ touchAction: isMobile ? 'pan-y' : 'pan-y', WebkitUserSelect: 'none', userSelect: 'none' }}>
        {children}
      </div>

      {/* Resize handles - hidden on mobile */}
      {!isMobile && (
        <>
          <div
            onMouseDown={(e) => handleResizeStart(e, 'br')}
            className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize hover:bg-blue-500/20 transition-colors"
          />
          <div
            onMouseDown={(e) => handleResizeStart(e, 'r')}
            className="absolute right-0 top-8 bottom-0 w-1 cursor-ew-resize hover:bg-blue-500/20 transition-colors"
          />
          <div
            onMouseDown={(e) => handleResizeStart(e, 'b')}
            className="absolute bottom-0 left-0 right-0 h-1 cursor-ns-resize hover:bg-blue-500/20 transition-colors"
          />
        </>
      )}
    </motion.div>
  );
}

// ...existing code...
