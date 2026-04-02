'use client';

import { useWindowManager } from '@/context/WindowContext';
import { OSWindow } from '@/types/window';
import { motion } from 'framer-motion';
import { useRef, useState } from 'react';

interface WindowComponentProps {
  window: OSWindow;
  children: React.ReactNode;
  onClose: (id: string) => void;
}

export default function WindowComponent({
  window,
  children,
  onClose,
}: WindowComponentProps) {
  const { focusWindow, updateWindowPosition, updateWindowSize, minimizeWindow, maximizeWindow, restoreFromMaximize } = useWindowManager();
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (window.isMaximized) return;
    if ((e.target as HTMLElement).closest('[data-no-drag]')) return;
    focusWindow(window.id);
    setIsDragging(true);
    setDragStart({
      x: e.clientX - window.position.x,
      y: e.clientY - window.position.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      updateWindowPosition(window.id, {
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleResizeStart = (e: React.MouseEvent, corner: string) => {
    e.stopPropagation();
    focusWindow(window.id);
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: window.size.width,
      height: window.size.height,
    });
  };

  const handleResizeMouseMove = (e: React.MouseEvent) => {
    if (!isResizing) return;

    const deltaX = e.clientX - resizeStart.x;
    const deltaY = e.clientY - resizeStart.y;

    let newWidth = resizeStart.width + deltaX;
    let newHeight = resizeStart.height + deltaY;

    newWidth = Math.max(400, newWidth);
    newHeight = Math.max(300, newHeight);

    updateWindowSize(window.id, { width: newWidth, height: newHeight });
  };

  const handleResizeMouseUp = () => {
    setIsResizing(false);
  };

  const windowStyle = window.isMaximized
    ? {
        left: '14px',
        top: '14px',
        width: 'calc(100vw - 28px)',
        height: 'calc(100vh - 76px)',
      }
    : {
        left: window.position.x,
        top: window.position.y,
        width: window.size.width,
        height: window.size.height,
      };

  return (
    <motion.div
      ref={windowRef}
      className="fixed bg-black/70 backdrop-blur-2xl rounded-lg shadow-xl border border-purple-300/40 overflow-hidden flex flex-col"
      style={{
        ...windowStyle,
        zIndex: window.zIndex,
        willChange: 'transform, opacity',
        transform: 'translateZ(0)',
      }}
      onMouseMove={(e) => {
        handleMouseMove(e as any);
        if (isResizing) handleResizeMouseMove(e as any);
      }}
      onMouseLeave={() => {
        setIsDragging(false);
        setIsResizing(false);
      }}
      onMouseUp={() => {
        handleMouseUp();
        handleResizeMouseUp();
      }}
      onMouseDownCapture={focusWindow.bind(null, window.id)}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      {/* Title Bar */}
      <div
        onMouseDown={handleMouseDown}
        className="bg-white/6 backdrop-blur-2xl px-4 py-3 border-b border-purple-300/40 flex justify-between items-center cursor-move select-none hover:bg-white/8 transition-all duration-300"
      >
        <span className="text-sm font-medium text-white">{window.title}</span>
        <div className="flex gap-1">
          <button
            data-no-drag
            onClick={() => minimizeWindow(window.id)}
            className="w-6 h-6 flex items-center justify-center hover:bg-yellow-500/20 text-white hover:text-yellow-200 rounded transition-all duration-200 hover:scale-110"
          >
            —
          </button>
          <button
            data-no-drag
            onClick={() => {
              if (window.isMaximized) {
                restoreFromMaximize(window.id);
              } else {
                maximizeWindow(window.id);
              }
            }}
            className="w-6 h-6 flex items-center justify-center hover:bg-green-500/20 text-white hover:text-green-200 rounded transition-all duration-200 hover:scale-110"
          >
            {window.isMaximized ? '🗗' : '▢'}
          </button>
          <button
            data-no-drag
            onClick={() => onClose(window.id)}
            className="w-6 h-6 flex items-center justify-center hover:bg-red-500/20 text-white hover:text-red-200 rounded transition-all duration-200 hover:scale-110"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-black/50">
        {children}
      </div>

      {/* Resize handles */}
      <div
        onMouseDown={(e) => handleResizeStart(e, 'br')}
        className="absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize hover:bg-blue-500/20 transition-colors"
      />
      <div
        onMouseDown={(e) => handleResizeStart(e, 'r')}
        className="absolute right-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-blue-500/20 transition-colors"
      />
      <div
        onMouseDown={(e) => handleResizeStart(e, 'b')}
        className="absolute bottom-0 left-0 right-0 h-1 cursor-ns-resize hover:bg-blue-500/20 transition-colors"
      />
    </motion.div>
  );
}
