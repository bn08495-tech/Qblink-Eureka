import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { usePublicDisplaySync } from "./hooks/usePublicDisplaySync";
import { DisplayTopHeader } from "./components/DisplayTopHeader";
import { NowServingHero } from "./components/NowServingHero";
import { NextInLineStrip } from "./components/NextInLineStrip";
import { JoinQrKioskCard } from "./components/JoinQrKioskCard";
import { AnnouncementTicker } from "./components/AnnouncementTicker";
import { DisplayTheme } from "./types";
import SEO from "@/components/SEO";
import { Volume2, VolumeX, Sparkles } from "lucide-react";
import { playAirportChime } from "./utils/audioAnnouncer";

interface PublicQueueDisplayProps {
  queueId?: string;
}

export const PublicQueueDisplay: React.FC<PublicQueueDisplayProps> = ({ queueId: propQueueId }) => {
  const { queueId: paramQueueId } = useParams<{ queueId: string }>();
  const activeQueueId = propQueueId || paramQueueId || "";

  const [theme, setTheme] = useState<DisplayTheme>(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark") ? "dark" : "dark";
    }
    return "dark";
  });

  const [audioEnabled, setAudioEnabled] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("qb_display_audio_enabled") === "true";
    }
    return false;
  });

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showAudioPrompt, setShowAudioPrompt] = useState(!audioEnabled);

  const { displayData, refresh } = usePublicDisplaySync(activeQueueId, audioEnabled);

  // Fullscreen management
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {
        setIsFullscreen(true);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const toggleAudio = () => {
    setAudioEnabled((prev) => {
      const next = !prev;
      localStorage.setItem("qb_display_audio_enabled", String(next));
      if (next) {
        setShowAudioPrompt(false);
        playAirportChime();
      }
      return next;
    });
  };

  const enableAudioFromPrompt = () => {
    setAudioEnabled(true);
    localStorage.setItem("qb_display_audio_enabled", "true");
    setShowAudioPrompt(false);
    playAirportChime();
  };

  // Keyboard shortcut listener for TV operators
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const active = document.activeElement as HTMLElement | null;
      if (active?.tagName === "INPUT" || active?.tagName === "TEXTAREA") return;

      if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        toggleAudio();
      } else if (e.key === "t" || e.key === "T") {
        e.preventDefault();
        toggleTheme();
      } else if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        refresh();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [refresh]);

  const isDarkMode = theme === "dark";

  return (
    <div
      className={`min-h-screen w-full transition-colors duration-300 flex flex-col justify-between p-4 sm:p-6 md:p-8 ${
        isDarkMode
          ? "dark bg-[#070b14] text-slate-100"
          : "bg-slate-50 text-slate-900"
      }`}
    >
      <SEO
        title={`${displayData.queueName} — Live Public Display`}
        description={`Live public counter display for ${displayData.queueName}. Track now serving token and scan to join the digital line.`}
        path={`/display/${activeQueueId}`}
      />

      <div className="max-w-7xl w-full mx-auto space-y-5 md:space-y-6 flex-1 flex flex-col justify-between">
        {/* Header */}
        <DisplayTopHeader
          businessName={displayData.businessName}
          queueName={displayData.queueName}
          connectionStatus={displayData.connectionStatus}
          theme={theme}
          audioEnabled={audioEnabled}
          isFullscreen={isFullscreen}
          onToggleTheme={toggleTheme}
          onToggleAudio={toggleAudio}
          onToggleFullscreen={toggleFullscreen}
        />

        {/* Audio Activation Alert for First-time TV setup */}
        {showAudioPrompt && (
          <div
            onClick={enableAudioFromPrompt}
            className="cursor-pointer bg-primary/15 border-2 border-primary/40 hover:bg-primary/20 transition-all rounded-2xl p-3.5 flex items-center justify-between gap-3 text-xs sm:text-sm text-foreground font-semibold shadow-md animate-in fade-in slide-in-from-top-2"
          >
            <div className="flex items-center gap-2.5">
              <Volume2 className="w-5 h-5 text-primary animate-pulse shrink-0" />
              <span>
                🔊 Click here to enable automatic airport chime & voice announcements for called tokens.
              </span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                enableAudioFromPrompt();
              }}
              className="px-3 py-1 rounded-xl gradient-bg text-primary-foreground font-bold text-xs shrink-0 shadow-xs"
            >
              Enable Audio
            </button>
          </div>
        )}

        {/* Main TV Layout: Dynamic Responsive Split on Large Displays */}
        <main className="flex-1 flex flex-col justify-center my-auto py-2">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left Giant Hero Now Serving Area (7 Columns on large screens) */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              <NowServingHero displayData={displayData} />
            </div>

            {/* Right Information & Arrival Column (5 Columns on large screens) */}
            <div className="lg:col-span-5 flex flex-col justify-center space-y-4">
              <NextInLineStrip
                nextTokens={displayData.nextTokens}
                waitingCount={displayData.waitingCount}
                estimatedWaitMinutes={displayData.estimatedWaitMinutes}
              />

              {displayData.status !== "closed" && (
                <JoinQrKioskCard
                  queueId={displayData.queueId}
                  queueName={displayData.queueName}
                />
              )}
            </div>
          </div>
        </main>

        {/* Footer: Live Announcement Ticker */}
        <footer className="pt-1">
          <AnnouncementTicker
            businessName={displayData.businessName}
            queueName={displayData.queueName}
            waitingCount={displayData.waitingCount}
            estimatedWaitMinutes={displayData.estimatedWaitMinutes}
          />
        </footer>
      </div>
    </div>
  );
};

export default PublicQueueDisplay;
