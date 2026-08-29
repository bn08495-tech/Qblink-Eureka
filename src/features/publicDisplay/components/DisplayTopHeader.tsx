import React, { useState, useEffect } from "react";
import {
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Sun,
  Moon,
  Clock,
  Radio,
  Sparkles,
} from "lucide-react";
import logo from "@/assets/qblink-logo.png";
import { DisplayConnectionStatus, DisplayTheme } from "../types";
import { playAirportChime } from "../utils/audioAnnouncer";

interface DisplayTopHeaderProps {
  businessName: string;
  queueName: string;
  connectionStatus: DisplayConnectionStatus;
  theme: DisplayTheme;
  audioEnabled: boolean;
  isFullscreen: boolean;
  onToggleTheme: () => void;
  onToggleAudio: () => void;
  onToggleFullscreen: () => void;
}

export const DisplayTopHeader: React.FC<DisplayTopHeaderProps> = ({
  businessName,
  queueName,
  connectionStatus,
  theme,
  audioEnabled,
  isFullscreen,
  onToggleTheme,
  onToggleAudio,
  onToggleFullscreen,
}) => {
  const isLive = connectionStatus === "live";

  const [currentTime, setCurrentTime] = useState<string>("");
  const [currentDate, setCurrentDate] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true })
      );
      setCurrentDate(
        now.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleTestAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    playAirportChime();
  };

  return (
    <header className="w-full flex items-center justify-between gap-4 pb-5 border-b border-border/80 flex-wrap">
      {/* Brand & Location */}
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white p-1 shadow-md ring-1 ring-black/10 flex items-center justify-center shrink-0">
          <img
            src={logo}
            alt="Qblink"
            className="w-full h-full object-contain"
          />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg md:text-xl font-black text-foreground tracking-tight truncate max-w-sm sm:max-w-md">
              {queueName}
            </h1>
            <span className="text-xs text-muted-foreground hidden sm:inline">•</span>
            <span className="text-xs text-muted-foreground font-medium hidden sm:inline">
              {businessName}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isLive ? "bg-emerald-500 animate-pulse" : "bg-amber-500 animate-ping"
              }`}
            />
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              {isLive ? "● LIVE TV BROADCAST" : "RECONNECTING..."}
            </span>
          </div>
        </div>
      </div>

      {/* Clock & Date Widget for Large Screens */}
      {currentTime && (
        <div className="hidden md:flex items-center gap-3 px-4 py-2 rounded-2xl bg-card/80 border border-border/70 shadow-xs">
          <Clock className="w-4 h-4 text-primary" />
          <div className="text-right">
            <p className="font-mono text-sm font-black text-foreground tracking-wider leading-none">
              {currentTime}
            </p>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mt-0.5">
              {currentDate}
            </p>
          </div>
        </div>
      )}

      {/* Action Controls (Audio, Theme, Fullscreen) */}
      <div className="flex items-center gap-2">
        {/* Audio Speech Toggle */}
        <button
          onClick={onToggleAudio}
          title={audioEnabled ? "Disable voice announcements (M)" : "Enable voice announcements (M)"}
          aria-label={audioEnabled ? "Disable voice announcements" : "Enable voice announcements"}
          className={`p-2.5 rounded-xl border transition-all text-xs font-bold flex items-center gap-1.5 ${
            audioEnabled
              ? "bg-primary text-primary-foreground border-primary shadow-xs"
              : "bg-card text-muted-foreground hover:text-foreground border-border"
          }`}
        >
          {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          <span className="hidden md:inline">{audioEnabled ? "Voice On" : "Voice Off"}</span>
          <kbd className="hidden lg:inline-block px-1 py-0.2 rounded bg-black/20 font-mono text-[9px]">M</kbd>
        </button>

        {audioEnabled && (
          <button
            onClick={handleTestAudio}
            title="Test Airport Chime"
            className="p-2 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground text-[10px] font-bold hidden sm:inline-flex items-center gap-1"
          >
            <Radio className="w-3 h-3 text-primary" />
            <span>Test Chime</span>
          </button>
        )}

        {/* Theme Switcher */}
        <button
          onClick={onToggleTheme}
          title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Display (T)`}
          aria-label={`Switch to ${theme === "dark" ? "Light" : "Dark"} Display`}
          className="p-2.5 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          <kbd className="hidden lg:inline-block px-1 py-0.2 rounded bg-muted font-mono text-[9px] text-muted-foreground">T</kbd>
        </button>

        {/* Fullscreen Trigger */}
        <button
          onClick={onToggleFullscreen}
          title={isFullscreen ? "Exit Fullscreen (F)" : "Enter Fullscreen TV Mode (F)"}
          aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen TV Mode"}
          className="p-2.5 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          <span className="text-xs font-bold hidden lg:inline">
            {isFullscreen ? "Exit TV" : "TV Mode"}
          </span>
          <kbd className="hidden lg:inline-block px-1 py-0.2 rounded bg-muted font-mono text-[9px] text-muted-foreground">F</kbd>
        </button>
      </div>
    </header>
  );
};
