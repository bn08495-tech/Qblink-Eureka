import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Plus,
  Users,
  Clock,
  CheckCircle,
  SkipForward,
  UserPlus,
  Phone,
  Trash2,
  QrCode,
  Monitor,
  BarChart3,
  Pause,
  Play,
  RefreshCw,
  Sunrise,
  Info,
  Printer,
  Layers,
  CalendarCheck,
  Hourglass,
  Volume2,
  VolumeX,
  Keyboard,
  Search,
  Filter,
  ExternalLink,
  ChevronDown,
  Sparkles,
  Smartphone,
} from "lucide-react";
import { publicUrl } from "@/lib/publicUrl";
import { QRCodeSVG } from "qrcode.react";
import BusinessLayout from "@/components/business/BusinessLayout";
import AIInsights from "@/components/AIInsights";
import BusinessBenchmark from "@/components/business/BusinessBenchmark";
import QueueForecast from "@/components/QueueForecast";
import HealthScoreCard from "@/components/health/HealthScoreCard";
import QueueHealthAlerts from "@/components/QueueHealthAlerts";
import QueueIntegrityPanel from "@/components/business/QueueIntegrityPanel";
import { useQueueSync } from "@/hooks/useQueueSync";
import RestaurantTableConfig, { TableSize, COMMON_PARTY_SIZES, PartySizeMode } from "@/components/business/RestaurantTableConfig";
import EmptyState from "@/components/EmptyState";
import InfoHint from "@/components/InfoHint";
import { hapticCopy, hapticRefresh, hapticSuccess } from "@/lib/haptics";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { PrintReadyQRKit } from "@/components/business/PrintReadyQRKit";
import { DailyPerformanceSummary } from "@/components/business/DailyPerformanceSummary";
import { ServiceManagementModal } from "@/components/business/ServiceManagementModal";
import { OfflineStatusBar } from "@/components/business/OfflineStatusBar";
import { ExecutiveTelemetryBar } from "@/components/business/ExecutiveTelemetryBar";
import { staffAudio } from "@/lib/staffAudio";
import { KeyboardShortcutsModal } from "@/components/business/KeyboardShortcutsModal";

interface Queue {
  id: string;
  name: string;
  status: string;
  estimated_service_time: number | null;
  note: string | null;
  current_token: number | null;
  next_token: number | null;
}

interface Visitor {
  id: string;
  token_number: number;
  visitor_name: string | null;
  phone: string | null;
  status: string;
  joined_at: string;
  called_at: string | null;
  served_at: string | null;
  party_size?: number | null;
  assigned_table_size?: number | null;
}

const Dashboard = () => {
  return (
    <BusinessLayout>
      {(business) => <QueueManager businessId={business.id} businessName={business.name} />}
    </BusinessLayout>
  );
};

