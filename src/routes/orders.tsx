import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Activity, ArrowLeft, ArrowUpDown, ArrowUp, CheckCircle2, CheckSquare, ChevronLeft, ChevronRight,
  Download, ExternalLink, History, Loader2, Radio, RefreshCw, RotateCw, Square, XCircle,
} from "lucide-react";
import { useWallet, shortHash, type Order, type OrderStatus } from "@/lib/wallet-context";
import { ASSETS } from "@/components/rve/types";
import { downloadCSV, toCSV } from "@/lib/csv";
import { toast } from "sonner";
import { CsvExportDialog, type CsvColumn } from "@/components/rve/csv-export-dialog";
import { PresetBar } from "@/components/rve/preset-bar";
import { useExportJobs } from "@/lib/export-jobs";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "Order History — RVE | Atlas Sanctum" },
      { name: "description", content: "Virtualized order history with bulk retry, streaming updates, presets and background CSV export." },
      { property: "og:title", content: "Order History — RVE" },
      { property: "og:description", content: "Track pending, confirmed and failed orders. Virtualized, streaming, exportable." },
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
  pageSize: number;
};

const DEFAULT_FILTERS: OrderFilters = { asset: "All", side: "all", status: "all", from: "", to: "", sort: "newest", pageSize: 50 };
const STATUS_RANK: Record<OrderStatus, number> = { pending: 0, failed: 1, confirmed: 2 };
const FILTERS_KEY = "rve.orders.filters.v1";
const PAGE_SIZES = [25, 50, 100, 200];

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

const ROW_H = 60;
const VIEWPORT_H = 600;
const OVERSCAN = 6;

function loadFilters(): OrderFilters {
  if (typeof window === "undefined") return DEFAULT_FILTERS;
  try {
    const raw = window.localStorage.getItem(FILTERS_KEY);
    if (!raw) return DEFAULT_FILTERS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_FILTERS, ...parsed };
  } catch { return DEFAULT_FILTERS; }
}

