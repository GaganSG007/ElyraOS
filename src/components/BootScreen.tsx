'use client';

import { useEffect, useState } from 'react';

interface BootScreenProps {
  onComplete: () => void;
}

export default function BootScreen({ onComplete }: BootScreenProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const totalDuration = 2200;

    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onComplete, 500);
    }, totalDuration);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-[#0a0a0d] transition-opacity duration-700 ${
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_65%)] animate-glow" />

      {/* Logo */}
      <h1 className="text-[44px] sm:text-[60px] font-light tracking-[0.22em] text-white/90 animate-logo">
        ElyraOS
      </h1>

      <style jsx>{`
        @keyframes logoReveal {
          0% {
            opacity: 0;
            transform: scale(0.96) translateY(10px);
            filter: blur(10px);
          }
          60% {
            opacity: 1;
            transform: scale(1.02) translateY(0);
            filter: blur(0);
          }
          100% {
            transform: scale(1);
          }
        }

        @keyframes glowPulse {
          0% {
            opacity: 0.15;
            transform: scale(0.9);
          }
          50% {
            opacity: 0.28;
            transform: scale(1.05);
          }
          100% {
            opacity: 0.15;
            transform: scale(0.9);
          }
        }

        .animate-logo {
          animation: logoReveal 1.6s cubic-bezier(0.25, 0.45, 0.3, 1) forwards;
          text-shadow:
            0 0 20px rgba(255, 255, 255, 0.12),
            0 0 40px rgba(180, 200, 255, 0.08);
        }

        .animate-glow {
          animation: glowPulse 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}