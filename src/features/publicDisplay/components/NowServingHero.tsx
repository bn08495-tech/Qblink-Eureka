import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Clock, AlertTriangle, PauseCircle, CheckCircle2, Volume2, Radio } from "lucide-react";
import { PublicDisplayState } from "../types";

interface NowServingHeroProps {
  displayData: PublicDisplayState;
}

export const NowServingHero: React.FC<NowServingHeroProps> = ({ displayData }) => {
  const { currentToken, counterLabel, status, waitingCount, queueType } = displayData;

  const isPaused = status === "paused";
  const isClosed = status === "closed";
  const isEmpty = !currentToken && waitingCount === 0;

  const getServingLabel = () => {
    if (queueType === "restaurant") return "NOW SEATING";
    return "NOW SERVING";
  };

  return (
    <div className="w-full flex flex-col items-center justify-center p-8 sm:p-12 md:p-14 rounded-3xl bg-card border-2 border-primary/40 shadow-2xl relative overflow-hidden text-center min-h-[360px] md:min-h-[440px]">
      {/* Decorative High-Contrast Airport Radar Glow */}
      <div className="absolute -inset-2 bg-radial from-primary/15 via-primary/5 to-transparent pointer-events-none blur-xl" />

      {/* PAUSED STATE */}
      {isPaused && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4 max-w-lg z-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 text-amber-500 font-black text-sm uppercase tracking-widest border border-amber-500/40">
            <PauseCircle className="w-5 h-5 animate-pulse" />
            <span>QUEUE PAUSED</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-foreground">
            Service Temporarily On Hold
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Please remain seated nearby. The counter will resume calling numbers shortly.
          </p>
        </motion.div>
      )}

      {/* CLOSED STATE */}
      {isClosed && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4 max-w-lg z-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-muted-foreground font-black text-sm uppercase tracking-widest border border-border">
            <Clock className="w-5 h-5" />
            <span>QUEUE CONCLUDED</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-foreground">
            Queue Closed for Today
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Check-ins are concluded for this session. Thank you for visiting!
          </p>
        </motion.div>
      )}

      {/* EMPTY STATE */}
      {!isPaused && !isClosed && isEmpty && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4 max-w-lg z-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-black text-sm uppercase tracking-widest border border-emerald-500/40">
            <CheckCircle2 className="w-5 h-5 animate-bounce" />
            <span>COUNTERS READY</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-foreground">
            Zero Waiting Time
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Scan the TV QR code below to join and receive instant service.
          </p>
        </motion.div>
      )}

      {/* ACTIVE NOW SERVING HERO */}
      {!isPaused && !isClosed && !isEmpty && (
        <div className="z-10 flex flex-col items-center justify-center space-y-3 w-full">
          {/* Header Tag with Pulsing Attention Beacon */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary shadow-xs">
            <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
            <span className="font-mono text-xs sm:text-sm font-black uppercase tracking-[0.25em]">
              {getServingLabel()}
            </span>
          </div>

          {/* Giant Monospace Token Display with Smooth Spring Physics */}
          <div className="py-2 relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentToken || "empty"}
                initial={{ opacity: 0, scale: 0.8, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.1, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className="font-mono font-black text-7xl sm:text-9xl md:text-[10rem] lg:text-[11.5rem] tracking-tighter text-foreground leading-none drop-shadow-md select-none relative z-10"
              >
                {currentToken ? `#${currentToken}` : "—"}
              </motion.div>
            </AnimatePresence>

            {/* Glowing Ring Effect on Active Token */}
            {currentToken && (
              <div className="absolute inset-0 -m-6 rounded-full bg-primary/10 filter blur-2xl animate-pulse pointer-events-none" />
            )}
          </div>

          {/* Station / Counter Destination Pill */}
          <div className="pt-1">
            <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-muted/80 border border-border text-foreground font-black text-base sm:text-lg md:text-xl shadow-sm">
              <Sparkles className="w-5 h-5 text-primary animate-spin" style={{ animationDuration: "6s" }} />
              <span>{counterLabel || (queueType === "restaurant" ? "Proceed to Host Desk" : "Proceed to Front Counter")}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
