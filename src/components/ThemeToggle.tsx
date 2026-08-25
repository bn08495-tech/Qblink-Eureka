import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

type Props = {
  className?: string;
  size?: "sm" | "md";
};

/**
 * Quick sun/moon theme toggle. Uses semantic tokens so it looks
 * correct in both themes.
 */
export const ThemeToggle = ({ className = "", size = "md" }: Props) => {
  const { theme, toggle } = useTheme();
  const dim = size === "sm" ? "w-8 h-8" : "w-9 h-9";
  const icon = size === "sm" ? "w-4 h-4" : "w-[18px] h-[18px]";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      title={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      className={`no-theme-transition relative inline-flex items-center justify-center ${dim} rounded-full border border-border bg-card/90 dark:bg-card/40 backdrop-blur-md text-foreground hover:text-primary hover:border-primary/60 shadow-xs transition-colors shrink-0 ${className}`}
    >
      <Sun
        className={`${icon} absolute text-amber-500 transition-all duration-500 ${
          theme === "dark" ? "opacity-0 rotate-90 scale-50" : "opacity-100 rotate-0 scale-100"
        }`}
      />
      <Moon
        className={`${icon} absolute text-cyan-400 transition-all duration-500 ${
          theme === "dark" ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-50"
        }`}
      />
    </button>
  );
};