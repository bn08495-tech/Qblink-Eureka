import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Monitor, Users, Clock, QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { PitchSimulatorState } from "@/lib/pitchSimulationEngine";
import { publicUrl } from "@/lib/publicUrl";

interface TvKioskMockupProps {
  state: PitchSimulatorState;
}

export const TvKioskMockup: React.FC<TvKioskMockupProps> = ({ state }) => {
  const currentToken = state.nowServing?.token || "—";
  const upNext = state.waitingList.slice(0, 4);

  return (
    <div className="flex flex-col h-full rounded-3xl border-2 border-primary/30 bg-[#070b14] text-slate-100 shadow-2xl overflow-hidden p-6 justify-between relative">
      {/* Background Radar Glow */}
      <div className="absolute inset-0 bg-radial from-primary/10 via-transparent to-transparent pointer-events-none" />

      {/* TV Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-black">
            Q
          </div>
          <div>
            <h3 className="text-sm font-black text-white">{state.businessName}</h3>
            <p className="text-[10px] text-slate-400 font-mono">● LIVE TV BROADCAST · {state.queueName}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-[10px] font-bold border border-emerald-500/20 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            LIVE SYNC
          </span>
        </div>
      </div>

      {/* Main Giant Now Serving Display */}
      <div className="my-auto text-center py-4 relative z-10">
        <span className="font-mono text-xs font-black uppercase tracking-[0.25em] text-primary">
          NOW SERVING
        </span>

        <div className="py-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentToken}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.15, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="font-mono font-black text-6xl sm:text-7xl text-white tracking-tight drop-shadow-md"
            >
              {currentToken}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs font-bold shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span>{state.counterName}</span>
        </div>
      </div>

      {/* TV Up Next Strip */}
      <div className="space-y-3 relative z-10 pt-2 border-t border-slate-800/80">
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold font-mono">
          <span>UP NEXT IN LINE</span>
          <span>{state.waitingList.length} WAITING</span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {upNext.map((v, i) => (
            <div
              key={v.id}
              className={`p-2 rounded-xl text-center border ${
                v.isUser
                  ? "bg-primary/20 border-primary/50 text-primary"
                  : "bg-slate-900/60 border-slate-800 text-slate-300"
              }`}
            >
              <span className="text-[9px] font-mono block text-slate-400">#{i + 1}</span>
              <span className="font-mono font-black text-xs">{v.token}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
