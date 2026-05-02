import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, BrainCircuit, Coffee } from "lucide-react";
import { useAppStore } from "../store/useAppStore";

export default function Focus() {
  const { focusState, setFocusState, addFocusTime } = useAppStore();
  const { timeLeft, isActive, mode, lastTick, workTimeLeft, breakTimeLeft } = focusState;

  const accumulatedSecondsRef = useRef(0);

  // Function to sync accumulated time to backend
  const syncFocusTime = () => {
    console.log("syncFocusTime called. Accumulated:", accumulatedSecondsRef.current);
    if (accumulatedSecondsRef.current > 0) {
      console.log("Sending to backend:", accumulatedSecondsRef.current);
      addFocusTime(accumulatedSecondsRef.current);
      accumulatedSecondsRef.current = 0;
    }
  };

  // Initialize: if coming back, calculate elapsed time
  useEffect(() => {
    if (isActive && lastTick) {
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - lastTick) / 1000);
      if (elapsedSeconds > 0) {
        const newTimeLeft = Math.max(0, timeLeft - elapsedSeconds);
        if (mode === "work") {
          // If they were away, add the elapsed time (up to whatever time was left)
          const validWorkSeconds = Math.min(elapsedSeconds, timeLeft);
          accumulatedSecondsRef.current += validWorkSeconds;
        }
        setFocusState({ timeLeft: newTimeLeft, lastTick: now });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const lastTickRef = useRef(lastTick);
  const timeLeftRef = useRef(timeLeft);
  
  // Keep the refs strictly in sync with the state
  useEffect(() => {
    lastTickRef.current = lastTick;
    timeLeftRef.current = timeLeft;
  }, [lastTick, timeLeft]);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeftRef.current > 0) {
      interval = setInterval(() => {
        const now = Date.now();
        // Use the ref to prevent dependency thrashing
        const safeLastTick = lastTickRef.current || now;
        const elapsedSeconds = Math.floor((now - safeLastTick) / 1000);

        if (elapsedSeconds >= 1) {
          const newTimeLeft = Math.max(0, timeLeftRef.current - elapsedSeconds);
          
          // Update refs immediately so the next tick calculates correctly
          lastTickRef.current = safeLastTick + elapsedSeconds * 1000;
          timeLeftRef.current = newTimeLeft;

          setFocusState({
            timeLeft: newTimeLeft,
            lastTick: lastTickRef.current,
          });
          
          if (mode === "work") {
            accumulatedSecondsRef.current += elapsedSeconds;
            
            // Auto-sync every 1 minute to ensure data isn't lost if they navigate away unexpectedly
            if (accumulatedSecondsRef.current >= 60) {
              syncFocusTime();
            }
          }
        }
      }, 500);
    } else if (timeLeft === 0 && isActive) {
      setFocusState({ isActive: false });
      syncFocusTime();
      // Optional: Add a browser notification sound here later!
    }
    return () => {
      if (interval) clearInterval(interval);
    };
    // Removed timeLeft and lastTick from dependencies!
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, mode]);

  // Also sync when unmounting
  useEffect(() => {
    return () => syncFocusTime();
  }, []);

  const toggleTimer = () => {
    if (isActive) {
      // Pausing
      syncFocusTime();
    }
    setFocusState({ isActive: !isActive, lastTick: Date.now() });
  };

  const resetTimer = () => {
    syncFocusTime();
    const defaultTime = mode === "work" ? 25 * 60 : 5 * 60;
    setFocusState({
      isActive: false,
      timeLeft: defaultTime,
      workTimeLeft: mode === "work" ? defaultTime : workTimeLeft,
      breakTimeLeft: mode === "break" ? defaultTime : breakTimeLeft,
      lastTick: null,
    });
  };

  const switchMode = (newMode) => {
    if (newMode === mode) return;

    syncFocusTime();
    
    // Save current progress
    let savedWorkTime = mode === "work" ? timeLeft : workTimeLeft;
    let savedBreakTime = mode === "break" ? timeLeft : breakTimeLeft;

    // Determine what the new time left should be
    let nextTimeLeft = newMode === "work" ? savedWorkTime : savedBreakTime;
    
    // Auto-reset if they switch to a mode that was already completed
    if (nextTimeLeft === 0) {
      nextTimeLeft = newMode === "work" ? 25 * 60 : 5 * 60;
      if (newMode === "work") savedWorkTime = nextTimeLeft;
      if (newMode === "break") savedBreakTime = nextTimeLeft;
    }

    setFocusState({
      mode: newMode,
      isActive: isActive,
      workTimeLeft: savedWorkTime,
      breakTimeLeft: savedBreakTime,
      timeLeft: nextTimeLeft,
      lastTick: isActive ? Date.now() : null,
    });
  };

  // Format seconds into MM:SS
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="h-full flex flex-col items-center justify-center animate-in fade-in duration-500 w-full space-y-8">
      {/* Mode Selectors */}
      <div className="flex bg-forge-surface p-1.5 rounded-xl border border-forge-border shadow-brand">
        <button
          onClick={() => switchMode("work")}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
            mode === "work"
              ? "bg-forge-accent/10 text-forge-accent shadow-brand"
              : "text-forge-textSecondary hover:text-forge-textPrimary"
          }`}
        >
          <BrainCircuit size={18} /> Deep Work
        </button>
        <button
          onClick={() => switchMode("break")}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
            mode === "break"
              ? "bg-forge-success/10 text-forge-success shadow-brand"
              : "text-forge-textSecondary hover:text-forge-textPrimary"
          }`}
        >
          <Coffee size={18} /> Short Break
        </button>
      </div>

      {/* Timer Display */}
      <div className="relative flex items-center justify-center">
        {/* Decorative background glow */}
        <div
          className={`absolute inset-0 rounded-full blur-3xl opacity-20 ${
            mode === "work" ? "bg-forge-accent" : "bg-forge-success"
          }`}
        ></div>

        <div className="relative bg-forge-surface w-72 h-72 rounded-full flex flex-col items-center justify-center border-8 border-forge-bg shadow-brand z-10">
          <span className="text-7xl font-bold tracking-tighter text-forge-textPrimary">
            {formatTime(timeLeft)}
          </span>
          <span className="text-sm font-semibold text-forge-textSecondary tracking-widest uppercase mt-2">
            {mode === "work" ? "Stay Focused" : "Rest Your Mind"}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-6">
        <button
          onClick={toggleTimer}
          className={`flex items-center justify-center w-20 h-20 rounded-full shadow-brand text-white transition-transform hover:scale-105 active:scale-95 ${
            mode === "work"
              ? "bg-forge-accent hover:bg-forge-accentHover"
              : "bg-forge-success hover:bg-forge-success/80"
          }`}
        >
          {isActive ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
        </button>

        <button
          onClick={resetTimer}
          className="flex items-center justify-center w-14 h-14 rounded-full bg-forge-surface border border-forge-border text-forge-textSecondary hover:text-forge-textPrimary hover:bg-forge-surfaceHover transition-all shadow-brand"
        >
          <RotateCcw size={24} />
        </button>
      </div>
    </div>
  );
}
