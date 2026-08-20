import React from "react";
import { Users, Clock, ArrowRight, Zap } from "lucide-react";

interface NextInLineStripProps {
  nextTokens: number[];
  waitingCount: number;
  estimatedWaitMinutes: number | null;
}

export const NextInLineStrip: React.FC<NextInLineStripProps> = ({
  nextTokens,
  waitingCount,
  estimatedWaitMinutes,
}) => {
  if (nextTokens.length === 0) {
    return null;
  }

  const avgPerPerson =
    waitingCount > 0 && estimatedWaitMinutes
      ? Math.max(1, Math.round(estimatedWaitMinutes / waitingCount))
      : 3;

  return (
    <div className="w-full p-5 sm:p-6 rounded-3xl bg-card border border-border shadow-xl">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/80 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          <span className="font-mono text-xs font-black uppercase tracking-widest text-foreground">
            Up Next In Line
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground font-semibold">
          <span className="flex items-center gap-1.5 bg-muted/60 px-2.5 py-1 rounded-full border border-border">
            <Users className="w-3.5 h-3.5 text-primary" />
            <span className="text-foreground font-bold">{waitingCount}</span> waiting
          </span>
          {estimatedWaitMinutes !== null && (
            <span className="flex items-center gap-1.5 bg-muted/60 px-2.5 py-1 rounded-full border border-border font-mono">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>Est. ~{estimatedWaitMinutes}m</span>
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {nextTokens.slice(0, 4).map((token, index) => {
          const stepEta = (index + 1) * avgPerPerson;
          const isNext = index === 0;

          return (
            <div
              key={token}
              className={`p-3.5 sm:p-4 rounded-2xl flex flex-col items-center justify-center text-center shadow-xs transition-transform ${
                isNext
                  ? "bg-primary/10 border-2 border-primary/40 ring-2 ring-primary/20 scale-[1.02]"
                  : "bg-muted/40 border border-border/70"
              }`}
            >
              <div className="flex items-center gap-1">
                <span
                  className={`text-[10px] font-mono font-black uppercase tracking-wider ${
                    isNext ? "text-primary font-bold" : "text-muted-foreground"
                  }`}
                >
                  {isNext ? "★ PREPARE NEXT" : `POS #${index + 1}`}
                </span>
              </div>
              <span className="font-mono font-black text-2xl sm:text-3xl text-foreground mt-1 tracking-tight">
                #{token}
              </span>
              <span className="text-[10px] font-mono text-muted-foreground mt-0.5">
                ~{stepEta} min wait
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
