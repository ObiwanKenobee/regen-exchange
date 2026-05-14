import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle2, ExternalLink, Info, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useWallet, shortHash, type Order } from "@/lib/wallet-context";
import { createTradingOrder } from "@/lib/rve/identity.functions";
import type { Asset } from "./types";

type Side = "buy" | "sell";

export function OrderTicket({ asset, open, onOpenChange, initialSide = "buy", onViewOrders }: {
  asset: Asset | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initialSide?: Side;
  onViewOrders?: () => void;
}) {
  const { wallet, submitOrder, orders } = useWallet();
  const [side, setSide] = useState<Side>(initialSide);
  const [orderType, setOrderType] = useState<"market" | "limit">("market");
  const [limitPrice, setLimitPrice] = useState("0");
  const [qty, setQty] = useState("10");
  const [step, setStep] = useState<"ticket" | "confirm" | "signing" | "done">("ticket");
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const liveOrder: Order | undefined = submittedId ? orders.find((o) => o.id === submittedId) : undefined;

  const quantity = Math.max(0, parseFloat(qty) || 0);
  const limitPriceValue = Math.max(0, parseFloat(limitPrice) || asset?.price || 0);
  const limitPriceValid = orderType === "limit" ? limitPriceValue > 0 : true;
  const data = useMemo(() => {
    if (!asset) return null;
    const executionPrice = orderType === "limit" ? limitPriceValue : asset.price;
    const sizeUSD = quantity * executionPrice;
    const impact = Math.min(8, (sizeUSD / (asset.liquidity * 1_000_000)) * 100);
    const slippage = impact * 0.6;
    const exec = side === "buy" ? executionPrice * (1 + impact / 100) : executionPrice * (1 - impact / 100);
    const total = exec * quantity;
    const fee = total * 0.0025;
    const restorationFee = total * 0.005;
    return {
      sizeUSD,
      impact,
      slippage,
      exec,
      total,
      fee,
      restorationFee,
      grand: side === "buy" ? total + fee + restorationFee : total - fee - restorationFee,
      executionPrice,
    };
  }, [asset, quantity, side, orderType, limitPriceValue]);

  if (!asset || !data) return null;
  const Icon = asset.icon;
  const high = data.impact > 2;

  const reset = () => { setStep("ticket"); setQty("10"); setOrderType("market"); setLimitPrice(asset?.price.toFixed(2) ?? "0"); setSubmittedId(null); };

  useEffect(() => {
    if (!asset) return;
    setOrderType("market");
    setLimitPrice(asset.price.toFixed(2));
    setSide(initialSide);
  }, [asset, initialSide]);

  const sign = async () => {
    if (!wallet || !data) return;
    if (orderType === "limit" && !limitPriceValid) {
      toast.error("Enter a valid limit price before submitting.");
      return;
    }
    setStep("signing");
    await new Promise((r) => setTimeout(r, 900));

    let createdOrder;
    try {
      if (asset?.id) {
        createdOrder = await createTradingOrder({
          userId: wallet.address,
          assetId: asset.id,
          side,
          type: orderType,
          quantity,
          price: orderType === "limit" ? limitPriceValue : undefined,
        });
      }
    } catch (error) {
      console.warn("Failed to persist trading order:", error);
      toast.error("Could not submit the order to the trading engine.");
      setStep("ticket");
      return;
    }

    const order = submitOrder({
      id: createdOrder?.id,
      assetSym: asset.sym,
      assetName: asset.name,
      side,
      qty: quantity,
      price: createdOrder?.price ?? data.exec,
      total: createdOrder ? (createdOrder.price ?? data.exec) * quantity : data.grand,
      fee: data.fee,
      restorationFee: data.restorationFee,
      requiredConfirmations: createdOrder?.status === "filled" ? 1 : 3,
    });
    setSubmittedId(order.id);

    setStep("done");
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setTimeout(reset, 300); }}>
      <DialogContent className="border-border bg-card sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-muted/40"><Icon className="h-4 w-4 text-primary" /></span>
            <span>{step === "done" ? "Order Filled" : `${side === "buy" ? "Buy" : "Sell"} ${asset.sym}`}</span>
          </DialogTitle>
        </DialogHeader>

        {step === "ticket" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 rounded-md bg-muted/40 p-1 text-sm">
              {(["buy", "sell"] as Side[]).map((s) => (
                <button key={s} onClick={() => setSide(s)} className={`flex-1 rounded px-3 py-1.5 font-medium capitalize transition ${side === s ? (s === "buy" ? "bg-primary/20 text-primary" : "bg-destructive/20 text-destructive") : "text-muted-foreground"}`}>
                  {s}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 rounded-lg border border-border bg-muted/30 p-4">
              <button
                type="button"
                onClick={() => setOrderType("market")}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${orderType === "market" ? "bg-primary/15 text-primary" : "text-muted-foreground"}`}
              >
                Market
              </button>
              <button
                type="button"
                onClick={() => setOrderType("limit")}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${orderType === "limit" ? "bg-primary/15 text-primary" : "text-muted-foreground"}`}
              >
                Limit
              </button>
              <div className="ml-auto text-xs text-muted-foreground">Selected: {orderType.toUpperCase()}</div>
            </div>

            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <label htmlFor="order-qty" className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Quantity</span>
                <span>Mid ${asset.price.toFixed(2)}</span>
              </label>
              <div className="mt-2 flex items-baseline gap-2 w-full">
                <input
                  id="order-qty"
                  type="number" min={0} step={0.01} value={qty} onChange={(e) => setQty(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-transparent font-mono text-3xl outline-none"
                />
                <span className="text-sm text-muted-foreground">{asset.sym}</span>
              </div>
              {orderType === "limit" && (
                <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-background/70 p-3">
                  <label htmlFor="order-limit-price" className="text-xs text-muted-foreground">Limit price</label>
                  <input
                    id="order-limit-price"
                    type="number"
                    min={0}
                    step={0.01}
                    value={limitPrice}
                    onChange={(e) => setLimitPrice(e.target.value)}
                    className="w-full max-w-[180px] rounded-md border border-border bg-background px-3 py-2 text-sm outline-none"
                  />
                  <span className="text-xs text-muted-foreground">USD</span>
                </div>
              )}
              <div className="mt-1 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">≈ ${data.sizeUSD.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                <div className="flex gap-1">
                  {[10, 25, 50, 100].map(n => <button key={n} onClick={() => setQty(String(n))} className="rounded border border-border px-2 py-0.5 text-muted-foreground hover:text-foreground">{n}</button>)}
                </div>
              </div>
            </div>

            <div className="space-y-1.5 rounded-lg border border-border bg-muted/20 p-4 text-sm">
              <Row label="Execution price" value={`$${data.exec.toFixed(4)}`} />
              <Row label="Price impact" value={`${data.impact.toFixed(2)}%`} valueClass={high ? "text-destructive" : "text-primary"} />
              <Row label="Est. slippage" value={`${data.slippage.toFixed(2)}%`} />
              <Row label="Network fee" value={`$${data.fee.toFixed(2)}`} />
              <Row label="Restoration fee (0.5%)" value={`$${data.restorationFee.toFixed(2)}`} hint="Routed to community treasury" />
              <div className="my-2 h-px bg-border" />
              <Row label={side === "buy" ? "You pay" : "You receive"} value={`$${data.grand.toFixed(2)}`} bold />
            </div>

            {high && (
              <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>High price impact relative to current liquidity. Consider splitting the order.</span>
              </div>
            )}

            <button
              disabled={!wallet || quantity <= 0 || !limitPriceValid}
              onClick={() => setStep("confirm")}
              className={`w-full rounded-md px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${side === "buy" ? "bg-gradient-aurora text-background glow-emerald" : "bg-destructive text-destructive-foreground hover:bg-destructive/90"}`}
            >
              {!wallet ? "Connect a wallet to trade" : `Review ${side === "buy" ? "Buy" : "Sell"}`}
            </button>
            {!limitPriceValid && orderType === "limit" && (
              <div className="mt-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
                Limit orders require a price greater than zero.
              </div>
            )}
          </div>
        )}

        {step === "confirm" && (
          <div className="space-y-4">
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Confirm transaction</div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="font-mono text-2xl">{quantity} {asset.sym}</span>
                <span className="text-muted-foreground">@ ${data.exec.toFixed(2)}</span>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-secondary"><ShieldCheck className="h-3.5 w-3.5" /> Verified asset • Provenance on-chain</div>
            </div>
            <div className="space-y-1.5 rounded-lg border border-border bg-muted/20 p-4 text-sm">
              <Row label="Total" value={`$${data.grand.toFixed(2)}`} bold />
              <Row label="Settlement" value="Atomic — 1 block" />
              <Row label="Wallet" value={wallet ? `${wallet.provider}` : "—"} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setStep("ticket")} className="rounded-md border border-border px-4 py-2 text-sm hover:bg-muted/50">Back</button>
              <button onClick={sign} className="rounded-md bg-gradient-aurora px-4 py-2 text-sm font-semibold text-background glow-emerald">Sign & Submit</button>
            </div>
          </div>
        )}

        {step === "signing" && (
          <div className="space-y-4 py-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent/15">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
            </div>
            <div>
              <div className="text-lg font-semibold">Awaiting wallet signature</div>
              <div className="mt-1 text-sm text-muted-foreground">Approve the transaction in {wallet?.provider ?? "your wallet"} to broadcast to the network.</div>
            </div>
          </div>
        )}

        {step === "done" && liveOrder && (
          <div className="space-y-4 text-center">
            <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${liveOrder.status === "confirmed" ? "bg-primary/15" : liveOrder.status === "failed" ? "bg-destructive/15" : "bg-accent/15"}`}>
              {liveOrder.status === "confirmed" ? <CheckCircle2 className="h-8 w-8 text-primary" /> : liveOrder.status === "failed" ? <Info className="h-8 w-8 text-destructive" /> : <Loader2 className="h-8 w-8 animate-spin text-accent" />}
            </div>
            <div>
              <div className="text-lg font-semibold">
                {liveOrder.status === "pending" && "Transaction submitted"}
                {liveOrder.status === "confirmed" && "Order confirmed"}
                {liveOrder.status === "failed" && "Transaction failed"}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                {quantity} {asset.sym} {side === "buy" ? "purchased" : "sold"} at ${data.exec.toFixed(2)}
              </div>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-3 text-left text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">Tx hash</span>
                <a href={liveOrder.explorerUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 font-mono text-secondary hover:underline">
                  {shortHash(liveOrder.txHash)} <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <div className="mt-1 flex items-center justify-between"><span className="text-muted-foreground">Confirmations</span><span className="font-mono">{liveOrder.confirmations}/{liveOrder.requiredConfirmations}</span></div>
              <div className="mt-1 flex items-center justify-between"><span className="text-muted-foreground">Block</span><span className="font-mono">{liveOrder.block ? `#${liveOrder.block.toLocaleString()}` : "pending"}</span></div>
              <div className="mt-1 flex items-center justify-between"><span className="text-muted-foreground">Restoration impact</span><span className="text-primary">+{(quantity * 0.42).toFixed(2)} ha funded</span></div>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full transition-all ${liveOrder.status === "failed" ? "bg-destructive" : liveOrder.status === "confirmed" ? "bg-gradient-aurora" : "bg-accent"}`}
                  style={{ width: `${liveOrder.status === "failed" ? 100 : Math.min(100, (liveOrder.confirmations / liveOrder.requiredConfirmations) * 100)}%` }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { onOpenChange(false); setTimeout(() => onViewOrders?.(), 200); }}
                className="rounded-md border border-border px-4 py-2 text-sm hover:bg-muted/50"
              >
                View order history
              </button>
              <button onClick={() => onOpenChange(false)} className="rounded-md bg-gradient-aurora px-4 py-2 text-sm font-semibold text-background">Done</button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, value, hint, valueClass = "", bold }: { label: string; value: string; hint?: string; valueClass?: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}{hint && <span className="ml-1 text-[10px] text-muted-foreground/70">· {hint}</span>}</span>
      <span className={`font-mono ${bold ? "text-base font-semibold text-foreground" : ""} ${valueClass}`}>{value}</span>
    </div>
  );
}
