import React from 'react';

const PageLoader = () => {
  return (
    <div className="flex min-h-[70vh] h-full w-full flex-grow items-center justify-center bg-forge-bg transition-colors">
      <div className="relative flex flex-col items-center justify-center w-24 h-24 rounded-3xl bg-forge-surface border border-forge-border shadow-2xl">
        
        {/* Eyes Container */}
        <div className="flex space-x-3.5 mt-[-10px]">
          {/* Left Eye */}
          <div className="w-5 h-5 rounded-full bg-forge-accent relative overflow-hidden shadow-inner drop-shadow-md">
             <div 
                className="absolute top-0 w-full h-full bg-forge-surface" 
                style={{ animation: 'lazyBlinkSlow 4s infinite cubic-bezier(0.4, 0, 0.2, 1)' }} 
             />
          </div>
          
          {/* Right Eye */}
          <div className="w-5 h-5 rounded-full bg-forge-accent relative overflow-hidden shadow-inner drop-shadow-md">
             <div 
                className="absolute top-0 w-full h-full bg-forge-surface" 
                style={{ animation: 'lazyBlinkSlow 4s infinite cubic-bezier(0.4, 0, 0.2, 1)', animationDelay: '150ms' }} 
             />
          </div>
        </div>

        {/* Minimalist Beak */}
        <div className="absolute top-[52px] w-2.5 h-2.5 bg-indigo-400 rotate-45 rounded-[2px]" />
      </div>

      <style>{`
        @keyframes lazyBlinkSlow {
          0%, 50%, 100% { transform: translateY(-55%); }   /* Half-closed for a long time */
          10%, 15% { transform: translateY(0%); }          /* Blink fully closed */
          30%, 35% { transform: translateY(-70%); }        /* Open slightly wider */
        }
      `}</style>
    </div>
  );
};

export default PageLoader;
