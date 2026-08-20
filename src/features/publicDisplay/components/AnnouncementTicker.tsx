import React, { useState, useEffect } from "react";
import { Megaphone, Wifi, Clock, Smartphone, Sparkles, ShieldCheck } from "lucide-react";

interface AnnouncementTickerProps {
  businessName?: string;
  queueName?: string;
  waitingCount?: number;
  estimatedWaitMinutes?: number | null;
}

const DEFAULT_ANNOUNCEMENTS = [
  {
    icon: Sparkles,
    text: "Please keep your digital boarding pass or token ticket ready when called.",
    tag: "SERVICE NOTICE",
  },
  {
    icon: Smartphone,
    text: "Scan the TV QR code with your phone camera to wait comfortably from anywhere in the venue.",
    tag: "MOBILE PASS",
  },
  {
    icon: Wifi,
    text: "High-Speed Guest Wi-Fi available throughout the lobby & waiting area.",
    tag: "AMENITY",
  },
  {
    icon: ShieldCheck,
    text: "Zero paper receipts needed. Live SMS & browser alerts notify you 2 positions before your turn.",
    tag: "ZERO CONTACT",
  },
];

export const AnnouncementTicker: React.FC<AnnouncementTickerProps> = ({
  waitingCount = 0,
  estimatedWaitMinutes = null,
}) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % DEFAULT_ANNOUNCEMENTS.length);
    }, 6500);
    return () => clearInterval(timer);
  }, []);

  const current = DEFAULT_ANNOUNCEMENTS[index];
  const IconComponent = current.icon;

  return (
    <div className="w-full bg-card/90 backdrop-blur border border-border/80 rounded-2xl px-4 py-2.5 shadow-md flex items-center justify-between gap-3 text-xs overflow-hidden">
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary font-mono font-bold text-[10px] tracking-wider shrink-0 uppercase">
          <Megaphone className="w-3 h-3" />
          <span>{current.tag}</span>
        </span>
        <div className="flex items-center gap-2 truncate">
          <IconComponent className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <span className="text-foreground font-medium truncate animate-in fade-in slide-in-from-bottom-1 duration-300 key={index}">
            {current.text}
          </span>
        </div>
      </div>

      <div className="hidden sm:flex items-center gap-3 shrink-0 text-muted-foreground font-mono text-[11px] border-l border-border/60 pl-3">
        <span>● {waitingCount} in line</span>
        {estimatedWaitMinutes !== null && <span>· ~{estimatedWaitMinutes}m pace</span>}
      </div>
    </div>
  );
};
