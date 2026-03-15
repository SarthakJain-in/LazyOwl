import { Sun, Moon } from "lucide-react";
import { useAppStore } from "../store/useAppStore";

export default function ThemeToggle() {
  const { isDarkMode, toggleTheme } = useAppStore();

  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 rounded-xl bg-forge-surface border border-forge-border text-forge-textSecondary hover:text-forge-accent hover:border-forge-accent transition-all shadow-sm relative overflow-hidden group"
      title="Toggle Theme"
    >
      <div className="relative w-5 h-5">
        <Sun
          className={`absolute inset-0 transition-all duration-500 ease-in-out ${
            isDarkMode
              ? "opacity-0 rotate-90 scale-50"
              : "opacity-100 rotate-0 scale-100"
          }`}
        />
        <Moon
          className={`absolute inset-0 transition-all duration-500 ease-in-out ${
            isDarkMode
              ? "opacity-100 rotate-0 scale-100"
              : "opacity-0 -rotate-90 scale-50"
          }`}
        />
      </div>
    </button>
  );
}
