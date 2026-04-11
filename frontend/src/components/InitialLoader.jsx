import React, { useState, useEffect } from 'react';

const InitialLoader = ({ onComplete }) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Elegant, smooth transition timing
    const timer = setTimeout(() => {
      setIsReady(true);
      setTimeout(onComplete, 800);
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#050508] transition-all duration-700 ease-in-out ${
        isReady ? 'opacity-0 scale-[1.02] pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      <div className="flex flex-col items-center z-10">
        
        {/* Exact App Logo Replication */}
        <div className="relative mb-6">
          <span
            className="font-black text-5xl md:text-6xl tracking-tighter animate-pulse text-white/90"
            style={{
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            LazyOwl.
          </span>
          
          {/* Subtle glowing reflection behind it */}
          <div className="absolute inset-0 bg-blue-500/10 blur-2xl rounded-full scale-150 -z-10 animate-pulse mix-blend-screen" />
        </div>

        {/* Minimal Progress Line */}
        <div className="w-48 h-[2px] bg-white/10 overflow-hidden rounded-full">
          <div 
            className="h-full bg-white/60"
            style={{
              animation: 'loadProgress 2s cubic-bezier(0.4, 0, 0.2, 1) forwards'
            }}
          />
          <style>{`
            @keyframes loadProgress {
              0% { transform: translateX(-100%); width: 50%; opacity: 0; }
              20% { opacity: 1; }
              80% { opacity: 1; }
              100% { transform: translateX(250%); width: 50%; opacity: 0; }
            }
          `}</style>
        </div>
        
      </div>
    </div>
  );
};

export default InitialLoader;
