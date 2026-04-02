export interface WindowPosition {
  x: number;
  y: number;
}

export interface WindowSize {
  width: number;
  height: number;
}

export type WindowType = 'explorer' | 'player' | 'browser';

export interface OSWindow {
  id: string;
  type: WindowType;
  title: string;
  position: WindowPosition;
  size: WindowSize;
  zIndex: number;
  isMinimized: boolean;
  isMaximized?: boolean;
  data?: Record<string, any>; // For passing data like video info
}
