import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { publicUrl } from "@/lib/publicUrl";
import { Smartphone, Sparkles, ShieldCheck, ArrowRight, QrCode, Armchair, BellRing } from "lucide-react";

interface JoinQrKioskCardProps {
  queueId: string;
  queueName: string;
}

export const JoinQrKioskCard: React.FC<JoinQrKioskCardProps> = ({ queueId, queueName }) => {
  const joinUrl = publicUrl(`/join/${queueId}`);

  return (
    <div className="w-full p-6 sm:p-7 rounded-3xl bg-card border border-border shadow-xl flex flex-col md:flex-row items-center gap-6 justify-between relative overflow-hidden">
      {/* High-Contrast QR Code Area */}
      <div className="flex items-center gap-5 sm:gap-6 w-full md:w-auto">
        <div className="p-3 bg-white rounded-2xl shadow-md shrink-0 border border-slate-200 ring-2 ring-primary/20">
          <QRCodeSVG
            value={joinUrl}
            size={120}
            level="H"
            includeMargin={false}
            className="w-24 h-24 sm:w-28 sm:h-28"
          />
        </div>

        <div className="space-y-1 text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] sm:text-xs font-black uppercase tracking-wider">
            <Smartphone className="w-3.5 h-3.5" />
            <span>Join from your Phone</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
            Scan to Join the Line
          </h3>

          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xs sm:max-w-sm">
            Instant digital ticket. No app download needed — track your live turn from anywhere.
          </p>
        </div>
      </div>

      {/* 3-Step Simple Visual Journey for Lobby Guests */}
      <div className="hidden lg:flex items-center gap-3 bg-muted/40 px-5 py-3 rounded-2xl border border-border/80 text-xs">
        <div className="flex items-center gap-2 text-foreground font-semibold">
          <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-mono font-bold text-[11px]">1</div>
          <span>Scan QR</span>
        </div>

        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/60" />

        <div className="flex items-center gap-2 text-foreground font-semibold">
          <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-mono font-bold text-[11px]">2</div>
          <span>Take a Seat</span>
        </div>

        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/60" />

        <div className="flex items-center gap-2 text-foreground font-semibold">
          <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-mono font-bold text-[11px]">3</div>
          <span>Turn Alert Chime</span>
        </div>
      </div>
    </div>
  );
};
