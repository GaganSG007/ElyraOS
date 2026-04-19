'use client';

import BootScreen from '@/components/BootScreen';
import Desktop from '@/components/Desktop';
import FileExplorerView from '@/components/FileExplorerView';
import BrowserWindow from '@/components/BrowserWindow';
import MediaPlayer from '@/components/MediaPlayer';
import Taskbar from '@/components/Taskbar';
import Window from '@/components/Window';
import { WindowManagerProvider, useWindowManager } from '@/context/WindowContext';
import { AnimatePresence } from 'framer-motion';
import React, { useState, useEffect } from 'react';

function HomeContent() {
  const [booted, setBooted] = useState(false);
  const [bootSequenceComplete, setBootSequenceComplete] = useState(false);
  const [resourcesReady, setResourcesReady] = useState(false);
  const { windows, closeWindow } = useWindowManager();

  useEffect(() => {
    const resources: Promise<void>[] = [];

    resources.push(
      new Promise<void>((resolve) => {
        if (document.readyState === 'complete') resolve();
        else window.addEventListener('load', () => resolve(), { once: true });
      })
    );

    if (document.fonts && 'ready' in document.fonts) {
      resources.push(document.fonts.ready.then(() => undefined));
    } else {
      resources.push(Promise.resolve());
    }

    Promise.all(resources).then(() => {
      setResourcesReady(true);
    });
  }, []);

  React.useEffect(() => {
    if (resourcesReady && bootSequenceComplete) {
      setBooted(true);
    }
  }, [resourcesReady, bootSequenceComplete]);

  return (
    <main className="w-full h-screen overflow-hidden bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900">
      {/* Boot screen */}
      {!booted && <BootScreen onComplete={() => setBootSequenceComplete(true)} />}

      {/* Desktop and UI */}
      {booted && (
        <>
          {/* Desktop background and icons */}
          <Desktop />

          {/* Open windows */}
            {windows.map((window) => {
              return (
                <Window
                  key={window.id}
                  window={window}
                  onClose={closeWindow}
                >
                  {window.type === 'explorer' && <FileExplorerView initialFolder={window.data?.mediaFolder} initialView={window.data?.initialView} />}
                  {window.type === 'browser' && window.data?.url && (
                    <BrowserWindow
                      url={window.data.url}
                      title={window.data.title}
                      thumbnail={window.data.thumbnail}
                      platform={window.data.platform}
                      iframeAllowed={window.data.iframeAllowed}
                    />
                  )}
                  {window.type === 'player' && window.data?.videoUrl && (
                    <>
                      {console.log('🎬 Rendering MediaPlayer for window:', window.id, 'with data:', window.data)}
                      <MediaPlayer
                        url={window.data.videoUrl}
                        title={window.data.title}
                        thumbnail={window.data.thumbnailUrl}
                        orientation={window.data.orientation}
                      />
                    </>
                  )}
                </Window>
              );
            })}

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
