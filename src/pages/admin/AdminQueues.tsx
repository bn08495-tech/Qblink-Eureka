import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { toast } from "sonner";
import { Pause, Play, RotateCcw, X as XIcon, RefreshCw, Activity, Clock, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface LiveQueue {
  id: string;
  queue: string;
  business: string;
  status: string;
  current: number;
  waiting: number;
  avgWait: number;
  updated: string;
}

interface EventRow {
  time: string;
  type: string;
  text: string;
  ts: number;
}

const STATUS_CLS: Record<string, string> = {
  active: "bg-success-soft text-success",
  paused: "bg-warning-soft text-warning",
  closed: "bg-muted text-muted-foreground",
};

const AdminQueues = () => {
  const [queues, setQueues] = useState<LiveQueue[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchQueues();
    const channel = supabase.channel("admin-queues")
      .on("postgres_changes", { event: "*", schema: "public", table: "queues" }, () => fetchQueues(true))
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "queue_live_signals" }, () => fetchQueues(true))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchQueues = async (isBackground = false) => {
    if (isBackground) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const [{ data: qs, error: qErr }, { data: bizs, error: bErr }, { data: visitors, error: vErr }, { data: recent, error: rErr }] = await Promise.all([
        supabase.from("queues").select("id, name, status, current_token, business_id, estimated_service_time, updated_at"),
        supabase.from("businesses").select("id, name"),
        supabase.from("queue_visitors").select("queue_id, status").eq("status", "waiting"),
        supabase.from("queue_visitors").select("queue_id, status, joined_at, called_at, served_at, token_number").order("joined_at", { ascending: false }).limit(40),
      ]);

      if (qErr) throw qErr;
      if (bErr) throw bErr;
      if (vErr) throw vErr;
      if (rErr) throw rErr;

      const bizMap = new Map((bizs || []).map(b => [b.id, b.name]));
      const qNameMap = new Map((qs || []).map(q => [q.id, q.name]));
      const qBizMap = new Map((qs || []).map(q => [q.id, bizMap.get(q.business_id) || "—"]));

      const real: LiveQueue[] = (qs || []).map(q => ({
        id: q.id,
        queue: q.name,
        business: bizMap.get(q.business_id) || "—",
        status: q.status,
        current: q.current_token || 0,
        waiting: (visitors || []).filter(v => v.queue_id === q.id).length,
        avgWait: q.estimated_service_time || 5,
        updated: formatDistanceToNow(new Date(q.updated_at), { addSuffix: true }),
      }));
      setQueues(real);

      // Build live event log from recent visitor activity
      const ev: EventRow[] = [];
      (recent || []).forEach(v => {
        const biz = qBizMap.get(v.queue_id);
        const qn = qNameMap.get(v.queue_id);
        const label = `${biz} · ${qn}`;
        if (v.served_at) ev.push({ ts: new Date(v.served_at).getTime(), time: new Date(v.served_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), type: "served", text: `${label} served token #${v.token_number}` });
        else if (v.called_at) ev.push({ ts: new Date(v.called_at).getTime(), time: new Date(v.called_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), type: "called", text: `${label} called token #${v.token_number}` });
        else ev.push({ ts: new Date(v.joined_at).getTime(), time: new Date(v.joined_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), type: "joined", text: `New customer joined ${label} (#${v.token_number})` });
      });
      ev.sort((a, b) => b.ts - a.ts);
      setEvents(ev.slice(0, 20));
    } catch (err: any) {
      console.error("Error fetching queues:", err);
      setError(err?.message || "Failed to load live queues");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const action = async (id: string, label: string, status?: string) => {
    if (status) {
      const { error } = await supabase.from("queues").update({ status }).eq("id", id);
      if (error) { toast.error(error.message); return; }
    } else {
      const { error } = await (supabase as any).rpc("reset_queue_for_new_day", { p_queue_id: id });
      if (error) { toast.error(error.message); return; }
    }
    toast.success(label);
    fetchQueues(true);
  };

  return (
    <AdminLayout>
      <div className="flex items-start justify-between flex-wrap gap-3 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Queues & Live Activity</h1>
          <p className="text-sm text-muted-foreground mt-1">Real-time view of every queue on the platform</p>
        </div>
        <button
          onClick={() => fetchQueues(true)}
          disabled={loading || refreshing}
          className="bg-card border border-border text-foreground px-4 py-2 rounded-xl text-sm font-medium hover:bg-muted transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <Mini icon={<Activity className="w-4 h-4 text-success" />} label="Active queues" value={queues.filter(q => q.status === "active").length} loading={loading} />
        <Mini icon={<Users className="w-4 h-4 text-primary" />} label="Total waiting" value={queues.reduce((a, q) => a + q.waiting, 0)} loading={loading} />
        <Mini icon={<Clock className="w-4 h-4 text-warning" />} label="Avg wait (all)" value={`${Math.round(queues.reduce((a, q) => a + q.avgWait, 0) / Math.max(queues.length, 1))}m`} loading={loading} />
        <Mini icon={<Pause className="w-4 h-4 text-warning" />} label="Paused" value={queues.filter(q => q.status === "paused").length} loading={loading} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card rounded-2xl card-shadow overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Live Queues</h2>
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" /> Live
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Queue</th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">Business</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Current</th>
                  <th className="px-4 py-3 text-left">Waiting</th>
                  <th className="px-4 py-3 text-left hidden lg:table-cell">Updated</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-4 py-3"><div className="h-4 w-28 bg-muted rounded" /></td>
                      <td className="px-4 py-3 hidden md:table-cell"><div className="h-4 w-24 bg-muted rounded" /></td>
                      <td className="px-4 py-3"><div className="h-4 w-16 bg-muted rounded-full" /></td>
                      <td className="px-4 py-3"><div className="h-4 w-10 bg-muted rounded" /></td>
                      <td className="px-4 py-3"><div className="h-4 w-8 bg-muted rounded" /></td>
                      <td className="px-4 py-3 hidden lg:table-cell"><div className="h-4 w-16 bg-muted rounded" /></td>
                      <td className="px-4 py-3 text-right"><div className="h-6 w-24 bg-muted rounded ml-auto" /></td>
                    </tr>
                  ))
                ) : error ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <p className="text-sm font-medium text-destructive mb-2">{error}</p>
                      <button
                        onClick={() => fetchQueues()}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-semibold hover:opacity-90 transition-opacity"
                      >
                        Retry Loading
                      </button>
                    </td>
                  </tr>
                ) : queues.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-muted-foreground">No queues found in the system.</td></tr>
                ) : (
                  queues.map(q => (
                    <tr key={q.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium text-foreground">{q.queue}</td>
                      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{q.business}</td>
                      <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_CLS[q.status] || "bg-muted"}`}>{q.status}</span></td>
                      <td className="px-4 py-3"><span className="px-2 py-0.5 bg-primary/10 text-primary rounded-md text-xs font-semibold">#{q.current}</span></td>
                      <td className="px-4 py-3">{q.waiting}</td>
                      <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{q.updated}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {q.status === "active" ? (
                            <button title="Pause" aria-label="Pause" onClick={() => action(q.id, `Paused ${q.queue}`, "paused")} className="p-1.5 rounded-lg hover:bg-warning-soft text-warning"><Pause className="w-3.5 h-3.5" /></button>
                          ) : (
                            <button title="Resume" aria-label="Resume" onClick={() => action(q.id, `Resumed ${q.queue}`, "active")} className="p-1.5 rounded-lg hover:bg-success-soft text-success"><Play className="w-3.5 h-3.5" /></button>
                          )}
                          <button title="Reset" aria-label="Reset" onClick={() => action(q.id, `Reset ${q.queue}`)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"><RotateCcw className="w-3.5 h-3.5" /></button>
                          <button title="Close" aria-label="Close" onClick={() => action(q.id, `Closed ${q.queue}`, "closed")} className="p-1.5 rounded-lg hover:bg-danger-soft text-danger"><XIcon className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-card rounded-2xl card-shadow overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-semibold text-foreground">Event Log</h2>
            <p className="text-xs text-muted-foreground">Latest activity across the platform</p>
          </div>
          <div className="divide-y divide-border max-h-[420px] overflow-y-auto">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="px-5 py-3 flex items-start gap-3 animate-pulse">
                  <div className="w-12 h-3 bg-muted rounded shrink-0" />
                  <div className="flex-1 space-y-1">
                    <div className="h-3.5 w-3/4 bg-muted rounded" />
                    <div className="h-3 w-1/4 bg-muted rounded" />
                  </div>
                </div>
              ))
            ) : events.length === 0 ? (
              <div className="px-5 py-8 text-center text-xs text-muted-foreground">No recent events recorded.</div>
            ) : (
              events.map((e, i) => (
                <div key={i} className="px-5 py-3 flex items-start gap-3">
                  <span className="text-xs text-muted-foreground tabular-nums shrink-0 w-12">{e.time}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{e.text}</p>
                    <p className="text-xs text-muted-foreground capitalize mt-0.5">{e.type}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

const Mini = ({ icon, label, value, loading }: { icon: React.ReactNode; label: string; value: any; loading?: boolean }) => (
  <div className="bg-card rounded-2xl p-4 card-shadow">
    <div className="flex items-center gap-2 mb-2">{icon}<span className="text-xs text-muted-foreground">{label}</span></div>
    {loading ? (
      <div className="h-8 w-16 bg-muted animate-pulse rounded my-0.5" />
    ) : (
      <p className="text-2xl font-bold text-foreground">{value}</p>
    )}
  </div>
);

export default AdminQueues;
