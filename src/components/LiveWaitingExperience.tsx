import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  Activity,
  Clock,
  RefreshCw,
  Sparkles,
  Users,
  Wifi,
  BellRing,
  Timer,
  Hourglass,
  Zap,
  Share2,
  Bookmark,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  QrCode,
  Smartphone,
} from "lucide-react";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { WebPushProvider, NotificationPermissionState } from "@/lib/notifications/providers/webPushProvider";
import { formatGraceCountdown, getRemainingGraceSeconds, GraceStatus } from "@/lib/arrivalGraceEngine";
import { toast } from "sonner";
import { hapticSuccess } from "@/lib/haptics";

interface Props {
  ahead: number;
  waitMinutes: number;
  liveStatus: string;
  myToken: number | null;
  nowServing: number | null;
  serviceTime: number;
  onRefresh: () => void;
  /** Number of people ahead when the user first joined. Used to compute true progress %. */
  initialAhead?: number;
  /** Epoch ms when the user joined. Used to compute saved-time counter. */
  joinedAt?: number;
  /** Arrival grace period support */
  graceStatus?: GraceStatus;
  graceExpiresAt?: number | null;
  onRequestGrace?: () => void;
  /** Dynamic rolling velocity metadata */
  velocityConfidence?: number;
  effectiveVelocity?: number;
}

/**
 * Enhanced Digital Boarding Pass & Live Queue Experience.
 * Features:
 * 1. Tactile Boarding Pass Morphism with notch cutaways & dynamic status glow
 * 2. 3-Step Live Visual Journey Stepper (Joined -> Get Ready -> Head to Counter)
 * 3. Prominent Arrival Grace Timer ("I'm walking over - 2 mins")
 * 4. Pass Utilities (Share, Add to Wallet/Bookmark, Push Alerts)
 */
