import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { toast } from "sonner";
import { Search, Download, Eye, Ban, X, RotateCcw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface CustRow {
  id: string;
  name: string;
  email: string;
  lastActive: string;
  joined: number;
  visits: number;
  status: string;
}

const STATUS_CLS: Record<string, string> = {
  active: "bg-success-soft text-success",
  inactive: "bg-muted text-muted-foreground",
  banned: "bg-danger-soft text-danger",
};

const AdminCustomers = () => {
  const [rows, setRows] = useState<CustRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("All");
  const [selected, setSelected] = useState<CustRow | null>(null);

  useEffect(() => {
    fetchData();
    const ch = supabase.channel("admin-customers")
      .on("postgres_changes", { event: "*", schema: "public", table: "customer_profiles" }, () => fetchData(true))
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "queue_live_signals" }, () => fetchData(true))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const fetchData = async (isBackground = false) => {
    if (isBackground) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const [{ data: profiles, error: pErr }, { data: visitors, error: vErr }] = await Promise.all([
        supabase.from("customer_profiles").select("id, full_name, user_id, phone, created_at"),
        supabase.from("queue_visitors").select("phone, visitor_name, joined_at, queue_id, status"),
      ]);

      if (pErr) throw pErr;
      if (vErr) throw vErr;

      const v = visitors || [];
      const rowsFromProfiles: CustRow[] = (profiles || []).map(c => {
        const myVisits = v.filter(x => (c.phone && x.phone === c.phone) || x.visitor_name === c.full_name);
        const lastVisit = myVisits.reduce<number>((max, x) => Math.max(max, new Date(x.joined_at).getTime()), 0);
        const queuesJoined = new Set(myVisits.map(x => x.queue_id)).size;
        return {
          id: c.id,
          name: c.full_name,
          email: c.phone || "—",
          lastActive: lastVisit ? formatDistanceToNow(new Date(lastVisit), { addSuffix: true }) : new Date(c.created_at).toLocaleDateString(),
          joined: queuesJoined,
          visits: myVisits.length,
          status: "active",
        };
      });
      setRows(rowsFromProfiles);
    } catch (err: any) {
      console.error("Error fetching customers:", err);
      setError(err?.message || "Failed to load customers");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filtered = rows.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = !q || r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q);
    const matchFilter = filter === "All" || r.status === filter;
    return matchSearch && matchFilter;
  });

  const exportCSV = () => {
    const head = ["Name", "Email", "Last Active", "Queues Joined", "Visits", "Status"];
    const csv = [head, ...filtered.map(r => [r.name, r.email, r.lastActive, r.joined, r.visits, r.status])]
      .map(row => row.map(c => `"${c}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `qblink-customers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <AdminLayout>
      <div className="flex items-start justify-between flex-wrap gap-3 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Customers</h1>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
            All customers on Qblink —{" "}
            {loading ? (
              <span className="inline-block w-16 h-4 bg-muted animate-pulse rounded align-middle" data-testid="customers-count-skeleton" />
            ) : error ? (
              <span className="text-destructive font-medium">Error loading count</span>
            ) : (
              <span>{rows.length} total</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchData(true)}
            disabled={loading || refreshing}
            className="bg-card border border-border text-foreground px-3 py-2 rounded-xl text-sm font-medium hover:bg-muted transition-colors flex items-center gap-2 disabled:opacity-50"
            title="Refresh customers"
          >
            <RotateCcw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button onClick={exportCSV} disabled={loading || rows.length === 0} className="bg-card border border-border text-foreground px-4 py-2 rounded-xl text-sm font-medium hover:bg-muted transition-colors flex items-center gap-2 disabled:opacity-50">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      <div className="bg-card rounded-2xl p-4 card-shadow mb-4 flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-[220px] relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email…"
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div className="flex gap-1.5">
          {["All", "active", "inactive", "banned"].map(s => (
            <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize ${
              filter === s ? "gradient-bg text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}>{s}</button>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-2xl card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left hidden md:table-cell">Email</th>
                <th className="px-4 py-3 text-left hidden sm:table-cell">Last Active</th>
                <th className="px-4 py-3 text-left hidden lg:table-cell">Joined</th>
                <th className="px-4 py-3 text-left">Visits</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-muted" />
                        <div className="h-4 w-28 bg-muted rounded" />
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell"><div className="h-4 w-32 bg-muted rounded" /></td>
                    <td className="px-4 py-3 hidden sm:table-cell"><div className="h-4 w-20 bg-muted rounded" /></td>
                    <td className="px-4 py-3 hidden lg:table-cell"><div className="h-4 w-12 bg-muted rounded" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-8 bg-muted rounded" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-16 bg-muted rounded-full" /></td>
                    <td className="px-4 py-3 text-right"><div className="h-6 w-14 bg-muted rounded ml-auto" /></td>
                  </tr>
                ))
              ) : error ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <p className="text-sm font-medium text-destructive mb-2">{error}</p>
                    <button
                      onClick={() => fetchData()}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-semibold hover:opacity-90 transition-opacity"
                    >
                      Retry Loading
                    </button>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    {search || filter !== "All" ? "No customers match your search." : "No customers found in the system yet."}
                  </td>
                </tr>
              ) : (
                filtered.map(r => (
                  <tr key={r.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium text-foreground">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-full gradient-bg flex items-center justify-center text-primary-foreground text-xs font-bold">{r.name[0]}</span>
                        {r.name}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{r.email}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{r.lastActive}</td>
                    <td className="px-4 py-3 hidden lg:table-cell">{r.joined}</td>
                    <td className="px-4 py-3">{r.visits}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_CLS[r.status] || "bg-muted"}`}>{r.status}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button title="View" aria-label="View" onClick={() => setSelected(r)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"><Eye className="w-3.5 h-3.5" /></button>
                        <button title="Ban" aria-label="Ban" onClick={() => toast.success(`${r.name} ban toggled`)} className="p-1.5 rounded-lg hover:bg-danger-soft text-danger"><Ban className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-card rounded-2xl p-6 max-w-md w-full card-shadow" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-foreground">{selected.name}</h2>
                <p className="text-xs text-muted-foreground">{selected.email}</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-1 rounded-lg hover:bg-muted"><X className="w-4 h-4" /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Mini label="Queues joined" value={selected.joined} />
              <Mini label="Total visits" value={selected.visits} />
              <Mini label="Last active" value={selected.lastActive} />
              <Mini label="Status" value={selected.status} />
            </div>
            <p className="text-xs text-muted-foreground mt-4">{selected.visits > 0 ? `${selected.visits} visit${selected.visits === 1 ? "" : "s"} across ${selected.joined} queue${selected.joined === 1 ? "" : "s"}` : "No queue visits yet"}</p>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

const Mini = ({ label, value }: { label: string; value: any }) => (
  <div className="bg-muted/40 rounded-xl p-3">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="text-lg font-bold text-foreground capitalize">{value}</p>
  </div>
);

export default AdminCustomers;
