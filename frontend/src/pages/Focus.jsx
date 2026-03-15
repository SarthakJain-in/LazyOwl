import { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, BrainCircuit, Coffee } from "lucide-react";

export default function Focus() {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState("work"); // 'work' or 'break'

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      // Optional: Add a browser notification sound here later!
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === "work" ? 25 * 60 : 5 * 60);
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(newMode === "work" ? 25 * 60 : 5 * 60);
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
    <div className="h-full flex flex-col items-center justify-center animate-in fade-in duration-500 max-w-2xl mx-auto space-y-12">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-forge-textPrimary">
          Focus Portal
        </h2>
        <p className="text-forge-textSecondary">
          Eliminate distractions. Build momentum.
        </p>
      </div>

      {/* Mode Selectors */}
      <div className="flex bg-forge-surface p-1.5 rounded-2xl border border-forge-border shadow-sm">
        <button
          onClick={() => switchMode("work")}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
            mode === "work"
              ? "bg-indigo-50 text-forge-accent shadow-sm"
              : "text-forge-textSecondary hover:text-forge-textPrimary"
          }`}
        >
          <BrainCircuit size={18} /> Deep Work
        </button>
        <button
          onClick={() => switchMode("break")}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
            mode === "break"
              ? "bg-green-50 text-green-600 shadow-sm"
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
            mode === "work" ? "bg-forge-accent" : "bg-green-500"
          }`}
        ></div>

        <div className="relative bg-forge-surface w-72 h-72 rounded-full flex flex-col items-center justify-center border-8 border-forge-bg shadow-lg z-10">
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
          className={`flex items-center justify-center w-20 h-20 rounded-full shadow-md text-white transition-transform hover:scale-105 active:scale-95 ${
            mode === "work"
              ? "bg-forge-accent hover:bg-forge-accentHover"
              : "bg-green-500 hover:bg-green-600"
          }`}
        >
          {isActive ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
        </button>

        <button
          onClick={resetTimer}
          className="flex items-center justify-center w-14 h-14 rounded-full bg-forge-surface border border-forge-border text-forge-textSecondary hover:text-forge-textPrimary hover:bg-forge-surfaceHover transition-all shadow-sm"
        >
          <RotateCcw size={24} />
        </button>
      </div>
    </div>
  );
}
