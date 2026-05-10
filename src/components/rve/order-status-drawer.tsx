import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Activity, CheckCircle2, ExternalLink, Loader2, RefreshCw, Trash2, XCircle } from "lucide-react";
import { useWallet, shortHash, type Order, type OrderStatus } from "@/lib/wallet-context";

export function OrderStatusDrawer({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { orders, refreshOrder, clearOrders, pendingCount } = useWallet();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto border-l border-border bg-card sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            Order Activity
            {pendingCount > 0 && (
              <span className="ml-1 rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-mono text-accent">{pendingCount} pending</span>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>{orders.length} order{orders.length === 1 ? "" : "s"}</span>
          <button
            onClick={clearOrders}
            disabled={!orders.some((o) => o.status !== "pending")}
            className="flex items-center gap-1 rounded-md border border-border px-2 py-1 hover:bg-muted/40 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 className="h-3 w-3" /> Clear settled
          </button>
        </div>

        <ul className="mt-3 space-y-3">
          {orders.length === 0 && (
            <li className="rounded-lg border border-dashed border-border bg-muted/20 p-8 text-center text-sm text-muted-foreground">
              No orders yet. Submit a buy or sell to see live transaction status here.
            </li>
          )}
          {orders.map((o) => (
            <OrderRow key={o.id} order={o} onRefresh={() => refreshOrder(o.id)} />
          ))}
        </ul>
      </SheetContent>
    </Sheet>
  );
}

function StatusBadge({ s }: { s: OrderStatus }) {
  if (s === "pending") return <span className="inline-flex items-center gap-1 rounded-full border border-accent/40 bg-accent/15 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-accent"><Loader2 className="h-3 w-3 animate-spin" />Pending</span>;
  if (s === "confirmed") return <span className="inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/15 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-primary"><CheckCircle2 className="h-3 w-3" />Confirmed</span>;
  return <span className="inline-flex items-center gap-1 rounded-full border border-destructive/40 bg-destructive/15 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-destructive"><XCircle className="h-3 w-3" />Failed</span>;
}

function OrderRow({ order, onRefresh }: { order: Order; onRefresh: () => void }) {
  const pct = Math.min(100, (order.confirmations / order.requiredConfirmations) * 100);
  return (
    <li className="rounded-lg border border-border bg-muted/20 p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 text-sm">
            <span className={`font-mono text-xs uppercase tracking-wider ${order.side === "buy" ? "text-primary" : "text-destructive"}`}>{order.side}</span>
            <span className="font-medium">{order.qty} {order.assetSym}</span>
            <span className="text-xs text-muted-foreground">@ ${order.price.toFixed(2)}</span>
          </div>
          <div className="mt-0.5 text-xs text-muted-foreground">{order.assetName} • via {order.walletProvider}</div>
        </div>
        <StatusBadge s={order.status} />
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
        <KV k="Total" v={`$${order.total.toFixed(2)}`} />
        <KV k="Confirmations" v={`${order.confirmations}/${order.requiredConfirmations}`} />
        <KV k="Block" v={order.block ? `#${order.block.toLocaleString()}` : "—"} />
      </div>

      <div className="mt-3 h-1 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full transition-all ${order.status === "failed" ? "bg-destructive" : order.status === "confirmed" ? "bg-gradient-aurora" : "bg-accent"}`}
          style={{ width: `${order.status === "failed" ? 100 : pct}%` }}
        />
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 text-xs">
        <a
          href={order.explorerUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 font-mono text-secondary hover:underline"
          title={order.txHash}
        >
          {shortHash(order.txHash)} <ExternalLink className="h-3 w-3" />
        </a>
        <button
          onClick={onRefresh}
          disabled={order.status !== "pending"}
          className="flex items-center gap-1 rounded-md border border-border px-2 py-1 hover:bg-muted/40 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw className="h-3 w-3" /> Refresh
        </button>
      </div>
    </li>
  );
}

function KV({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded border border-border bg-background/40 px-2 py-1.5">
      <div className="text-[9px] uppercase tracking-wider text-muted-foreground">{k}</div>
      <div className="font-mono">{v}</div>
    </div>
  );
}

export function OrderActivityButton({ onOpen }: { onOpen: () => void }) {
  const { orders, pendingCount } = useWallet();
  if (orders.length === 0) return null;
  return (
    <button
      onClick={onOpen}
      className="relative flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-1.5 text-sm hover:bg-muted/60"
      title="Order activity"
    >
      <Activity className="h-4 w-4 text-primary" />
      <span className="hidden md:inline">Orders</span>
      <span className="rounded-full bg-muted px-1.5 font-mono text-[10px]">{orders.length}</span>
      {pendingCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 font-mono text-[10px] text-accent-foreground">
          {pendingCount}
        </span>
      )}
    </button>
  );
}