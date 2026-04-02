'use client';

import { OSWindow, WindowPosition, WindowSize, WindowType } from '@/types/window';
import React, { createContext, useCallback, useContext, useState, useMemo } from 'react';

interface WindowManagerContextType {
  windows: OSWindow[];
  openWindow: (type: WindowType, title: string, data?: Record<string, any>) => string;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  updateWindowPosition: (id: string, position: WindowPosition) => void;
  updateWindowSize: (id: string, size: WindowSize) => void;
  minimizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  restoreFromMaximize: (id: string) => void;
  closeFileExplorer: () => void;
  getActiveWindow: () => OSWindow | undefined;
}

const WindowManagerContext = createContext<WindowManagerContextType | undefined>(undefined);

export function WindowManagerProvider({ children }: { children: React.ReactNode }) {
  const [windows, setWindows] = useState<OSWindow[]>([]);
  const [nextZIndex, setNextZIndex] = useState(1);
  const [windowCounter, setWindowCounter] = useState(0);

  const openWindow = useCallback(
    (type: WindowType, title: string, data?: Record<string, any>) => {
      const id = `${type}-${windowCounter}`;
      setWindowCounter((prev) => prev + 1);

      // Calculate default position (slightly offset for each new window)
      const offsetX = 80 + (windowCounter % 5) * 30;
      const offsetY = 80 + (windowCounter % 5) * 30;

      const newWindow: OSWindow = {
        id,
        type,
        title,
        position: { x: offsetX, y: offsetY },
        size: data?.width && data?.height
          ? { width: data.width, height: data.height }
          : type === 'explorer'
          ? { width: 700, height: 500 }
          : { width: 800, height: 600 },
        zIndex: nextZIndex,
        isMinimized: false,
        isMaximized: false,
        data,
      };

      setNextZIndex((prev) => prev + 1);
      setWindows((prev) => [...prev, newWindow]);
      return id;
    },
    [windowCounter, nextZIndex]
  );

  const closeWindow = useCallback((id: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const focusWindow = useCallback((id: string) => {
    setWindows((prev) =>
      prev.map((w) =>
        w.id === id
          ? { ...w, zIndex: nextZIndex, isMinimized: false }
          : w
      )
    );
    setNextZIndex((prev) => prev + 1);
  }, [nextZIndex]);

  const updateWindowPosition = useCallback((id: string, position: WindowPosition) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, position } : w))
    );
  }, []);

  const updateWindowSize = useCallback((id: string, size: WindowSize) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, size } : w))
    );
  }, []);

  const minimizeWindow = useCallback((id: string) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isMinimized: true } : w))
    );
  }, []);

  const restoreWindow = useCallback((id: string) => {
    setWindows((prev) =>
      prev.map((w) =>
        w.id === id ? { ...w, isMinimized: false, isMaximized: false, zIndex: nextZIndex } : w
      )
    );
    setNextZIndex((prev) => prev + 1);
  }, [nextZIndex]);

  const maximizeWindow = useCallback((id: string) => {
    setWindows((prev) =>
      prev.map((w) =>
        w.id === id
          ? { ...w, isMaximized: true, isMinimized: false, zIndex: nextZIndex }
          : w
      )
    );
    setNextZIndex((prev) => prev + 1);
  }, [nextZIndex]);

  const restoreFromMaximize = useCallback((id: string) => {
    setWindows((prev) =>
      prev.map((w) =>
        w.id === id ? { ...w, isMaximized: false, zIndex: nextZIndex } : w
      )
    );
    setNextZIndex((prev) => prev + 1);
  }, [nextZIndex]);

  const closeFileExplorer = useCallback(() => {
    setWindows((prev) => prev.filter((w) => w.type !== 'explorer'));
  }, []);

  const getActiveWindow = useCallback(() => {
    return windows.reduce((max, w) => (w.zIndex > max.zIndex ? w : max), windows[0]);
  }, [windows]);

  const contextValue = useMemo(() => ({
    windows,
    openWindow,
    closeWindow,
    focusWindow,
    updateWindowPosition,
    updateWindowSize,
    minimizeWindow,
    restoreWindow,
    maximizeWindow,
    restoreFromMaximize,
    closeFileExplorer,
    getActiveWindow,
  }), [windows, openWindow, closeWindow, focusWindow, updateWindowPosition, updateWindowSize, minimizeWindow, restoreWindow, maximizeWindow, restoreFromMaximize, closeFileExplorer, getActiveWindow]);

  return (
    <WindowManagerContext.Provider value={contextValue}>
      {children}
    </WindowManagerContext.Provider>
  );
}

export function useWindowManager() {
  const context = useContext(WindowManagerContext);
  if (!context) {
    throw new Error('useWindowManager must be used within WindowManagerProvider');
  }
  return context;
}
