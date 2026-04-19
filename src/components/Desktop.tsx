'use client';

import { useWindowManager } from '@/context/WindowContext';

export default function Desktop() {
  const { openWindow } = useWindowManager();

  const handleThisPCClick = () => {
    openWindow('explorer', 'File Explorer');
  };

  return (
    <div 
      className="fixed inset-0 overflow-hidden" 
      style={{ 
        backgroundImage: 'url(/Images/Elyra.png)',
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        touchAction: 'none',
        overscrollBehavior: 'none',
      }}
    >
      <style jsx>{`
        /* Beautiful static wallpaper displayed on all devices */
      `}</style>

      {/* Desktop icons - positioned absolutely within the fixed Desktop container */}
      <div className="absolute left-4 top-4 flex flex-col gap-4 z-10">
        {/* This PC */}
        <button
          onClick={handleThisPCClick}
          className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-white/10 active:bg-white/15 transition-all duration-200 backdrop-blur-sm"
          style={{ touchAction: 'manipulation' }}
        >
          <div className="text-3xl md:text-4xl">💻</div>
          <span className="text-[10px] md:text-xs text-white/80 font-medium text-center max-w-16">
            This PC
          </span>
        </button>

        {/* Recycle Bin */}
        <button 
          className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-white/10 active:bg-white/15 transition-all duration-200 backdrop-blur-sm"
          style={{ touchAction: 'manipulation' }}
        >
          <div className="text-3xl md:text-4xl">🗑️</div>
          <span className="text-[10px] md:text-xs text-white/80 font-medium text-center">Recycle Bin</span>
        </button>
      </div>
    </div>
  );
}
