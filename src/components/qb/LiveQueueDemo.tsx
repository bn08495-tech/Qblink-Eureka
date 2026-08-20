import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, FastForward, CheckCircle2, Bell, Sparkles, Activity } from "lucide-react";

const TOTAL_AHEAD = 6;
const TICK_MS = 2800;

export const LiveQueueDemo = () => {
  const [position, setPosition] = useState(TOTAL_AHEAD);
  const [phase, setPhase] = useState<"waiting" | "almost" | "called" | "done">("waiting");
  const [paused, setPaused] = useState(false);
  const [tokenNum] = useState("A-42");

  const estWait = Math.max(1, position * 3);

  const reset = useCallback(() => {
    setPosition(TOTAL_AHEAD);
    setPhase("waiting");
  }, []);

  const advanceOne = useCallback(() => {
    setPosition((p) => {
      const next = p - 1;
      if (next <= 0) {
        setPhase("called");
        setTimeout(() => setPhase("done"), 3200);
        return 0;
      }
      if (next <= 2) setPhase("almost");
      return next;
    });
  }, []);

  useEffect(() => {
    if (paused) return;
    if (phase === "done") return;

    const t = setInterval(advanceOne, TICK_MS);
    return () => clearInterval(t);
  }, [paused, phase, advanceOne]);

  // Radius for circular progress ring
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const progressFraction = (TOTAL_AHEAD - position) / TOTAL_AHEAD;
  const strokeDashoffset = circumference - progressFraction * circumference;

  return (
    <section id="demo" className="relative py-24 md:py-32 overflow-hidden bg-[hsl(var(--surface-warm)/0.4)]" aria-label="Interactive demo">
      {/* Background kinetic ambient halos */}
      <div className="absolute top-1/3 right-1/4 w-96 h-96 rounded-full bg-[hsl(var(--brand-glow)/0.07)] blur-3xl animate-pulse-halo pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full bg-[hsl(var(--brand-blue)/0.08)] blur-3xl animate-float-reverse pointer-events-none" />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Context & Interactive Controls */}
          <div className="lg:col-span-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 font-mono-caps text-primary mb-4 text-xs tracking-[0.2em] uppercase font-semibold">
                <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                Ch. 04 · Interactive Simulation
              </div>

              <h2 className="font-display text-4xl sm:text-5xl md:text-6xl text-foreground leading-[1.02]">
                Watch the wait
                <br />
                <span className="text-primary relative inline-block">
                  dissolve in real time.
                  <span className="absolute left-0 bottom-0 w-full h-1 bg-gradient-to-r from-primary to-secondary opacity-60 rounded-full" />
                </span>
              </h2>

              <p className="mt-6 text-muted-foreground text-base sm:text-lg max-w-lg leading-relaxed">
                This is the exact experience waiting customers hold on their phone. An honest live counter,
                proactive arrival alerts, and zero anxiety standing in line.
              </p>

              {/* Interactive Director Controls */}
              <div className="mt-8 p-4 rounded-2xl bg-card border border-border/80 shadow-sm max-w-md">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center justify-between">
                  <span>Simulator Controls</span>
                  <span className="flex items-center gap-1 text-[11px] text-primary">
                    <Activity className="w-3 h-3 animate-pulse" /> Live engine
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPaused((v) => !v)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2.5 rounded-xl bg-primary text-primary-foreground hover:brightness-110 active:scale-95 transition-all shadow-sm"
                  >
                    {paused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
                    {paused ? "Resume Flow" : "Pause"}
                  </button>

                  <button
                    type="button"
                    onClick={advanceOne}
                    disabled={phase === "done"}
                    className="inline-flex items-center gap-1.5 text-xs font-medium px-3.5 py-2.5 rounded-xl border border-border text-foreground hover:bg-muted active:scale-95 transition-all disabled:opacity-40"
                  >
                    <FastForward className="w-3.5 h-3.5" />
                    Call Next
                  </button>

                  <button
                    type="button"
                    onClick={reset}
                    className="inline-flex items-center gap-1.5 text-xs font-medium px-3.5 py-2.5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted active:scale-95 transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset
                  </button>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-block w-2 h-2 rounded-full bg-success" />
                <span>Simulating 3-minute average service rhythm</span>
              </div>
            </motion.div>
          </div>

          {/* Right Column: High-Fidelity Smartphone Stage */}
          <div className="lg:col-span-6 flex justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-[340px] sm:max-w-[360px]"
            >
              {/* Kinetic Atmospheric Outer Halo */}
              <div className={`absolute -inset-4 rounded-[3.5rem] opacity-60 blur-xl transition-colors duration-1000 ${
                phase === "called" || phase === "done" ? "bg-success/30" : phase === "almost" ? "bg-warning/25" : "bg-primary/20"
              }`} />

              {/* Phone Frame */}
              <div className="relative rounded-[3rem] border-[7px] border-foreground/15 bg-card shadow-2xl overflow-hidden backdrop-blur-md">
                {/* Phone Speaker Notch */}
                <div className="h-8 bg-card flex items-center justify-between px-7 pt-1">
                  <span className="text-[0.6875rem] font-semibold text-foreground/80 tabular-nums">9:41</span>
                  <div className="w-20 h-4 bg-foreground/10 rounded-full flex items-center justify-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-foreground/20" />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-3.5 h-2 rounded-sm bg-foreground/30" />
                  </div>
                </div>

                {/* App Content */}
                <div className="p-5 min-h-[480px] flex flex-col justify-between relative overflow-hidden bg-background/50">
                  {/* Top Bar / Brand header */}
                  <div className="flex items-center justify-between pb-3 border-b border-border/60">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center shadow-xs">
                        <Sparkles className="w-4 h-4 text-primary-foreground animate-pulse" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-foreground">Apex Health & Wellness</div>
                        <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                          Live Sync Active
                        </div>
                      </div>
                    </div>

                    <div className="text-right bg-primary/10 px-2.5 py-1 rounded-xl border border-primary/20">
                      <div className="text-[9px] font-mono font-bold text-primary uppercase">Pass</div>
                      <div className="font-mono text-xs font-black text-primary">#{tokenNum}</div>
                    </div>
                  </div>

                  {/* 3-Step Live Visual Journey Stepper */}
                  <div className="py-2.5 px-3 rounded-2xl bg-card border border-border/70 shadow-xs">
                    <div className="flex items-center justify-between relative">
                      <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-muted -translate-y-1/2 z-0" />
                      <div
                        className="absolute top-1/2 left-4 h-0.5 bg-primary -translate-y-1/2 z-0 transition-all duration-700"
                        style={{
                          width: phase === "called" || phase === "done" ? "88%" : phase === "almost" ? "50%" : "0%",
                        }}
                      />

                      {/* Step 1 */}
                      <div className="relative z-10 flex flex-col items-center">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          position > 2 ? "bg-primary text-primary-foreground ring-2 ring-primary/20" : "bg-primary text-primary-foreground"
                        }`}>
                          1
                        </div>
                        <span className="text-[9px] font-bold text-muted-foreground mt-1">In Line</span>
                      </div>

                      {/* Step 2 */}
                      <div className="relative z-10 flex flex-col items-center">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          phase === "almost"
                            ? "bg-warning text-white ring-4 ring-warning/30 animate-pulse"
                            : phase === "called" || phase === "done"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}>
                          2
                        </div>
                        <span className={`text-[9px] font-bold mt-1 ${phase === "almost" ? "text-warning" : "text-muted-foreground"}`}>
                          Get Ready
                        </span>
                      </div>

                      {/* Step 3 */}
                      <div className="relative z-10 flex flex-col items-center">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          phase === "called" || phase === "done"
                            ? "bg-emerald-500 text-white ring-4 ring-emerald-500/30 animate-bounce"
                            : "bg-muted text-muted-foreground"
                        }`}>
                          3
                        </div>
                        <span className={`text-[9px] font-bold mt-1 ${phase === "called" ? "text-emerald-500" : "text-muted-foreground"}`}>
                          Counter
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Central Digital Boarding Ticket Card */}
                  <div className="my-auto py-2">
                    <AnimatePresence mode="wait">
                      {phase === "called" || phase === "done" ? (
                        <motion.div
                          key="called"
                          initial={{ scale: 0.85, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.85, opacity: 0 }}
                          transition={{ type: "spring", damping: 18, stiffness: 220 }}
                          className="rounded-3xl p-6 bg-emerald-500/10 border-2 border-emerald-500/40 text-center space-y-3 shadow-lg"
                        >
                          <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md animate-bounce">
                            <CheckCircle2 className="w-8 h-8" />
                          </div>

                          <div>
                            <span className="font-mono text-[10px] font-black tracking-widest text-emerald-600 dark:text-emerald-400 uppercase">
                              TURN ACTIVE NOW
                            </span>
                            <div className="font-black text-xl text-foreground mt-0.5">Please Proceed!</div>
                            <p className="text-[11px] text-muted-foreground mt-1">
                              Consultation Room 3 · Token <strong className="text-foreground">#{tokenNum}</strong>
                            </p>
                          </div>

                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 text-white text-[11px] font-bold shadow-xs">
                            <Bell className="w-3.5 h-3.5" /> Present Phone at Desk
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="position"
                          className="rounded-3xl p-5 bg-card border border-border shadow-md text-center space-y-3 relative overflow-hidden"
                        >
                          {/* Circular SVG Progress Ring */}
                          <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                              <circle
                                cx="60"
                                cy="60"
                                r={radius}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="8"
                                className="text-muted/30"
                              />
                              <motion.circle
                                cx="60"
                                cy="60"
                                r={radius}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="8"
                                strokeLinecap="round"
                                strokeDasharray={circumference}
                                animate={{ strokeDashoffset }}
                                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                className={phase === "almost" ? "text-warning" : "text-primary"}
                              />
                            </svg>

                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
                                Ahead of You
                              </span>
                              <motion.span
                                key={position}
                                initial={{ scale: 0.7, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="font-mono text-4xl font-black text-foreground tabular-nums tracking-tighter"
                              >
                                {position}
                              </motion.span>
                              <span className="text-[10px] font-semibold text-muted-foreground">
                                {position === 1 ? "You are NEXT" : `${position} in front`}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground font-medium">
                            <span>Estimated arrival:</span>
                            <strong className="text-foreground font-bold font-mono">~{estWait} min</strong>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Bottom Notification Alert Bar */}
                  <div className="pt-2 text-center">
                    <div className="text-[10px] font-mono text-muted-foreground flex items-center justify-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>Zero battery drain · Real-time push enabled</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
