import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Play,
  RotateCcw,
  Sparkles,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Phone,
  Laptop,
  Smartphone,
  ChevronRight,
  Info,
  Monitor,
  LayoutGrid,
  Volume2,
  VolumeX,
} from "lucide-react";
import logo from "@/assets/qblink-logo.png";
import {
  IndustryType,
  INDUSTRY_PRESETS,
  PitchSimulatorState,
  createInitialPitchState,
  callNextVisitor,
  serveCurrentVisitor,
  simulateTrafficWalkins,
  requestGrace,
} from "@/lib/pitchSimulationEngine";
import { StaffConsoleMockup } from "@/components/pitch/StaffConsoleMockup";
import { CustomerMobileMockup } from "@/components/pitch/CustomerMobileMockup";
import { TvKioskMockup } from "@/components/pitch/TvKioskMockup";
import { staffAudio } from "@/lib/staffAudio";
import { announceTokenChange, playAirportChime } from "@/features/publicDisplay/utils/audioAnnouncer";

type DemoViewMode = "dual" | "triple" | "tv";

export const PitchDemo: React.FC = () => {
  const [industry, setIndustry] = useState<IndustryType>("clinic");
  const [state, setState] = useState<PitchSimulatorState>(() => createInitialPitchState("clinic"));
  const [autoPlay, setAutoPlay] = useState(false);
  const [tourCommentary, setTourCommentary] = useState<string>("");
  const [syncPulse, setSyncPulse] = useState(false);
  const [viewMode, setViewMode] = useState<DemoViewMode>("dual");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Trigger sync pulse animation between devices on state changes
  const triggerSyncEffect = () => {
    setSyncPulse(true);
    setTimeout(() => setSyncPulse(false), 800);
  };

  const handleCallNext = () => {
    setState((prev) => {
      const nextState = callNextVisitor(prev);
      if (soundEnabled && nextState.nowServing) {
        staffAudio.playCallNextChime();
        announceTokenChange({
          tokenNumber: nextState.nowServing.token,
          counterLabel: nextState.counterName,
          enabled: soundEnabled,
        });
      }
      return nextState;
    });
    triggerSyncEffect();
  };

  const handleServeCurrent = () => {
    setState((prev) => serveCurrentVisitor(prev));
    if (soundEnabled) staffAudio.playServedChime();
    triggerSyncEffect();
  };

  const handleSimulateTraffic = () => {
    setState((prev) => simulateTrafficWalkins(prev));
    if (soundEnabled) staffAudio.playNewVisitorChime();
    triggerSyncEffect();
  };

  const handleRequestGrace = () => {
    setState((prev) => requestGrace(prev));
    triggerSyncEffect();
  };

  const handleTogglePause = () => {
    setState((prev) => ({ ...prev, isPaused: !prev.isPaused }));
    triggerSyncEffect();
  };

  const handleReset = (ind: IndustryType = industry) => {
    if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    setAutoPlay(false);
    setTourCommentary("");
    setState(createInitialPitchState(ind));
    triggerSyncEffect();
  };

  const handleIndustryChange = (newInd: IndustryType) => {
    setIndustry(newInd);
    handleReset(newInd);
  };

  // Keyboard shortcut: Spacebar triggers Call Next
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && (e.target === document.body || (e.target as HTMLElement)?.tagName === "BODY")) {
        e.preventDefault();
        handleCallNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [soundEnabled]);

  // Automated Guided Pitch Tour with Step Commentary
  const startAutoTour = () => {
    handleReset();
    setAutoPlay(true);
    let step = 0;

    setTourCommentary("Step 1: Front desk calls the first customer in line...");

    autoPlayTimerRef.current = setInterval(() => {
      step++;
      if (step === 1) {
        handleCallNext();
        setTourCommentary("Step 2: Notice instant sub-10ms browser sync on customer's phone!");
      } else if (step === 2) {
        handleCallNext();
        setTourCommentary("Step 3: Queue progresses — customer holds spot from cafe nearby.");
      } else if (step === 3) {
        handleCallNext();
        setTourCommentary("Step 4: Customer is next! Turn notification triggers arrival alert.");
      } else if (step === 4) {
        handleRequestGrace();
        setTourCommentary("Step 5: Customer taps 'I\\'m 2 mins away' — zero missed turns or desk chaos.");
      } else if (step === 5) {
        handleCallNext();
        setTourCommentary("Step 6: Customer called to Consultation Room 3 with audio chime!");
      } else if (step >= 6) {
        if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
        setAutoPlay(false);
        setTourCommentary("Demo complete! All 3 endpoints synchronized flawlessly.");
      }
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-primary selection:text-white">
      {/* Top Pitch Navigation & Control Strip */}
      <header className="border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-xl px-5 sm:px-8 py-3.5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
          {/* Brand & Back Button */}
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Qblink</span>
            </Link>
            <div className="h-4 w-[1px] bg-slate-800 hidden sm:block" />
            <div className="flex items-center gap-2">
              <img src={logo} alt="Qblink" className="w-6 h-6 object-contain ring-1 ring-primary/30 rounded-md" />
              <span className="font-display font-extrabold text-sm tracking-tight text-white">
                Live Pitch Simulator
              </span>
            </div>
          </div>

          {/* Industry Preset Selector */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800">
            {(Object.keys(INDUSTRY_PRESETS) as IndustryType[]).map((key) => {
              const config = INDUSTRY_PRESETS[key];
              const isSelected = industry === key;
              return (
                <button
                  key={key}
                  onClick={() => handleIndustryChange(key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isSelected
                      ? "bg-primary text-white shadow-xs"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {config.label}
                </button>
              );
            })}
          </div>

          {/* View Mode Switcher */}
          <div className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode("dual")}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                viewMode === "dual" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Dual View
            </button>
            <button
              onClick={() => setViewMode("triple")}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                viewMode === "triple" ? "bg-primary text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Triple Matrix
            </button>
            <button
              onClick={() => setViewMode("tv")}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                viewMode === "tv" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              TV Kiosk Focus
            </button>
          </div>

          {/* Pitch Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled((v) => !v)}
              title={soundEnabled ? "Mute simulator audio" : "Enable simulator audio"}
              className={`p-2 rounded-xl border text-xs font-bold transition-colors ${
                soundEnabled ? "bg-primary/20 border-primary/40 text-primary" : "bg-slate-800 border-slate-700 text-slate-400"
              }`}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={startAutoTour}
              disabled={autoPlay}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                autoPlay
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse"
                  : "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              <span>{autoPlay ? "Tour Running…" : "Auto 60s Tour"}</span>
            </button>

            <button
              onClick={() => handleReset()}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Dual/Triple-Screen Showcase Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-8 flex-1 flex flex-col justify-between w-full">
        {/* Presenter Objective Subtitle & Tour Commentary Banner */}
        <div className="text-center mb-6">
          {tourCommentary ? (
            <motion.div
              key={tourCommentary}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-primary/20 border-2 border-primary/50 text-white text-xs sm:text-sm font-bold shadow-lg mb-3"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-ping" />
              <span>{tourCommentary}</span>
            </motion.div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-bold uppercase tracking-widest mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Real-time Interactive Sandbox
            </div>
          )}

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            One Single Platform. Zero Dedicated Hardware.
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl mx-auto">
            Click <strong className="text-primary font-bold">"Call Next Guest [Space]"</strong> on the counter terminal and watch both the customer's phone and lobby TV board update instantly.
          </p>
        </div>

        {/* View Mode Layouts */}
        {viewMode === "triple" ? (
          /* TRIPLE MATRIX: Terminal + TV Display + Mobile */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
            <div className="lg:col-span-5 flex flex-col h-[520px]">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
                <Laptop className="w-4 h-4 text-primary" />
                <span>1. Staff Counter Terminal</span>
              </div>
              <StaffConsoleMockup
                state={state}
                onCallNext={handleCallNext}
                onServeCurrent={handleServeCurrent}
                onSimulateTraffic={handleSimulateTraffic}
                onTogglePause={handleTogglePause}
              />
            </div>

            <div className="lg:col-span-4 flex flex-col h-[520px]">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
                <Monitor className="w-4 h-4 text-cyan-400" />
                <span>2. Public TV Waiting Kiosk</span>
              </div>
              <TvKioskMockup state={state} />
            </div>

            <div className="lg:col-span-3 flex flex-col items-center">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>3. Customer Mobile Pass</span>
              </div>
              <CustomerMobileMockup
                state={state}
                onRequestGrace={handleRequestGrace}
              />
            </div>
          </div>
        ) : viewMode === "tv" ? (
          /* TV FOCUS VIEW */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8 flex flex-col h-[560px]">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
                <Monitor className="w-4 h-4 text-cyan-400" />
                <span>Public TV Waiting Kiosk (Full-Screen Preview)</span>
              </div>
              <TvKioskMockup state={state} />
            </div>

            <div className="lg:col-span-4 flex flex-col items-center">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>Synchronized Mobile Ticket</span>
              </div>
              <CustomerMobileMockup
                state={state}
                onRequestGrace={handleRequestGrace}
              />
            </div>
          </div>
        ) : (
          /* DUAL VIEW (Standard): Terminal + Mobile */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* LEFT: Business / Staff Console Mockup (7 cols) */}
            <div className="lg:col-span-7 flex flex-col h-[580px] sm:h-[620px]">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
                <Laptop className="w-4 h-4 text-primary" />
                <span>Business / Staff Counter Terminal (Desktop)</span>
              </div>
              <StaffConsoleMockup
                state={state}
                onCallNext={handleCallNext}
                onServeCurrent={handleServeCurrent}
                onSimulateTraffic={handleSimulateTraffic}
                onTogglePause={handleTogglePause}
              />
            </div>

            {/* MIDDLE: Realtime WebSocket Sync Cable / Indicator */}
            <div className="hidden lg:flex lg:col-span-1 flex-col items-center justify-center gap-3">
              <div className="h-20 w-[2px] bg-gradient-to-b from-transparent via-primary/50 to-primary" />
              <motion.div
                animate={{
                  scale: syncPulse ? [1, 1.35, 1] : 1,
                  boxShadow: syncPulse
                    ? "0 0 25px hsl(var(--primary))"
                    : "0 0 0px transparent",
                }}
                className="w-10 h-10 rounded-2xl bg-slate-900 border border-primary text-primary flex items-center justify-center shadow-lg"
              >
                <Zap className="w-5 h-5" />
              </motion.div>
              <span className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-widest text-center">
                Instant Sync
              </span>
              <div className="h-20 w-[2px] bg-gradient-to-b from-primary via-primary/50 to-transparent" />
            </div>

            {/* RIGHT: Customer Mobile Phone Mockup (4 cols) */}
            <div className="lg:col-span-4 flex flex-col items-center">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 self-center sm:self-start px-1">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>Customer Mobile Ticket (Browser)</span>
              </div>
              <CustomerMobileMockup
                state={state}
                onRequestGrace={handleRequestGrace}
              />
            </div>
          </div>
        )}
      </main>

      {/* Presenter Pitch Summary Strip & Key Impact Metrics (Bottom) */}
      <footer className="border-t border-slate-800/80 bg-slate-900/60 px-5 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800/60">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white">100% Zero-App Entry</p>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                No App Store downloads. Instant web app runs on any smartphone.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800/60">
            <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white">Dynamic Wait Engine</p>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Adapts to recent service speeds, eliminating walkaway customer loss.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800/60">
            <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white">Arrival Grace Window</p>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                "I'm 2 mins away" action reduces missed appointments by &gt;90%.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800/60">
            <Monitor className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white">Lobby TV Integration</p>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Synchronized full-screen TV kiosk with audio airport chimes.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PitchDemo;