function OrderHistoryPage() {
  const {
    orders, refreshOrder, retryOrder, clearOrders, pendingCount,
    retryFailed, refreshPending, streamEnabled, setStreamEnabled,
    setStreamFilters,
  } = useWallet();
  const { startExport, openHistory } = useExportJobs();
  const [filters, setFilters] = useState<OrderFilters>(() => loadFilters());
  const [page, setPage] = useState(1);
  const [csvOpen, setCsvOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [autoFollowStream, setAutoFollowStream] = useState(true);
  const [pendingNew, setPendingNew] = useState(0);
  const lastSeenIdRef = useRef<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  const set = (patch: Partial<OrderFilters>) => setFilters((f) => ({ ...f, ...patch }));
  const assetSymbols = useMemo(() => ["All", ...ASSETS.map((a) => a.sym)], []);

  // Persist filters across reloads
  useEffect(() => {
    if (typeof window === "undefined") return;
    try { window.localStorage.setItem(FILTERS_KEY, JSON.stringify(filters)); } catch {}
  }, [filters]);

  // Sync synthetic stream to current asset/side filter so noise respects context
  useEffect(() => {
    setStreamFilters({ asset: filters.asset, side: filters.side });
  }, [filters.asset, filters.side, setStreamFilters]);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [filters.asset, filters.side, filters.status, filters.from, filters.to, filters.sort, filters.pageSize]);

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

  // Server-style pagination: slice the sorted+filtered set into page windows
  const totalFiltered = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / filters.pageSize));
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * filters.pageSize;
  const pageEnd = Math.min(totalFiltered, pageStart + filters.pageSize);
  const pageRows = useMemo(() => filtered.slice(pageStart, pageEnd), [filtered, pageStart, pageEnd]);

  // Track new matching orders without jumping the table
  useEffect(() => {
    const topId = filtered[0]?.id ?? null;
    if (lastSeenIdRef.current === null) {
      lastSeenIdRef.current = topId;
      return;
    }
    if (topId && topId !== lastSeenIdRef.current) {
      // count how many new matching rows arrived since last seen
      const idx = filtered.findIndex((o) => o.id === lastSeenIdRef.current);
      const newCount = idx === -1 ? Math.min(filtered.length, 10) : idx;
      if (newCount > 0) {
        if (autoFollowStream && safePage === 1 && scrollRef.current && scrollRef.current.scrollTop < 4) {
          // user is at top: silently follow
          lastSeenIdRef.current = topId;
          setPendingNew(0);
        } else {
          setPendingNew((n) => n + newCount);
        }
      }
    }
  }, [filtered, autoFollowStream, safePage]);

  const jumpToTop = useCallback(() => {
    setPage(1);
    requestAnimationFrame(() => { if (scrollRef.current) scrollRef.current.scrollTop = 0; });
    lastSeenIdRef.current = filtered[0]?.id ?? null;
    setPendingNew(0);
  }, [filtered]);

  // Virtualization within current page
  const totalH = pageRows.length * ROW_H;
  const startIdx = Math.max(0, Math.floor(scrollTop / ROW_H) - OVERSCAN);
  const visibleCount = Math.ceil(VIEWPORT_H / ROW_H) + OVERSCAN * 2;
  const endIdx = Math.min(pageRows.length, startIdx + visibleCount);
  const visibleRows = pageRows.slice(startIdx, endIdx);
  const padTop = startIdx * ROW_H;

  // Bulk selection
  const pageIds = useMemo(() => pageRows.map((o) => o.id), [pageRows]);
  const allSelected = pageIds.length > 0 && pageIds.every((id) => selected.has(id));
  const someSelected = selected.size > 0;
  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected((s) => new Set([...s, ...pageIds]));
  };
  const toggleOne = (id: string) =>
    setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const selectedOrders = useMemo(() => filtered.filter((o) => selected.has(o.id)), [filtered, selected]);
  const selectedPendingIds = selectedOrders.filter((o) => o.status === "pending").map((o) => o.id);
  const selectedFailedIds = selectedOrders.filter((o) => o.status === "failed").map((o) => o.id);

  const handleBulkRefreshSelected = () => {
    if (!selectedPendingIds.length) return toast("No pending orders selected");
    const n = refreshPending(selectedPendingIds);
    toast.success(`Refreshed ${n} pending order${n === 1 ? "" : "s"}`);
  };
  const handleBulkRetryFailed = () => {
    const ids = selectedFailedIds.length ? selectedFailedIds : filtered.filter((o) => o.status === "failed").map((o) => o.id);
    if (!ids.length) return toast("No failed orders to retry");
    retryFailed(ids);
  };
  const handleRefreshAllPending = () => {
    const n = refreshPending();
    if (!n) toast("No pending orders to refresh");
    else toast.success(`Refreshed ${n} pending order${n === 1 ? "" : "s"}`);
  };

  const exportCsv = (cols: string[], scope: "filtered" | "all", opts: { background: boolean }) => {
    // CSV export uses the full filtered dataset (not the loaded page window)
    const source = scope === "all" ? orders : filtered;
    if (!source.length) return toast.error("No orders to export");
    const filename = `rve-orders-${scope}-${Date.now()}.csv`;
    if (opts.background) {
      startExport({
        filename, columns: cols,
        rows: () => source.map(buildRow),
        chunkSize: 500,
      });
      toast(`Export queued — ${source.length.toLocaleString()} rows`, { description: "Running in the background." });
    } else {
      downloadCSV(filename, toCSV(source.map(buildRow), cols));
      toast.success(`Exported ${source.length} orders (${cols.length} columns)`);
    }
  };

  const isActivePreset = (p: OrderFilters) =>
    p.asset === filters.asset && p.side === filters.side && p.status === filters.status &&
    p.from === filters.from && p.to === filters.to && p.sort === filters.sort && p.pageSize === filters.pageSize;

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
              <div className="text-xs text-muted-foreground">{orders.length} total • {pendingCount} pending • {filtered.length} matching {selected.size > 0 && <>• <span className="text-primary">{selected.size} selected</span></>}</div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setStreamEnabled(!streamEnabled)}
              className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm ${streamEnabled ? "border-primary/50 bg-primary/10 text-primary" : "border-border hover:bg-muted/50"}`}
              title="Continuously stream new orders into your history"
            >
              <Radio className={`h-3.5 w-3.5 ${streamEnabled ? "animate-pulse" : ""}`} /> {streamEnabled ? "Streaming" : "Stream off"}
            </button>
            <button onClick={handleRefreshAllPending} className="flex items-center gap-1.5 rounded-md border border-accent/40 bg-accent/10 px-3 py-1.5 text-sm text-accent hover:bg-accent/20">
              <RefreshCw className="h-3.5 w-3.5" /> Refresh pending
            </button>
            <button onClick={openHistory} className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted/50" title="Past export jobs">
              <History className="h-3.5 w-3.5" /> Export history
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
          <div className="grid gap-4 md:grid-cols-7">
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
            <Field label="Page size">
              <select value={filters.pageSize} onChange={(e) => set({ pageSize: Number(e.target.value) })} className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm">
                {PAGE_SIZES.map((n) => <option key={n} value={n}>{n} / page</option>)}
              </select>
            </Field>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-3">
            <PresetBar<OrderFilters>
              scope="orders"
              current={filters}
              onApply={(p) => setFilters(p)}
              isActive={isActivePreset}
            />
            <div className="flex items-center gap-3">
              {streamEnabled && (
                <label className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <input type="checkbox" className="accent-primary" checked={autoFollowStream} onChange={(e) => setAutoFollowStream(e.target.checked)} />
                  Auto-scroll on new
                </label>
              )}
              <button onClick={() => setFilters(DEFAULT_FILTERS)} className="text-[11px] uppercase tracking-wider text-muted-foreground hover:text-foreground">Reset</button>
            </div>
          </div>
        </div>

        {pendingNew > 0 && (
          <button
            onClick={jumpToTop}
            className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20"
          >
            <ArrowUp className="h-3.5 w-3.5" /> {pendingNew} new matching order{pendingNew === 1 ? "" : "s"} — jump to top
          </button>
        )}

        {/* Bulk action bar */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-md border border-border/60 bg-muted/20 px-3 py-2 text-xs">
          <div className="flex items-center gap-2">
            <button onClick={toggleAll} className="flex items-center gap-1 hover:text-foreground">
              {allSelected ? <CheckSquare className="h-3.5 w-3.5 text-primary" /> : <Square className="h-3.5 w-3.5 text-muted-foreground" />}
              {allSelected ? "Unselect page" : `Select page (${pageRows.length})`}
            </button>
            {someSelected && <button onClick={() => setSelected(new Set())} className="text-muted-foreground hover:text-destructive">Clear</button>}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleBulkRefreshSelected}
              disabled={!selectedPendingIds.length}
              className="flex items-center gap-1 rounded-md border border-accent/40 bg-accent/10 px-2 py-1 text-accent hover:bg-accent/20 disabled:opacity-50"
            >
              <RefreshCw className="h-3 w-3" /> Refresh selected pending ({selectedPendingIds.length})
            </button>
            <button
              onClick={handleBulkRetryFailed}
              className="flex items-center gap-1 rounded-md border border-primary/40 bg-primary/10 px-2 py-1 text-primary hover:bg-primary/20"
            >
              <RotateCw className="h-3 w-3" /> Retry {selectedFailedIds.length ? `${selectedFailedIds.length} selected` : "all"} failed
            </button>
          </div>
        </div>

        {/* Virtualized list */}
        <div className="panel mt-3 overflow-hidden">
          <div className="grid grid-cols-[36px_1.4fr_0.7fr_0.6fr_0.7fr_0.7fr_0.8fr_1.1fr_1fr_0.8fr] items-center gap-2 border-b border-border/60 px-4 py-2 text-[10px] uppercase tracking-wider text-muted-foreground">
            <div></div>
            <div>When / Asset</div>
            <div>Side</div>
            <div className="text-right">Qty</div>
            <div className="text-right">Price</div>
            <div className="text-right">Total</div>
            <div>Status</div>
            <div>Tx</div>
            <div></div>
            <div className="text-right">Action</div>
          </div>

          {pageRows.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">No orders match the current filters.</div>
          ) : (
            <div
              ref={scrollRef}
              onScroll={(e) => setScrollTop((e.target as HTMLDivElement).scrollTop)}
              style={{ height: VIEWPORT_H, overflowY: "auto" }}
              className="relative"
            >
              <div style={{ height: totalH, position: "relative" }}>
                <div style={{ transform: `translateY(${padTop}px)` }}>
                  {visibleRows.map((o) => (
                    <VirtualRow
                      key={o.id}
                      o={o}
                      checked={selected.has(o.id)}
                      onToggle={() => toggleOne(o.id)}
                      onRefresh={() => refreshOrder(o.id)}
                      onRetry={() => retryOrder(o.id)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 px-4 py-2 text-[11px] text-muted-foreground">
            <div>
              Showing <span className="font-mono text-foreground">{totalFiltered === 0 ? 0 : pageStart + 1}–{pageEnd}</span> of <span className="font-mono text-foreground">{totalFiltered.toLocaleString()}</span> filtered
              <span className="ml-2 text-muted-foreground/70">• page {safePage} / {totalPages}</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(1)} disabled={safePage <= 1} className="rounded border border-border px-1.5 py-0.5 disabled:opacity-40 hover:bg-muted/40">First</button>
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage <= 1} className="rounded border border-border px-1 py-0.5 disabled:opacity-40 hover:bg-muted/40"><ChevronLeft className="h-3 w-3" /></button>
              <span className="px-2 font-mono">{safePage} / {totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage >= totalPages} className="rounded border border-border px-1 py-0.5 disabled:opacity-40 hover:bg-muted/40"><ChevronRight className="h-3 w-3" /></button>
              <button onClick={() => setPage(totalPages)} disabled={safePage >= totalPages} className="rounded border border-border px-1.5 py-0.5 disabled:opacity-40 hover:bg-muted/40">Last</button>
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
        presetScope="orders"
        background
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

function VirtualRow({ o, checked, onToggle, onRefresh, onRetry }: {
  o: Order; checked: boolean; onToggle: () => void; onRefresh: () => void; onRetry: () => void;
}) {
  return (
    <div
      style={{ height: ROW_H }}
      className={`grid grid-cols-[36px_1.4fr_0.7fr_0.6fr_0.7fr_0.7fr_0.8fr_1.1fr_1fr_0.8fr] items-center gap-2 border-b border-border/40 px-4 hover:bg-muted/20 ${checked ? "bg-primary/5" : ""}`}
    >
      <div>
        <input type="checkbox" checked={checked} onChange={onToggle} className="accent-primary" />
      </div>
      <div className="min-w-0">
        <div className="truncate font-mono text-xs">{o.assetSym} <span className="text-muted-foreground">• {o.assetName}</span></div>
        <div className="text-[10px] text-muted-foreground">{new Date(o.createdAt).toLocaleString()}</div>
      </div>
      <div className={`font-mono text-xs uppercase ${o.side === "buy" ? "text-primary" : "text-destructive"}`}>{o.side}</div>
      <div className="text-right font-mono text-xs">{o.qty}</div>
      <div className="text-right font-mono text-xs">${o.price.toFixed(2)}</div>
      <div className="text-right font-mono text-xs">${o.total.toFixed(2)}</div>
      <div>
        <StatusPill s={o.status} />
        <div className="mt-0.5 text-[10px] text-muted-foreground">{o.confirmations}/{o.requiredConfirmations} {o.block ? `• #${o.block.toLocaleString()}` : ""}</div>
      </div>
      <div className="min-w-0">
        <a href={o.explorerUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 truncate font-mono text-xs text-secondary hover:underline">
          {shortHash(o.txHash)} <ExternalLink className="h-3 w-3 shrink-0" />
        </a>
      </div>
      <div></div>
      <div className="text-right">
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
      </div>
    </div>
  );
}
