import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Activity, ArrowLeft, ArrowUpDown, CheckCircle2, ChevronLeft, ChevronRight, Download, ExternalLink, Loader2, RefreshCw, RotateCw, XCircle } from "lucide-react";
import { useWallet, shortHash, type Order, type OrderStatus } from "@/lib/wallet-context";
import { ASSETS } from "@/components/rve/types";
import { downloadCSV, toCSV } from "@/lib/csv";
import { toast } from "sonner";
import { CsvExportDialog, type CsvColumn } from "@/components/rve/csv-export-dialog";
import { PresetBar } from "@/components/rve/preset-bar";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "Order History — RVE | Atlas Sanctum" },
      { name: "description", content: "Filterable, sortable order history with retry, presets and CSV export." },
      { property: "og:title", content: "Order History — RVE" },
      { property: "og:description", content: "Track pending, confirmed and failed orders. Sort, paginate, retry and export." },
    ],
  }),
  component: OrderHistoryPage,
});

type StatusFilter = "all" | OrderStatus;
type SideFilter = "all" | "buy" | "sell";
type SortKey = "newest" | "oldest" | "status" | "asset" | "total";

type OrderFilters = {
  asset: string;
  side: SideFilter;
  status: StatusFilter;
  from: string;
  to: string;
  sort: SortKey;
};

const DEFAULT_FILTERS: OrderFilters = { asset: "All", side: "all", status: "all", from: "", to: "", sort: "newest" };

const STATUS_RANK: Record<OrderStatus, number> = { pending: 0, failed: 1, confirmed: 2 };

const COLUMNS: CsvColumn[] = [
  { key: "timestamp", label: "Timestamp", defaultOn: true, alwaysOn: true },
  { key: "asset", label: "Asset", defaultOn: true, alwaysOn: true },
  { key: "assetName", label: "Asset name", defaultOn: false },
  { key: "side", label: "Side", defaultOn: true },
  { key: "qty", label: "Quantity", defaultOn: true },
  { key: "price", label: "Price", defaultOn: true },
  { key: "total", label: "Total", defaultOn: true },
  { key: "fee", label: "Network fee", defaultOn: false },
  { key: "restorationFee", label: "Restoration fee", defaultOn: false },
  { key: "status", label: "Status", defaultOn: true },
  { key: "confirmations", label: "Confirmations", defaultOn: false },
  { key: "block", label: "Block", defaultOn: false },
  { key: "txHash", label: "Tx hash", defaultOn: true },
  { key: "explorer", label: "Explorer URL", defaultOn: false },
  { key: "wallet", label: "Wallet provider", defaultOn: false },
];