const QueueManager = ({ businessId, businessName }: { businessId: string; businessName: string }) => {
  const [selectedQueueId, setSelectedQueueId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showAddWalkin, setShowAddWalkin] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showLaunchpad, setShowLaunchpad] = useState(false);
  const [audioMuted, setAudioMuted] = useState(() => !staffAudio.isAudioEnabled());
  const [searchQuery, setSearchQuery] = useState("");
  const [triageFilter, setTriageFilter] = useState<"all" | "high_wait" | "groups">("all");
  const [newQueue, setNewQueue] = useState<{
    name: string;
    estimated_service_time: number;
    note: string;
    queue_type: "standard" | "appointment" | "restaurant";
    config_mode: "single" | "counters" | "seating" | "departments";
    table_config: TableSize[];
    seating_policy: "strict" | "flexible";
    party_sizes: number[];
    party_size_mode: PartySizeMode;
  }>({
    name: "",
    estimated_service_time: 5,
    note: "",
    queue_type: "standard",
    config_mode: "single",
    table_config: [
      { seats: 2, count: 1 },
      { seats: 4, count: 1 },
      { seats: 6, count: 1 },
      { seats: 8, count: 1 },
    ],
    seating_policy: "strict",
    party_sizes: [...COMMON_PARTY_SIZES],
    party_size_mode: "common",
  });
  const [walkinName, setWalkinName] = useState("");
  const [walkinPhone, setWalkinPhone] = useState("");
  const [walkinParty, setWalkinParty] = useState<number>(2);
  const [showReset, setShowReset] = useState(false);
  const [showResetInfo, setShowResetInfo] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [showPrintKit, setShowPrintKit] = useState(false);
  const [showDailySummary, setShowDailySummary] = useState(false);
  const [showServiceConfig, setShowServiceConfig] = useState(false);
  const {
    queues,
    getDetailVisitors,
    getQueueStats,
    refresh,
    refreshing,
    lastRefreshAt,
    realtimeStatus,
    lastRealtimeEventAt,
    consistencyWarnings,
  } = useQueueSync({ businessId, includeDetails: true, source: "business-dashboard" });

  const selectedQueue = queues.find((q) => q.id === selectedQueueId) || queues[0] || null;
  const visitors: Visitor[] = getDetailVisitors(selectedQueue?.id);
  const syncedStats = getQueueStats(selectedQueue?.id);
  const showDebug = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("qdebug") === "1";

  const handleRefresh = async () => {
    if (refreshing) return;
    hapticRefresh();
    await refresh();
  };

  const createQueue = async () => {
    if (!newQueue.name.trim()) return;
    const isRestaurant = newQueue.queue_type === "restaurant";
    if (isRestaurant && newQueue.table_config.length === 0) {
      toast.error("Add at least one table size");
      return;
    }
    const insertPayload: any = {
      business_id: businessId,
      name: newQueue.name,
      estimated_service_time: newQueue.estimated_service_time,
      note: newQueue.note || null,
      queue_type: newQueue.queue_type,
    };
    if (isRestaurant) {
      insertPayload.table_config = newQueue.table_config;
      insertPayload.seating_policy = newQueue.seating_policy;
      insertPayload.party_sizes = newQueue.party_sizes.length
        ? newQueue.party_sizes
        : [...COMMON_PARTY_SIZES];
      insertPayload.party_size_mode = newQueue.party_size_mode;
    }
    const { data, error } = await supabase.from("queues").insert(insertPayload).select().single();
    if (error) { toast.error("Failed to create queue"); return; }
    toast.success("Queue created!");
    setShowCreate(false);
    setNewQueue({
      name: "",
      estimated_service_time: 5,
      note: "",
      queue_type: "standard",
      config_mode: "single",
      table_config: [
        { seats: 2, count: 1 },
        { seats: 4, count: 1 },
        { seats: 6, count: 1 },
        { seats: 8, count: 1 },
      ],
      seating_policy: "strict",
      party_sizes: [...COMMON_PARTY_SIZES],
      party_size_mode: "common",
    });
    if (data) {
      setSelectedQueueId(data.id);
      await refresh();
    }
  };

  const [callingNext, setCallingNext] = useState(false);

  const addWalkin = async () => {
    if (!selectedQueue) return;
    const isRestaurant = (selectedQueue as any).queue_type === "restaurant";
    const rpcArgs: any = {
      p_queue_id: selectedQueue.id,
      p_visitor_name: walkinName || "Walk-in",
      p_phone: walkinPhone || null,
    };
    if (isRestaurant) rpcArgs.p_party_size = walkinParty;
    const { data, error } = await supabase.rpc("join_queue", rpcArgs);
    if (error) { toast.error(error.message || "Failed to add walk-in"); return; }
    const row = Array.isArray(data) ? data[0] : data;
    hapticSuccess();
    staffAudio.playNewVisitorChime();
    toast.success(`Token #${row?.token_number ?? ""} added`);
    setShowAddWalkin(false);
    setWalkinName("");
    setWalkinPhone("");
    setWalkinParty(2);
    refresh();
  };

  const toggleAudio = () => {
    const next = !audioMuted;
    setAudioMuted(next);
    staffAudio.setAudioEnabled(!next);
    if (!next) {
      staffAudio.playCallNextChime();
      toast.success("Staff audio chimes enabled");
    } else {
      toast.info("Staff audio muted");
    }
  };

  const callNext = async () => {
    if (!selectedQueue || callingNext) return;
    setCallingNext(true);
    try {
      const { data, error } = await supabase.rpc("call_next", { p_queue_id: selectedQueue.id });
      if (error) { toast.error(error.message || "Call Next failed"); return; }
      const row = Array.isArray(data) ? data[0] : null;
      if (!row) {
        toast.info("No one waiting in line");
      } else {
        hapticSuccess();
        staffAudio.playCallNextChime();
        toast.success(`Calling Token #${row.token_number}`);
      }
      refresh();
    } finally {
      setCallingNext(false);
    }
  };

  const serveTable = async (seats: number) => {
    if (!selectedQueue || callingNext) return;
    setCallingNext(true);
    try {
      const { data, error } = await supabase.rpc("serve_restaurant_next" as any, {
        p_queue_id: selectedQueue.id,
        p_table_size: seats,
      });
      if (error) { toast.error(error.message || "Could not serve next"); return; }
      const row: any = Array.isArray(data) ? data[0] : data;
      if (!row) { toast.info(`No one waiting for a ${seats}-seat table`); }
      else {
        hapticSuccess();
        staffAudio.playCallNextChime();
        toast.success(`Calling #${row.token_number} (party of ${row.party_size}) for ${row.assigned_table_size}-seat table`);
      }
      refresh();
    } finally {
      setCallingNext(false);
    }
  };

  const markServed = async (id: string, t: number) => {
    await supabase.from("queue_visitors").update({ status: "served", served_at: new Date().toISOString() }).eq("id", id);
    hapticSuccess();
    staffAudio.playServedChime();
    toast.success(`#${t} served`);
    refresh();
  };

  const skipVisitor = async (id: string, t: number) => {
    const { error } = await (supabase as any).rpc("skip_visitor", { p_visitor_id: id });
    if (error) return toast.error(error.message || "Skip failed");
    toast.info(`#${t} skipped`);
    refresh();
  };

  const markNoShow = async (id: string, t: number) => {
    const { error } = await (supabase as any).rpc("mark_no_show", { p_visitor_id: id });
    if (error) return toast.error(error.message || "Could not mark no-show");
    toast.info(`#${t} marked no-show`);
    refresh();
  };

  const removeVisitor = async (id: string, t: number) => {
    await supabase.from("queue_visitors").update({ status: "removed" }).eq("id", id);
    toast.info(`#${t} removed`);
    refresh();
  };

  // Staff chime on new remote joiners
  const prevWaitingCountRef = useRef<number>(0);
  useEffect(() => {
    const currentWaiting = visitors.filter((v) => v.status === "waiting").length;
    if (prevWaitingCountRef.current > 0 && currentWaiting > prevWaitingCountRef.current) {
      staffAudio.playNewVisitorChime();
    }
    prevWaitingCountRef.current = currentWaiting;
  }, [visitors]);

  // Global front-desk hotkeys listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const active = document.activeElement as HTMLElement | null;
      const tag = active?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || active?.isContentEditable) {
        if (e.key === "Escape") active?.blur();
        return;
      }

      if (e.key === "?" || (e.key === "/" && e.shiftKey)) {
        e.preventDefault();
        setShowShortcuts((prev) => !prev);
        return;
      }

      if (e.key === "Escape") {
        setShowAddWalkin(false);
        setShowQR(false);
        setShowCreate(false);
        setShowReset(false);
        setShowPrintKit(false);
        setShowDailySummary(false);
        setShowServiceConfig(false);
        setShowShortcuts(false);
        setShowLaunchpad(false);
        return;
      }

      if (e.code === "Space" || e.key === "n" || e.key === "N") {
        e.preventDefault();
        callNext();
        return;
      }

      if (e.key === "s" || e.key === "S" || e.key === "Enter") {
        const activeCalled = visitors.filter((v) => v.status === "called");
        if (activeCalled.length > 0) {
          e.preventDefault();
          markServed(activeCalled[0].id, activeCalled[0].token_number);
          return;
        }
      }

      if (e.key === "k" || e.key === "K" || e.key === "x" || e.key === "X") {
        const activeCalled = visitors.filter((v) => v.status === "called");
        if (activeCalled.length > 0) {
          e.preventDefault();
          skipVisitor(activeCalled[0].id, activeCalled[0].token_number);
          return;
        }
      }

      if (e.key === "a" || e.key === "A" || e.key === "+") {
        e.preventDefault();
        setShowAddWalkin(true);
        return;
      }

      if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        handleRefresh();
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [visitors, callingNext, selectedQueue]);

  const toggleQueueStatus = async () => {
    if (!selectedQueue) return;
    const newStatus = selectedQueue.status === "active" ? "paused" : "active";
    await supabase.from("queues").update({ status: newStatus }).eq("id", selectedQueue.id);
    toast.success(`Queue ${newStatus}`);
    refresh();
  };

  const stopQueue = async () => {
    if (!selectedQueue) return;
    await supabase.from("queues").update({ status: "closed" }).eq("id", selectedQueue.id);
    toast.info("Queue stopped");
    refresh();
  };

  const startNewDay = async () => {
    if (!selectedQueue || resetting) return;
    setResetting(true);
    try {
      const { data, error } = await supabase.rpc("reset_queue_for_new_day", { p_queue_id: selectedQueue.id });
      if (error) { toast.error(error.message || "Could not start a new day"); return; }
      const s: any = Array.isArray(data) ? data[0] : data;
      hapticSuccess();
      toast.success(`New day started — ${s?.total_joined ?? 0} visitors archived`);
      setShowReset(false);
      await refresh();
    } finally {
      setResetting(false);
    }
  };

  const waiting = visitors.filter(v => v.status === "waiting");
  const called = visitors.filter(v => v.status === "called");
  const served = visitors.filter(v => v.status === "served");
  const joinUrl = selectedQueue
    ? ((selectedQueue as any).parent_queue_id && (selectedQueue as any).table_size
        ? publicUrl(`/join/${(selectedQueue as any).parent_queue_id}?size=${(selectedQueue as any).table_size}`)
        : publicUrl(`/join/${selectedQueue.id}`))
    : "";
  const displayUrl = selectedQueue ? publicUrl(`/display/${selectedQueue.id}`) : "";

  const filteredWaiting = waiting.filter((v) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchToken = String(v.token_number).includes(q);
      const matchName = (v.visitor_name || "").toLowerCase().includes(q);
      const matchPhone = (v.phone || "").toLowerCase().includes(q);
      if (!matchToken && !matchName && !matchPhone) return false;
    }
    if (triageFilter === "high_wait") {
      const pos = waiting.indexOf(v);
      const eta = (pos + 1) * (selectedQueue?.estimated_service_time || 5);
      if (eta < 15) return false;
    }
    if (triageFilter === "groups") {
      if (!((v as any).party_size && (v as any).party_size > 2)) return false;
    }
    return true;
  });

  return (
    <div>
      <div className="mb-4">
        <OfflineStatusBar onSyncPending={handleRefresh} />
      </div>
      {queues.length > 0 ? (
        <>
          <div className="flex items-start justify-between flex-wrap gap-3 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Queue Manager</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your live customer queue with lightning speed</p>
        </div>
        {selectedQueue && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${
              selectedQueue.status === "active" ? "bg-success-soft text-success" :
              selectedQueue.status === "paused" ? "bg-warning-soft text-warning" : "bg-muted text-muted-foreground"
            }`}>
              ● Queue {selectedQueue.status}
            </span>

            {/* Audio Feedback Toggle */}
            <button
              type="button"
              onClick={toggleAudio}
              title={audioMuted ? "Unmute staff audio chimes" : "Mute staff audio chimes"}
              className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium border transition-colors ${
                !audioMuted
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "bg-card border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {!audioMuted ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>{!audioMuted ? "Sound On" : "Muted"}</span>
            </button>

            {/* Keyboard Shortcuts Trigger */}
            <button
              type="button"
              onClick={() => setShowShortcuts(true)}
              title="Keyboard Shortcuts (?)"
              aria-label="Keyboard Shortcuts"
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium bg-card border border-border text-foreground hover:bg-muted transition-colors"
            >
              <Keyboard className="w-3.5 h-3.5 text-primary" />
              <span>Hotkeys</span>
              <kbd className="hidden sm:inline-block px-1 py-0.2 rounded bg-muted font-mono text-[10px] text-muted-foreground">?</kbd>
            </button>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              title="Refresh (R)"
              aria-label="Refresh"
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium bg-card border border-border text-foreground hover:bg-muted transition-colors disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
              <kbd className="hidden sm:inline-block px-1 py-0.2 rounded bg-muted font-mono text-[10px] text-muted-foreground">R</kbd>
            </button>

            {/* Front-Desk Quick Launchpad Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowLaunchpad((v) => !v)}
                className="inline-flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-full font-semibold gradient-bg text-primary-foreground hover:opacity-90 shadow-sm transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Launch Tools</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-80" />
              </button>

              {showLaunchpad && (
                <div
                  onBlur={() => setTimeout(() => setShowLaunchpad(false), 200)}
                  className="absolute right-0 top-10 z-40 w-64 rounded-2xl bg-card border border-border p-2 shadow-2xl space-y-1 animate-in fade-in zoom-in-95 duration-150"
                >
                  <a
                    href={displayUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setShowLaunchpad(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                  >
                    <Monitor className="w-4 h-4 text-primary" />
                    <div className="min-w-0 flex-1">
                      <p>Open TV Waiting Kiosk</p>
                      <p className="text-[10px] text-muted-foreground font-normal">Full-screen display for lobby TV</p>
                    </div>
                  </a>

                  <a
                    href={joinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setShowLaunchpad(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                  >
                    <Smartphone className="w-4 h-4 text-emerald-500" />
                    <div className="min-w-0 flex-1">
                      <p>Simulate Customer Pass</p>
                      <p className="text-[10px] text-muted-foreground font-normal">Preview visitor mobile view</p>
                    </div>
                  </a>

                  <button
                    type="button"
                    onClick={() => { setShowPrintKit(true); setShowLaunchpad(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-foreground hover:bg-muted text-left transition-colors"
                  >
                    <Printer className="w-4 h-4 text-amber-500" />
                    <div className="min-w-0 flex-1">
                      <p>Print Counter QR Stand</p>
                      <p className="text-[10px] text-muted-foreground font-normal">High-res desk acrylic template</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setShowDailySummary(true); setShowLaunchpad(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-foreground hover:bg-muted text-left transition-colors"
                  >
                    <BarChart3 className="w-4 h-4 text-blue-500" />
                    <div className="min-w-0 flex-1">
                      <p>Daily Executive Summary</p>
                      <p className="text-[10px] text-muted-foreground font-normal">End of day performance metric</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setShowServiceConfig(true); setShowLaunchpad(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-foreground hover:bg-muted text-left transition-colors"
                  >
                    <Layers className="w-4 h-4 text-purple-500" />
                    <div className="min-w-0 flex-1">
                      <p>Counter & Services</p>
                      <p className="text-[10px] text-muted-foreground font-normal">Configure service categories</p>
                    </div>
                  </button>
                </div>
              )}
            </div>

            <QueueHealthAlerts businessId={businessId} />
          </div>
        )}
      </div>

          {/* Waiting list */}
          <div className="bg-card rounded-2xl card-shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <h2 className="font-bold text-foreground text-base">Waiting List</h2>
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold text-xs">
                  {waiting.length} in line
                </span>
              </div>
              <div className="flex items-center gap-2">
                {/* Instant Search input */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search token, name, phone..."
                    className="pl-8 pr-3 py-1.5 rounded-xl text-xs bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 w-44 sm:w-56"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground hover:text-foreground"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <button
                  onClick={() => setShowAddWalkin(true)}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl gradient-bg text-primary-foreground font-semibold hover:opacity-90 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Walk-In</span>
                  <kbd className="hidden sm:inline-block px-1 py-0.2 rounded bg-black/20 font-mono text-[9px] text-white">A</kbd>
                </button>
              </div>
            </div>

            {/* Triage filter pills */}
            <div className="px-6 py-2 bg-muted/30 border-b border-border flex items-center gap-1.5 overflow-x-auto text-xs">
              <span className="text-muted-foreground text-[11px] font-semibold mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" /> Filter:
              </span>
              <button
                type="button"
                onClick={() => setTriageFilter("all")}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  triageFilter === "all" ? "bg-card text-foreground shadow-xs font-bold" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All ({waiting.length})
              </button>
              <button
                type="button"
                onClick={() => setTriageFilter("high_wait")}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  triageFilter === "high_wait" ? "bg-card text-warning shadow-xs font-bold" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Wait &gt; 15m
              </button>
              <button
                type="button"
                onClick={() => setTriageFilter("groups")}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  triageFilter === "groups" ? "bg-card text-primary shadow-xs font-bold" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Groups (3+)
              </button>
            </div>

            {filteredWaiting.length === 0 ? (
              <div className="px-6 py-6">
                <EmptyState
                  compact
                  icon={Users}
                  title={searchQuery ? "No matching visitors found" : "No one waiting yet"}
                  description={
                    searchQuery
                      ? "No visitors matched your search query. Try clearing the search box."
                      : "Your first customer will unlock live operational insights — wait times, service pace and queue health all populate automatically."
                  }
                  tip="Share or display your queue's QR code at the entrance so walk-ins can join in one tap."
                />
              </div>
            ) : (selectedQueue as any).queue_type === "restaurant" ? (
              <div className="divide-y divide-border">
                {(() => {
                  const groups = new Map<number, Visitor[]>();
                  filteredWaiting.forEach((v) => {
                    const size = (v as any).assigned_table_size ?? 0;
                    const arr = groups.get(size) || [];
                    arr.push(v);
                    groups.set(size, arr);
                  });
                  const sortedSizes = Array.from(groups.keys()).sort((a, b) => a - b);
                  return sortedSizes.map((size) => (
                    <div key={size}>
                      <div className="px-6 py-2 bg-muted/40 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        {size > 0 ? `${size} Seats` : "Unassigned"} · {groups.get(size)!.length} waiting
                      </div>
                      {groups.get(size)!.map((v) => {
                        const pos = waiting.indexOf(v);
                        const eta = (pos + 1) * (selectedQueue.estimated_service_time || 5);
                        return (
                          <div key={v.id} className="px-6 py-4 flex items-center justify-between border-t border-border hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-4">
                              <span className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">#{v.token_number}</span>
                              <div>
                                <p className="text-sm font-medium text-foreground">
                                  {v.visitor_name || "Guest"}
                                  {(v as any).party_size ? <span className="ml-2 text-xs text-muted-foreground">party of {(v as any).party_size}</span> : null}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {v.phone ? `${v.phone} · ` : ""}Joined {new Date(v.joined_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground hidden sm:block">~{eta}m</span>
                              <button onClick={() => skipVisitor(v.id, v.token_number)} title="Skip (K)" className="px-2.5 py-1.5 rounded-lg bg-warning-soft text-warning text-xs font-medium hover:bg-warning-soft transition-colors">
                                <SkipForward className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => removeVisitor(v.id, v.token_number)} title="Remove" className="px-2.5 py-1.5 rounded-lg bg-danger-soft text-danger text-xs font-medium hover:bg-danger-soft transition-colors">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ));
                })()}
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredWaiting.map(v => {
                  const pos = waiting.indexOf(v);
                  const eta = (pos + 1) * (selectedQueue.estimated_service_time || 5);
                  return (
                    <div key={v.id} className="px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <span className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">#{v.token_number}</span>
                        <div>
                          <p className="text-sm font-medium text-foreground">{v.visitor_name || "Guest"}</p>
                          <p className="text-xs text-muted-foreground">
                            {v.phone ? `${v.phone} · ` : ""}Joined {new Date(v.joined_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground hidden sm:block">~{eta}m</span>
                        <button onClick={() => skipVisitor(v.id, v.token_number)} title="Skip" className="px-2.5 py-1.5 rounded-lg bg-warning-soft text-warning text-xs font-medium hover:bg-warning-soft transition-colors">
                          <SkipForward className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => removeVisitor(v.id, v.token_number)} title="Remove" className="px-2.5 py-1.5 rounded-lg bg-danger-soft text-danger text-xs font-medium hover:bg-danger-soft transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          {selectedQueue && <QueueIntegrityPanel queueId={selectedQueue.id} />}
        </>
      ) : (
        <div className="py-8 px-6 bg-card rounded-3xl border border-border/80 card-shadow max-w-4xl mx-auto my-6 space-y-6">
          <div className="text-center max-w-xl mx-auto">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3">
              <Sparkles className="w-7 h-7 animate-pulse" />
            </div>
            <h2 className="text-2xl font-black text-foreground">Welcome to Qblink! Let's Get Live in 60s</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Your digital customer flow system is ready. Follow this simple 4-step checklist to start serving walk-in guests:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Step 1 */}
            <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary text-primary-foreground font-bold flex items-center justify-center shrink-0 text-sm">
                1
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-foreground">Create Your First Counter</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Name your counter (e.g. "Dr. Mehta Consultation", "Host Stand", or "Counter 1").
                </p>
                <button
                  onClick={() => setShowCreate(true)}
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:brightness-110 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" /> Create Queue Now
                </button>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-200 font-bold flex items-center justify-center shrink-0 text-sm">
                2
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-foreground">Print Your Counter QR Poster</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Download a print-ready PDF poster to stick on your front door or counter.
                </p>
                <span className="text-[11px] text-muted-foreground italic mt-2 block">
                  ✦ Available right after creating your first queue
                </span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-200 font-bold flex items-center justify-center shrink-0 text-sm">
                3
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-foreground">Launch TV Kiosk on Monitor</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Open full-screen TV display on any lobby TV or iPad with audio chimes.
                </p>
                <Link
                  to="/pitch"
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary text-secondary-foreground text-xs font-semibold hover:bg-secondary/90 transition-all"
                >
                  <Monitor className="w-3.5 h-3.5" /> Preview Kiosk Simulator
                </Link>
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-200 font-bold flex items-center justify-center shrink-0 text-sm">
                4
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-foreground">Scan with Your Phone to Test</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Experience the live boarding pass as a customer and call your token with spacebar!
                </p>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-2 block">
                  ✓ Zero app download required for anyone
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showCreate && (
        <Modal onClose={() => setShowCreate(false)} title="Create New Queue">
          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block">Queue Configuration</label>
            <p className="text-xs text-muted-foreground mb-3">Pick the setup that best matches how you serve customers.</p>
            <div role="radiogroup" aria-label="Queue configuration" className="grid grid-cols-1 gap-2">
              {([
                {
                  k: "single",
                  label: "Single Queue",
                  example: "One shared line — e.g. a barber shop or a small clinic with one counter.",
                },
                {
                  k: "counters",
                  label: "Multiple Counters",
                  example: "Several parallel counters serving the same line — e.g. a bank, post office, or DMV.",
                },
                {
                  k: "seating",
                  label: "Seating Based",
                  example: "Customers grouped by party size — e.g. restaurants and cafés seating 2 / 4 / 6 / 8+.",
                },
                {
                  k: "departments",
                  label: "Department Based",
                  example: "Different services in one place — e.g. hospital OPD, salon (haircut / spa / nails).",
                },
              ] as const).map((opt) => {
                const selected = newQueue.config_mode === opt.k;
                return (
                  <button
                    key={opt.k}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => {
                      const isSeating = opt.k === "seating";
                      setNewQueue({
                        ...newQueue,
                        config_mode: opt.k,
                        queue_type: isSeating ? "restaurant" : "standard",
                        table_config: isSeating && newQueue.table_config.length === 0
                          ? [
                              { seats: 2, count: 1 },
                              { seats: 4, count: 1 },
                              { seats: 6, count: 1 },
                              { seats: 8, count: 1 },
                            ]
                          : newQueue.table_config,
                      });
                    }}
                    className={`text-left px-4 py-3 rounded-xl border transition-colors ${
                      selected
                        ? "border-primary bg-primary/5 ring-1 ring-primary/40"
                        : "border-border bg-card hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        aria-hidden="true"
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          selected ? "border-primary" : "border-muted-foreground/40"
                        }`}
                      >
                        {selected && <span className="w-2 h-2 rounded-full bg-primary" />}
                      </span>
                      <span className={`text-sm font-semibold ${selected ? "text-primary" : "text-foreground"}`}>
                        {opt.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 ml-6">{opt.example}</p>
                  </button>
                );
              })}
            </div>
            {(newQueue.config_mode === "counters" || newQueue.config_mode === "departments") && (
              <p className="mt-2 text-xs text-muted-foreground bg-muted/40 border border-border rounded-lg px-3 py-2">
                Tip: create one queue per {newQueue.config_mode === "counters" ? "counter" : "department"} — customers see them all and pick where to join.
              </p>
            )}
          </div>
          <input type="text" placeholder="Queue name (e.g., Main Counter)" value={newQueue.name} onChange={e => setNewQueue({ ...newQueue, name: e.target.value })} className="input" />
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Est. service time (minutes)</label>
            <input type="number" min={1} max={120} value={newQueue.estimated_service_time} onChange={e => setNewQueue({ ...newQueue, estimated_service_time: parseInt(e.target.value) || 5 })} className="input" />
          </div>
          <textarea placeholder="Note (optional)" rows={2} value={newQueue.note} onChange={e => setNewQueue({ ...newQueue, note: e.target.value })} className="input resize-none" />
          {newQueue.queue_type === "restaurant" && (
            <RestaurantTableConfig
              tables={newQueue.table_config}
              onChange={(table_config) => setNewQueue({ ...newQueue, table_config })}
              policy={newQueue.seating_policy}
              onPolicyChange={(seating_policy) => setNewQueue({ ...newQueue, seating_policy })}
              partySizes={newQueue.party_sizes}
              onPartySizesChange={(party_sizes) => setNewQueue({ ...newQueue, party_sizes })}
              partySizeMode={newQueue.party_size_mode}
              onPartySizeModeChange={(party_size_mode) => setNewQueue({ ...newQueue, party_size_mode })}
            />
          )}
          <div className="flex gap-3">
            <button onClick={createQueue} className="flex-1 gradient-bg text-primary-foreground py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity">Create</button>
            <button onClick={() => setShowCreate(false)} className="px-5 py-3 rounded-xl text-sm font-medium border border-border text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
          </div>
        </Modal>
      )}

      {showQR && selectedQueue && (
        <Modal onClose={() => setShowQR(false)} title="Scan to Join Queue">
          <div className="text-center mb-4">
            <h3 className="text-lg font-bold text-foreground">{businessName}</h3>
            <p className="text-sm text-muted-foreground">{selectedQueue.name}</p>
          </div>
          <div className="bg-white p-4 rounded-xl inline-block mx-auto">
            <QRCodeSVG value={joinUrl} size={200} />
          </div>
          <p className="text-xs text-muted-foreground break-all text-center">{joinUrl}</p>
          <button onClick={() => { hapticCopy(); navigator.clipboard.writeText(joinUrl); toast.success("Link copied!"); }} className="gradient-bg text-primary-foreground py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity">
            Copy Link
          </button>
        </Modal>
      )}

      {showAddWalkin && (
        <Modal onClose={() => setShowAddWalkin(false)} title="Add Walk-in Customer">
          <input type="text" placeholder="Name (optional)" value={walkinName} onChange={e => setWalkinName(e.target.value)} className="input" />
          <input type="tel" placeholder="Phone (optional)" value={walkinPhone} onChange={e => setWalkinPhone(e.target.value)} className="input" />
          {selectedQueue && (selectedQueue as any).queue_type === "restaurant" && (
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Party size *</label>
              <div className="flex flex-wrap gap-2">
                {(((selectedQueue as any).party_sizes as number[] | null) || COMMON_PARTY_SIZES).map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setWalkinParty(n)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                      walkinParty === n
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {n === 10 ? "10+" : n}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                We'll auto-assign the smallest table that fits.
              </p>
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={addWalkin} className="flex-1 gradient-bg text-primary-foreground py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity">Add to Queue</button>
            <button onClick={() => setShowAddWalkin(false)} className="px-5 py-3 rounded-xl text-sm font-medium border border-border text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
          </div>
        </Modal>
      )}

      {showReset && selectedQueue && (
        <Modal onClose={() => !resetting && setShowReset(false)} title="Start a New Day?">
          <div className="flex items-start gap-3 -mt-1">
            <div className="w-10 h-10 rounded-xl bg-warning-soft text-warning flex items-center justify-center shrink-0">
              <Sunrise className="w-5 h-5" />
            </div>
            <div className="text-sm text-muted-foreground leading-relaxed">
              You're about to close today's queue for <span className="font-semibold text-foreground">{selectedQueue.name}</span> and begin a fresh session.
            </div>
          </div>
          <div className="bg-muted/50 rounded-xl p-3 text-xs text-muted-foreground space-y-1.5">
            <p>✓ Today's data is safely archived for analytics & reports</p>
            <p>✓ Tokens reset to #1 for the new day</p>
            <p>✓ Customers still waiting will be marked as no-show</p>
            <p>✓ History remains accessible from the History page</p>
          </div>
          <div className="flex gap-3">
            <button onClick={startNewDay} disabled={resetting} className="flex-1 gradient-bg text-primary-foreground py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60">
              {resetting ? "Starting…" : "Yes, Start New Day"}
            </button>
            <button onClick={() => setShowReset(false)} disabled={resetting} className="px-5 py-3 rounded-xl text-sm font-medium border border-border text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
          </div>
        </Modal>
      )}

      {showPrintKit && selectedQueue && (
        <PrintReadyQRKit
          queueId={selectedQueue.id}
          queueName={selectedQueue.name}
          businessName={businessName}
          onClose={() => setShowPrintKit(false)}
        />
      )}

      {showDailySummary && (
        <DailyPerformanceSummary
          businessId={businessId}
          businessName={businessName}
          visitors={visitors as any}
          onClose={() => setShowDailySummary(false)}
        />
      )}

      {showServiceConfig && selectedQueue && (
        <ServiceManagementModal
          initialServices={((selectedQueue as any)?.settings?.services as any) || []}
          onSave={async (newServices) => {
            const existingSettings = (selectedQueue as any)?.settings || {};
            const updatedSettings = { ...existingSettings, services: newServices };
            const { error } = await supabase
              .from("queues")
              .update({ settings: updatedSettings } as any)
              .eq("id", selectedQueue.id);
            if (error) throw error;
            handleRefresh();
          }}
          onClose={() => setShowServiceConfig(false)}
        />
      )}

      <KeyboardShortcutsModal
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />

      <style>{`.input{width:100%;padding:0.75rem 1rem;border-radius:0.75rem;background:hsl(var(--background));border:1px solid hsl(var(--border));color:hsl(var(--foreground));font-size:0.875rem}.input:focus{outline:none;box-shadow:0 0 0 2px hsl(var(--primary)/0.3)}`}</style>
    </div>
  );
};

const Stat = ({
  icon,
  label,
  value,
  accent,
  hint,
  tip,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  accent?: boolean;
  hint?: React.ReactNode;
  tip?: { title?: string; description: string; example?: string };
}) => (
  <div className="bg-card rounded-2xl p-5 card-shadow flex flex-col gap-2">
    <div className="flex items-center gap-1.5 text-muted-foreground/80 text-xs font-medium uppercase tracking-wide">
      <span className="opacity-70">{icon}</span>
      <span>{label}</span>
      {tip && <InfoHint {...tip} ariaLabel={`About ${label}`} />}
    </div>
    <p
      className={`text-3xl md:text-[2rem] leading-none font-extrabold tabular-nums tracking-tight ${
        accent ? "text-primary" : "text-foreground"
      }`}
    >
      {value}
    </p>
    {hint && <div className="text-xs text-muted-foreground/80">{hint}</div>}
  </div>
);

const Modal = ({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) => (
  <div
    className="fixed inset-0 z-50 bg-black/40 flex items-start sm:items-center justify-center p-4 overflow-y-auto overscroll-contain"
    style={{ WebkitOverflowScrolling: "touch" }}
    onClick={onClose}
  >
    <div
      className="bg-card rounded-2xl p-6 w-full max-w-md card-shadow flex flex-col gap-4 my-auto max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain"
      style={{ WebkitOverflowScrolling: "touch" }}
      onClick={e => e.stopPropagation()}
    >
      <h3 className="text-lg font-bold text-foreground">{title}</h3>
      {children}
    </div>
  </div>
);

export default Dashboard;
