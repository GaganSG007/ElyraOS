'use client';

import { useWindowManager } from '@/context/WindowContext';

export default function Desktop() {
  const { openWindow } = useWindowManager();

  const handleThisPCClick = () => {
    openWindow('explorer', 'File Explorer');
  };

  return (
    <div className="absolute inset-0 bg-cover bg-center animate-desktop-pan" style={{ backgroundImage: 'url(/Images/Elyra.jpg)' }}>
      <style jsx>{`
        @keyframes desktopPan {
          0% { background-position: 52% 48%; }
          50% { background-position: 48% 52%; }
          100% { background-position: 52% 48%; }
        }

        .animate-desktop-pan {
          animation: desktopPan 22s ease-in-out infinite;
          will-change: background-position;
        }
      `}</style>
      {/* Desktop icons */}
      <div className="fixed left-6 top-6 flex flex-col gap-8">
        {/* This PC */}
        <button
          onClick={handleThisPCClick}
          className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-white/10 transition-colors"
        >
          <div className="text-5xl">💻</div>
          <span className="text-xs text-white font-medium text-center max-w-16">
            This PC
          </span>
        </button>

        {/* Recycle Bin */}
        <button className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-white/10 transition-colors">
          <div className="text-5xl">🗑️</div>
          <span className="text-xs text-white font-medium text-center">Recycle Bin</span>
        </button>
      </div>
    </div>
  );
}
