'use client';

import BootScreen from '@/components/BootScreen';
import Desktop from '@/components/Desktop';
import FileExplorerView from '@/components/FileExplorerView';
import Taskbar from '@/components/Taskbar';
import Window from '@/components/Window';
import { WindowManagerProvider, useWindowManager } from '@/context/WindowContext';
import { AnimatePresence } from 'framer-motion';
import { useState } from 'react';

function HomeContent() {
  const [booted, setBooted] = useState(false);
  const { windows, closeWindow } = useWindowManager();

  return (
    <main className="w-full h-screen overflow-hidden bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900">
      {/* Boot screen */}
      {!booted && <BootScreen onComplete={() => setBooted(true)} />}

      {/* Desktop and UI */}
      {booted && (
        <>
          {/* Desktop background and icons */}
          <Desktop />

          {/* Open windows */}
          <AnimatePresence>
            {windows.map((window) => (
              <Window
                key={window.id}
                window={window}
                onClose={closeWindow}
              >
                {window.type === 'explorer' && <FileExplorerView />}
              </Window>
            ))}
          </AnimatePresence>

          {/* Taskbar */}
          <Taskbar />
        </>
      )}
    </main>
  );
}

export default function Home() {
  return (
    <WindowManagerProvider>
      <HomeContent />
    </WindowManagerProvider>
  );
}
