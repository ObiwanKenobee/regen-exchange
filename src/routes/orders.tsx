import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Activity, ArrowLeft, CheckCircle2, Download, ExternalLink, Loader2, RefreshCw, XCircle } from "lucide-react";
import { useWallet, shortHash, type Order, type OrderStatus } from "@/lib/wallet-context";
import { ASSETS } from "@/components/rve/types";
import { downloadCSV, toCSV } from "@/lib/csv";
import { toast } from "sonner";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "Order History — RVE | Atlas Sanctum" },
      { name: "description", content: "Filterable history of your buy and sell orders on the Regenerative Value Exchange." },
      { property: "og:title", content: "Order History — RVE" },
      { property: "og:description", content: "Track pending, confirmed and failed orders. Refresh and retry from one place." },
    ],
  }),
  component: OrderHistoryPage,
});

type StatusFilter = "all" | OrderStatus;
type SideFilter = "all" | "buy" | "sell";

function OrderHistoryPage() {
  const { orders, refreshOrder, clearOrders, pendingCount } = useWallet();
  const [asset, setAsset] = useState<string>("All");
  const [side, setSide] = useState<SideFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");

  const assetSymbols = useMemo(() => ["All", ...ASSETS.map((a) => a.sym)], []);

  const filtered = useMemo(() => {
    const fromTs = from ? new Date(from).getTime() : 0;
    const toTs = to ? new Date(to).getTime() + 24 * 3600 * 1000 : Number.MAX_SAFE_INTEGER;
    return orders.filter((o) =>
      (asset === "All" || o.assetSym === asset) &&
      (side === "all" || o.side === side) &&
      (status === "all" || o.status === status) &&
      o.createdAt >= fromTs && o.createdAt <= toTs,
    );
  }, [orders, asset, side, status, from, to]);

  const refreshPending = () => {
    const pending = filtered.filter((o) => o.status === "pending");
    if (!pending.length) {
      toast("No pending orders to refresh");
      return;
    }
    pending.forEach((o) => refreshOrder(o.id));
    toast.success(`Refreshed ${pending.length} pending order${pending.length === 1 ? "" : "s"}`);
  };

  const exportCsv = () => {
    if (!filtered.length) {
      toast.error("No orders match the current filters");
      return;
    }
    const rows = filtered.map((o) => ({
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
    }));
    downloadCSV(`rve-orders-${Date.now()}.csv`, toCSV(rows));
    toast.success(`Exported ${rows.length} orders`);
  };

  const reset = () => {
    setAsset("All"); setSide("all"); setStatus("all"); setFrom(""); setTo("");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-3 w-3" /> Back
            </Link>
            <div>
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Activity className="h-5 w-5 text-primary" /> Order History
              </div>
              <div className="text-xs text-muted-foreground">{orders.length} total • {pendingCount} pending</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={refreshPending}
              className="flex items-center gap-1.5 rounded-md border border-accent/40 bg-accent/10 px-3 py-1.5 text-sm text-accent hover:bg-accent/20"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Refresh pending
            </button>
            <button
              onClick={exportCsv}
              className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted/50"
            >
              <Download className="h-3.5 w-3.5" /> Export CSV
            </button>
            <button
              onClick={clearOrders}
              className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted/50"
            >
              Clear settled
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-6 py-8">
        <div className="panel p-5">
          <div className="grid gap-4 md:grid-cols-5">
            <Field label="Asset">
              <select value={asset} onChange={(e) => setAsset(e.target.value)} className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm">
                {assetSymbols.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Side">
              <select value={side} onChange={(e) => setSide(e.target.value as SideFilter)} className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm">
                <option value="all">All</option><option value="buy">Buy</option><option value="sell">Sell</option>
              </select>
            </Field>
            <Field label="Status">
              <select value={status} onChange={(e) => setStatus(e.target.value as StatusFilter)} className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm">
                <option value="all">All</option><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="failed">Failed</option>
              </select>
            </Field>
            <Field label="From">
              <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm" />
            </Field>
            <Field label="To">
              <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm" />
            </Field>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>{filtered.length} order{filtered.length === 1 ? "" : "s"} matching</span>
            <button onClick={reset} className="hover:text-foreground">Reset filters</button>
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
                {filtered.length === 0 && (
                  <tr><td colSpan={9} className="p-10 text-center text-sm text-muted-foreground">No orders match the current filters.</td></tr>
                )}
                {filtered.map((o) => (
                  <Row key={o.id} o={o} onRefresh={() => refreshOrder(o.id)} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
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

function Row({ o, onRefresh }: { o: Order; onRefresh: () => void }) {
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
        <button
          onClick={onRefresh}
          disabled={o.status !== "pending"}
          className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs hover:bg-muted/40 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw className="h-3 w-3" /> {o.status === "pending" ? "Retry" : "Refresh"}
        </button>
      </td>
    </tr>
  );
}