const LiveWaitingExperience = ({
  ahead,
  waitMinutes,
  liveStatus,
  myToken,
  nowServing,
  serviceTime,
  onRefresh,
  initialAhead,
  joinedAt,
  graceStatus = "none",
  graceExpiresAt,
  onRequestGrace,
  velocityConfidence,
  effectiveVelocity,
}: Props) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshBtnRef = useRef<HTMLButtonElement | null>(null);
  const [pushState, setPushState] = useState<NotificationPermissionState>(() => WebPushProvider.getPermission());
  const [graceRemaining, setGraceRemaining] = useState<number>(0);

  useEffect(() => {
    if (graceExpiresAt) {
      const update = () => setGraceRemaining(getRemainingGraceSeconds(graceExpiresAt));
      update();
      const interval = setInterval(update, 1000);
      return () => clearInterval(interval);
    }
  }, [graceExpiresAt]);

  const handleEnableNotifications = async () => {
    const res = await WebPushProvider.requestPermission();
    setPushState(res);
    if (res === "granted") {
      hapticSuccess();
      toast.success("Turn alerts enabled!", {
        description: "We'll notify you even if your phone screen is locked or browser is in the background.",
      });
    }
  };

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await Promise.resolve(onRefresh());
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const handleSharePass = async () => {
    const shareData = {
      title: `Qblink Pass: Token #${myToken}`,
      text: `Track my live queue spot for Token #${myToken} on Qblink!`,
      url: window.location.href,
    };
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        toast.success("Digital pass shared!");
      } catch {}
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Pass link copied to clipboard!", {
        description: "Bookmark or save this URL to track your spot anytime.",
      });
    }
  };

  // Keyboard shortcut: "R" to refresh
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable) return;
      if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        refreshBtnRef.current?.focus();
        handleRefresh();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isRefreshing]);

  // True position-based progress
  const baseline = Math.max(initialAhead ?? ahead, ahead, 1);
  const moved = Math.max(baseline - ahead, 0);
  const progressPct = ahead === 0 ? 100 : Math.min(95, Math.round((moved / baseline) * 100));

  // Saved-time counter
  const [nowTs, setNowTs] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNowTs(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);
  const minutesSaved = joinedAt ? Math.max(0, Math.floor((nowTs - joinedAt) / 60_000)) : 0;

  // Sound + haptic on queue progress
  const prevAheadRef = useRef<number>(ahead);
  useEffect(() => {
    const prev = prevAheadRef.current;
    if (ahead < prev) {
      try {
        const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
        if (Ctx) {
          const ctx = new Ctx();
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = "sine";
          o.frequency.value = 880;
          g.gain.setValueAtTime(0, ctx.currentTime);
          g.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.02);
          g.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.18);
          o.connect(g).connect(ctx.destination);
          o.start();
          o.stop(ctx.currentTime + 0.2);
          setTimeout(() => ctx.close(), 400);
        }
      } catch {}
      if ("vibrate" in navigator) {
        try { (navigator as any).vibrate?.(20); } catch {}
      }
    }
    prevAheadRef.current = ahead;
  }, [ahead]);

  // Step state derivation
  // Step 1: Joined Line
  // Step 2: Get Ready (Top 3)
  // Step 3: Head to Counter Now
  const currentStep = ahead === 0 ? 3 : ahead <= 2 ? 2 : 1;

  // Visual Theme based on urgency
  const isUrgent = ahead === 0;
  const isApproaching = ahead > 0 && ahead <= 2;

  // Rotating microcopy
  const lines = [
    "Real-time sync keeps your position 100% verified.",
    "Adaptive service velocity adapts to counter pace.",
    "Wait comfortably anywhere — no need to crowd the counter.",
    "Turn alerts will sound when you are called.",
  ];
  const [lineIdx, setLineIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setLineIdx((i) => (i + 1) % lines.length), 4500);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative w-full" aria-label="Digital Queue Pass">
      {/* Ambient background aura */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-3xl">
        <motion.div
          aria-hidden
          className="absolute -top-16 -left-10 h-64 w-64 rounded-full blur-3xl"
          style={{
            background: isUrgent
              ? "radial-gradient(circle, rgba(16,185,129,0.35), transparent 70%)"
              : isApproaching
                ? "radial-gradient(circle, rgba(245,158,11,0.35), transparent 70%)"
                : "radial-gradient(circle, hsl(var(--primary)/0.35), transparent 70%)",
          }}
          animate={{ x: [0, 20, -10, 0], y: [0, 15, -10, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* 3-Step Live Visual Journey Stepper */}
      <div className="mb-4 bg-card/80 backdrop-blur-md rounded-2xl border border-border/80 p-3.5 shadow-sm">
        <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground mb-2 px-1">
          <span>Live Queue Progress</span>
          <span className="font-mono text-primary font-bold">{progressPct}% Complete</span>
        </div>
        <div className="relative flex items-center justify-between">
          {/* Connector line */}
          <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-muted rounded-full -z-0">
            <motion.div
              className="h-full bg-gradient-to-r from-primary via-emerald-500 to-emerald-400 rounded-full"
              initial={{ width: 0 }}
              animate={{
                width: currentStep === 1 ? "15%" : currentStep === 2 ? "60%" : "100%",
              }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>

          {/* Step 1 */}
          <div className="relative z-10 flex flex-col items-center gap-1 text-center w-20">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm ${
                currentStep >= 1
                  ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {currentStep > 1 ? <CheckCircle2 className="w-4 h-4" /> : "1"}
            </div>
            <span className={`text-[10px] leading-tight ${currentStep === 1 ? "font-bold text-foreground" : "text-muted-foreground"}`}>
              In Line
            </span>
          </div>

          {/* Step 2 */}
          <div className="relative z-10 flex flex-col items-center gap-1 text-center w-24">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm ${
                currentStep >= 2
                  ? currentStep > 2
                    ? "bg-emerald-500 text-white ring-4 ring-emerald-500/20"
                    : "bg-amber-500 text-white ring-4 ring-amber-500/20 animate-pulse"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {currentStep > 2 ? <CheckCircle2 className="w-4 h-4" /> : "2"}
            </div>
            <span className={`text-[10px] leading-tight ${currentStep === 2 ? "font-bold text-amber-500" : "text-muted-foreground"}`}>
              Get Ready
            </span>
          </div>

          {/* Step 3 */}
          <div className="relative z-10 flex flex-col items-center gap-1 text-center w-20">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm ${
                currentStep === 3
                  ? "bg-emerald-600 text-white ring-4 ring-emerald-500/30 animate-bounce"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              3
            </div>
            <span className={`text-[10px] leading-tight ${currentStep === 3 ? "font-bold text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}>
              Counter
            </span>
          </div>
        </div>
      </div>

      {/* Dynamic Digital Boarding Pass Card */}
      <motion.div
        initial={{ opacity: 0, y: 14, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`relative overflow-hidden rounded-3xl border bg-card/90 backdrop-blur-xl shadow-xl transition-all ${
          isUrgent
            ? "border-emerald-500/40 ring-2 ring-emerald-500/20 shadow-emerald-500/10"
            : isApproaching
              ? "border-amber-500/40 ring-2 ring-amber-500/20 shadow-amber-500/10"
              : "border-border/90 shadow-primary/5"
        }`}
      >
        {/* Pass Header Banner */}
        <div
          className={`px-5 py-3 flex items-center justify-between border-b transition-colors ${
            isUrgent
              ? "bg-emerald-500/15 border-emerald-500/25 text-emerald-600 dark:text-emerald-400"
              : isApproaching
                ? "bg-amber-500/15 border-amber-500/25 text-amber-600 dark:text-amber-400"
                : "bg-primary/10 border-primary/20 text-primary"
          }`}
        >
          <div className="flex items-center gap-2 text-xs font-bold tracking-wide uppercase">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isUrgent ? "bg-emerald-500" : isApproaching ? "bg-amber-500" : "bg-primary"
              }`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                isUrgent ? "bg-emerald-500" : isApproaching ? "bg-amber-500" : "bg-primary"
              }`} />
            </span>
            <span>{isUrgent ? "Token Called — Proceed to Counter" : isApproaching ? "Almost Ready — Top 3 in Line" : "Live Boarding Pass"}</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
            <Wifi className="w-3 h-3 text-emerald-500" />
            <span>Synced</span>
          </div>
        </div>

        {/* Pass Body */}
        <div className="p-5 relative">
          {/* Faint Background Token Watermark */}
          <div className="pointer-events-none absolute right-2 bottom-12 select-none text-[8rem] font-black text-foreground/[0.03] leading-none">
            #{myToken}
          </div>

          <div className="flex items-center gap-5">
            {/* SVG Progress Ring */}
            <div
              className="relative h-28 w-28 shrink-0"
              role="progressbar"
              aria-label={`Queue progress for token ${myToken ?? ""}`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progressPct}
            >
              <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-hidden="true" focusable="false">
                <defs>
                  <linearGradient id="pass-ring" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={isUrgent ? "#10B981" : isApproaching ? "#F59E0B" : "hsl(var(--primary))"} />
                    <stop offset="100%" stopColor={isUrgent ? "#34D399" : isApproaching ? "#FBBF24" : "hsl(var(--secondary))"} />
                  </linearGradient>
                </defs>
                <circle cx="60" cy="60" r="50" stroke="hsl(var(--muted))" strokeWidth="8" fill="none" opacity="0.6" />
                <motion.circle
                  cx="60" cy="60" r="50" fill="none"
                  stroke="url(#pass-ring)" strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 50}
                  initial={{ strokeDashoffset: 2 * Math.PI * 50 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 50 * (1 - progressPct / 100) }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Your Token</span>
                <span className="text-2xl font-black text-foreground leading-tight tracking-tight">#{myToken}</span>
                <span className={`text-[10px] font-bold mt-0.5 ${isUrgent ? "text-emerald-600 dark:text-emerald-400" : isApproaching ? "text-amber-500" : "text-primary"}`}>
                  <AnimatedNumber value={progressPct} suffix="% progress" ariaLive={false} />
                </span>
              </div>
            </div>

            {/* Now Serving & Position Details */}
            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground">Now Serving at Counter</p>
              <p className="text-3xl font-extrabold text-foreground leading-tight">
                {typeof nowServing === "number" ? (
                  <AnimatedNumber value={nowServing} prefix="#" invertHighlight ariaLive={false} />
                ) : (
                  <span>—</span>
                )}
              </p>
              <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                <Activity className="w-3 h-3" /> {liveStatus}
              </div>
            </div>
          </div>

          {/* Feature: 5-Min / 2-Min Arrival Grace Card ("I'm Walking Over") */}
          {(ahead <= 1 || liveStatus.includes("next")) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-4 p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-transparent border border-amber-500/30"
            >
              {graceStatus === "active" || graceStatus === "requested" ? (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center animate-pulse">
                      <Hourglass className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">Arrival Grace Active</h4>
                      <p className="text-[11px] text-muted-foreground">
                        Counter notified you're walking over
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-base font-black text-amber-500 block">
                      {formatGraceCountdown(graceRemaining)}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Hold Time</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div>
                    <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <span>Walking over from parking / nearby?</span>
                    </h4>
                    <p className="text-[11px] text-muted-foreground">
                      Let staff know so they don't skip your turn.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onRequestGrace}
                    className="px-3.5 py-2 rounded-xl bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 transition-all shadow-sm shrink-0 inline-flex items-center justify-center gap-1"
                  >
                    <span>I'm on my way (2m)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* Key Metric Tiles */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-border/80 bg-background/60 backdrop-blur p-3">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                <Users className="w-3.5 h-3.5 text-primary" /> Ahead in Line
              </div>
              <p className="text-xl font-black text-foreground">
                <AnimatedNumber value={ahead} ariaLive={false} />
                <span className="text-xs font-normal text-muted-foreground ml-1">people</span>
              </p>
            </div>
            <div className="rounded-2xl border border-border/80 bg-background/60 backdrop-blur p-3">
              <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-primary" /> Est. Wait</span>
                {velocityConfidence && velocityConfidence >= 70 && (
                  <span className="text-[9px] text-emerald-500 font-bold flex items-center gap-0.5">
                    <Zap className="w-2.5 h-2.5" /> Live
                  </span>
                )}
              </div>
              <p className="text-xl font-black text-foreground">
                <AnimatedNumber value={waitMinutes} suffix=" min" ariaLive={false} />
              </p>
            </div>
          </div>
        </div>

        {/* Perforated Notch Divider Line */}
        <div className="relative flex items-center justify-between px-4 py-1 -my-1" aria-hidden="true">
          <div className="w-4 h-8 bg-background border-r border-border rounded-r-full -ml-4" />
          <div className="flex-1 border-b-2 border-dashed border-border/80 mx-2" />
          <div className="w-4 h-8 bg-background border-l border-border rounded-l-full -mr-4" />
        </div>

        {/* Pass Stub: Utility & Actions */}
        <div className="p-4 bg-muted/30 border-t border-border/40 flex flex-col gap-3">
          {/* Reassurance Offline/Lock Screen Badge */}
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <p className="text-[11px] text-emerald-950 dark:text-emerald-200 font-medium">
              <strong>Your spot is 100% secured.</strong> You can close this tab or lock your phone — your place in line will not be lost.
            </p>
          </div>

          {/* Proactive Push Notification Banner */}
          {pushState !== "granted" && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-2.5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <BellRing className="w-4 h-4 text-primary shrink-0" />
                <p className="text-xs text-foreground font-medium">Get sound & lock-screen turn alerts</p>
              </div>
              <button
                type="button"
                onClick={handleEnableNotifications}
                className="px-3 py-1 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-opacity shrink-0"
              >
                Enable
              </button>
            </div>
          )}

          {/* Saved physical time counter */}
          {joinedAt && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-background/50 rounded-xl p-2 border border-border/60">
              <Timer className="w-4 h-4 text-primary shrink-0" />
              <span>
                Qblink saved you <strong className="text-primary font-bold"><AnimatedNumber value={minutesSaved} suffix=" min" /></strong> of physical line standing.
              </span>
            </div>
          )}

          {/* Action buttons: Share Pass / Bookmark / Refresh */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={handleSharePass}
              className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-border bg-card text-foreground text-xs font-semibold hover:bg-muted transition-colors shadow-sm"
            >
              <Share2 className="w-3.5 h-3.5 text-primary" />
              <span>Share / Save Pass</span>
            </button>
            <button
              ref={refreshBtnRef}
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-border bg-card text-foreground text-xs font-semibold hover:bg-muted transition-colors shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-primary" : "text-muted-foreground"}`} />
              <span>{isRefreshing ? "Refreshing…" : "Sync (R)"}</span>
            </button>
          </div>
        </div>

        {/* Rotating Microcopy Bar */}
        <div className="py-2 px-4 bg-muted/60 text-center border-t border-border/30">
          <AnimatePresence mode="wait">
            <motion.p
              key={lineIdx}
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -8, opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="text-[11px] font-medium text-muted-foreground flex items-center justify-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-primary inline" />
              <span>{lines[lineIdx]}</span>
            </motion.p>
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  );
};

export default LiveWaitingExperience;