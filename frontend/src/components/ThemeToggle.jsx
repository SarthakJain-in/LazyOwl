import { Sun, Moon } from "lucide-react";
import { useAppStore } from "../store/useAppStore";

export default function ThemeToggle() {
  const { isDarkMode, toggleTheme } = useAppStore();

  const handleToggle = (e) => {
    // Get the center of the button as the ripple origin
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    
    toggleTheme(x, y);
  };

  return (
    <button
      onClick={handleToggle}
      className="p-2 rounded-full border border-forge-border/60 text-forge-textSecondary hover:text-forge-textPrimary hover:border-forge-textPrimary transition-colors relative overflow-hidden group flex items-center justify-center w-11 h-11 active:scale-95"
      title="Toggle Theme"
    >
      <div className="relative w-6 h-6 flex items-center justify-center">
        {isDarkMode ? (
          <Moon size={20} strokeWidth={2} className="text-forge-accent" />
        ) : (
          <Sun size={20} strokeWidth={2} className="text-forge-accent" />
        )}
      </div>
    </button>
  );
}