function OrderHistoryPage() {
  const { orders, refreshOrder, retryOrder, clearOrders, pendingCount } = useWallet();
  const [filters, setFilters] = useState<OrderFilters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [csvOpen, setCsvOpen] = useState(false);

  const set = (patch: Partial<OrderFilters>) => { setFilters((f) => ({ ...f, ...patch })); setPage(1); };
  const assetSymbols = useMemo(() => ["All", ...ASSETS.map((a) => a.sym)], []);

  const filtered = useMemo(() => {
    const fromTs = filters.from ? new Date(filters.from).getTime() : 0;
    const toTs = filters.to ? new Date(filters.to).getTime() + 24 * 3600 * 1000 : Number.MAX_SAFE_INTEGER;
    const list = orders.filter((o) =>
      (filters.asset === "All" || o.assetSym === filters.asset) &&
      (filters.side === "all" || o.side === filters.side) &&
      (filters.status === "all" || o.status === filters.status) &&
      o.createdAt >= fromTs && o.createdAt <= toTs,
    );
    const sorted = [...list].sort((a, b) => {
      switch (filters.sort) {
        case "oldest": return a.createdAt - b.createdAt;
        case "status": return STATUS_RANK[a.status] - STATUS_RANK[b.status] || b.createdAt - a.createdAt;
        case "asset": return a.assetSym.localeCompare(b.assetSym) || b.createdAt - a.createdAt;
        case "total": return b.total - a.total;
        case "newest":
        default: return b.createdAt - a.createdAt;
      }
    });
    return sorted;
  }, [orders, filters]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const paged = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const refreshPending = () => {
    const pending = filtered.filter((o) => o.status === "pending");
    if (!pending.length) return toast("No pending orders to refresh");
    pending.forEach((o) => refreshOrder(o.id));
    toast.success(`Refreshed ${pending.length} pending order${pending.length === 1 ? "" : "s"}`);
  };

  const exportCsv = (cols: string[], scope: "filtered" | "all") => {
    const source = scope === "all" ? orders : filtered;
    if (!source.length) return toast.error("No orders to export");
    const rows = source.map((o) => buildRow(o));
    downloadCSV(`rve-orders-${scope}-${Date.now()}.csv`, toCSV(rows, cols));
    toast.success(`Exported ${rows.length} orders (${cols.length} columns)`);
  };

  const isActivePreset = (p: OrderFilters) =>
    p.asset === filters.asset && p.side === filters.side && p.status === filters.status &&
    p.from === filters.from && p.to === filters.to && p.sort === filters.sort;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-6 py-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-3 w-3" /> Back
            </Link>
            <div>
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Activity className="h-5 w-5 text-primary" /> Order History
              </div>
              <div className="text-xs text-muted-foreground">{orders.length} total • {pendingCount} pending • {filtered.length} matching</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={refreshPending} className="flex items-center gap-1.5 rounded-md border border-accent/40 bg-accent/10 px-3 py-1.5 text-sm text-accent hover:bg-accent/20">
              <RefreshCw className="h-3.5 w-3.5" /> Refresh pending
            </button>
            <button onClick={() => setCsvOpen(true)} className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted/50">
              <Download className="h-3.5 w-3.5" /> Export CSV
            </button>
            <button onClick={clearOrders} className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted/50">
              Clear settled
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-6 py-8">
        <div className="panel p-5">
          <div className="grid gap-4 md:grid-cols-6">
            <Field label="Asset">
              <select value={filters.asset} onChange={(e) => set({ asset: e.target.value })} className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm">
                {assetSymbols.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Side">
              <select value={filters.side} onChange={(e) => set({ side: e.target.value as SideFilter })} className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm">
                <option value="all">All</option><option value="buy">Buy</option><option value="sell">Sell</option>
              </select>
            </Field>
            <Field label="Status">
              <select value={filters.status} onChange={(e) => set({ status: e.target.value as StatusFilter })} className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm">
                <option value="all">All</option><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="failed">Failed</option>
              </select>
            </Field>
            <Field label="From">
              <input type="date" value={filters.from} onChange={(e) => set({ from: e.target.value })} className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm" />
            </Field>
            <Field label="To">
              <input type="date" value={filters.to} onChange={(e) => set({ to: e.target.value })} className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm" />
            </Field>
            <Field label={<span className="flex items-center gap-1"><ArrowUpDown className="h-3 w-3" /> Sort</span>}>
              <select value={filters.sort} onChange={(e) => set({ sort: e.target.value as SortKey })} className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm">
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="status">Status (pending → confirmed)</option>
                <option value="asset">Asset (A → Z)</option>
                <option value="total">Total (high → low)</option>
              </select>
            </Field>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-3">
            <PresetBar<OrderFilters>
              scope="orders"
              current={filters}
              onApply={(p) => { setFilters(p); setPage(1); }}
              isActive={isActivePreset}
            />
            <button onClick={() => { setFilters(DEFAULT_FILTERS); setPage(1); }} className="text-[11px] uppercase tracking-wider text-muted-foreground hover:text-foreground">Reset</button>
          </div>
        </div>

        <div className="panel mt-6 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3 text-left font-normal">When</th>
                  <th className="px-3 py-3 text-left font-normal">Asset</th>
                  <th className="px-3 py-3 text-left font-normal">Side</th>
                  <th className="px-3 py-3 text-right font-normal">Qty</th>
                  <th className="px-3 py-3 text-right font-normal">Price</th>
                  <th className="px-3 py-3 text-right font-normal">Total</th>
                  <th className="px-3 py-3 text-left font-normal">Status</th>
                  <th className="px-3 py-3 text-left font-normal">Tx</th>
                  <th className="px-4 py-3 text-right font-normal"></th>
                </tr>
              </thead>
              <tbody>
                {paged.length === 0 && (
                  <tr><td colSpan={9} className="p-10 text-center text-sm text-muted-foreground">No orders match the current filters.</td></tr>
                )}
                {paged.map((o) => (
                  <Row
                    key={o.id}
                    o={o}
                    onRefresh={() => refreshOrder(o.id)}
                    onRetry={() => retryOrder(o.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 px-5 py-3 text-xs">
            <div className="flex items-center gap-2 text-muted-foreground">
              Page size
              <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} className="rounded-md border border-border bg-background px-2 py-1">
                {[10, 25, 50, 100].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
              <span className="ml-2">{filtered.length === 0 ? 0 : (safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, filtered.length)} of {filtered.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <button disabled={safePage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="flex items-center gap-1 rounded-md border border-border px-2 py-1 disabled:opacity-50">
                <ChevronLeft className="h-3 w-3" /> Prev
              </button>
              <span className="font-mono">{safePage} / {pageCount}</span>
              <button disabled={safePage >= pageCount} onClick={() => setPage((p) => Math.min(pageCount, p + 1))} className="flex items-center gap-1 rounded-md border border-border px-2 py-1 disabled:opacity-50">
                Next <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </main>

      <CsvExportDialog
        open={csvOpen}
        onOpenChange={setCsvOpen}
        title="Export orders"
        columns={COLUMNS}
        storageKey="rve.csv.orders.v1"
        filteredCount={filtered.length}
        totalCount={orders.length}
        onExport={exportCsv}
      />
    </div>
  );
}

function buildRow(o: Order): Record<string, unknown> {
  return {
    timestamp: new Date(o.createdAt).toISOString(),
    asset: o.assetSym,
    assetName: o.assetName,
    side: o.side,
    qty: o.qty,
    price: o.price,
    total: o.total,
    fee: o.fee,
    restorationFee: o.restorationFee,
    status: o.status,
    confirmations: `${o.confirmations}/${o.requiredConfirmations}`,
    block: o.block ?? "",
    txHash: o.txHash,
    explorer: o.explorerUrl,
    wallet: o.walletProvider,
  };
}

function Field({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="block text-xs">
      <div className="mb-1 uppercase tracking-wider text-muted-foreground">{label}</div>
      {children}
    </label>
  );
}

function StatusPill({ s }: { s: OrderStatus }) {
  if (s === "pending") return <span className="inline-flex items-center gap-1 rounded-full border border-accent/40 bg-accent/15 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-accent"><Loader2 className="h-3 w-3 animate-spin" />Pending</span>;
  if (s === "confirmed") return <span className="inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/15 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-primary"><CheckCircle2 className="h-3 w-3" />Confirmed</span>;
  return <span className="inline-flex items-center gap-1 rounded-full border border-destructive/40 bg-destructive/15 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-destructive"><XCircle className="h-3 w-3" />Failed</span>;
}

function Row({ o, onRefresh, onRetry }: { o: Order; onRefresh: () => void; onRetry: () => void }) {
  return (
    <tr className="border-b border-border/40 hover:bg-muted/20">
      <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleString()}</td>
      <td className="px-3 py-3"><div className="font-mono text-xs">{o.assetSym}</div><div className="text-xs text-muted-foreground">{o.assetName}</div></td>
      <td className={`px-3 py-3 font-mono text-xs uppercase ${o.side === "buy" ? "text-primary" : "text-destructive"}`}>{o.side}</td>
      <td className="px-3 py-3 text-right font-mono">{o.qty}</td>
      <td className="px-3 py-3 text-right font-mono">${o.price.toFixed(2)}</td>
      <td className="px-3 py-3 text-right font-mono">${o.total.toFixed(2)}</td>
      <td className="px-3 py-3"><StatusPill s={o.status} /><div className="mt-0.5 text-[10px] text-muted-foreground">{o.confirmations}/{o.requiredConfirmations} • {o.block ? `#${o.block.toLocaleString()}` : "—"}</div></td>
      <td className="px-3 py-3">
        <a href={o.explorerUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 font-mono text-xs text-secondary hover:underline">
          {shortHash(o.txHash)} <ExternalLink className="h-3 w-3" />
        </a>
      </td>
      <td className="px-4 py-3 text-right">
        {o.status === "failed" ? (
          <button onClick={onRetry} className="inline-flex items-center gap-1 rounded-md border border-primary/40 bg-primary/10 px-2 py-1 text-xs text-primary hover:bg-primary/20">
            <RotateCw className="h-3 w-3" /> Retry
          </button>
        ) : (
          <button
            onClick={onRefresh}
            disabled={o.status !== "pending"}
            className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs hover:bg-muted/40 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw className="h-3 w-3" /> Refresh
          </button>
        )}
      </td>
    </tr>
  );
}