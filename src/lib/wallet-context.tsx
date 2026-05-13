import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { getNotificationPrefs, playNotifySound } from "@/lib/notification-prefs";

export type Wallet = {
  address: string;
  provider: "MetaMask" | "WalletConnect" | "Coinbase" | "Sanctum";
  balanceRGN: number;
  balanceUSD: number;
};

export type OrderStatus = "pending" | "confirmed" | "failed";

export type Order = {
  id: string;
  txHash: string;
  assetSym: string;
  assetName: string;
  side: "buy" | "sell";
  qty: number;
  price: number;
  total: number;
  fee: number;
  restorationFee: number;
  status: OrderStatus;
  confirmations: number;
  requiredConfirmations: number;
  createdAt: number;
  block?: number;
  explorerUrl: string;
  walletProvider: Wallet["provider"] | "Sanctum";
};

type SubmitInput = Omit<
  Order,
  "id" | "txHash" | "status" | "confirmations" | "requiredConfirmations" | "createdAt" | "block" | "explorerUrl" | "walletProvider"
> & {
  id?: string;
  txHash?: string;
  createdAt?: number;
  requiredConfirmations?: number;
};

type Ctx = {
  wallet: Wallet | null;
  connecting: boolean;
  connect: (provider: Wallet["provider"]) => Promise<void>;
  disconnect: () => void;
  orders: Order[];
  pendingCount: number;
  submitOrder: (input: SubmitInput) => Order;
  refreshOrder: (id: string) => void;
  retryOrder: (id: string) => void;
  clearOrders: () => void;
  retryFailed: (ids?: string[]) => number;
  refreshPending: (ids?: string[]) => number;
  streamEnabled: boolean;
  setStreamEnabled: (v: boolean) => void;
  streamFilters: { asset: string; side: "all" | "buy" | "sell" };
  setStreamFilters: (f: { asset: string; side: "all" | "buy" | "sell" }) => void;
};

const WalletCtx = createContext<Ctx | null>(null);

const HEX = "abcdef0123456789";
const randHex = (n: number) => Array.from({ length: n }, () => HEX[Math.floor(Math.random() * 16)]).join("");
const explorerFor = (hash: string) => `https://etherscan.io/tx/${hash}`;
const STORAGE_KEY = "rve.orders.v1";

export function WalletProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [orders, setOrders] = useState<Order[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Order[]) : [];
    } catch {
      return [];
    }
  });
  const timersRef = useRef<Map<string, ReturnType<typeof setInterval>>>(new Map());

  // persist
  useEffect(() => {
    if (typeof window === "undefined") return;
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(orders)); } catch {}
  }, [orders]);

  // resume any orders that were pending across reload
  useEffect(() => {
    orders.forEach((o) => {
      if (o.status === "pending" && !timersRef.current.has(o.id)) {
        startTickingOrder(o.id);
      }
    });
    return () => {
      timersRef.current.forEach((t) => clearInterval(t));
      timersRef.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateOrder = (id: string, patch: Partial<Order>) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } : o)));
  };

  const startTickingOrder = (id: string) => {
    if (timersRef.current.has(id)) return;
    const tick = () => {
      setOrders((prev) => {
        const o = prev.find((x) => x.id === id);
        if (!o || o.status !== "pending") {
          const t = timersRef.current.get(id);
          if (t) { clearInterval(t); timersRef.current.delete(id); }
          return prev;
        }
        const nextConf = o.confirmations + 1;
        if (nextConf >= o.requiredConfirmations) {
          const t = timersRef.current.get(id);
          if (t) { clearInterval(t); timersRef.current.delete(id); }
          // 95% confirm, 5% fail
          const failed = Math.random() < 0.05;
          const block = 18_402_000 + Math.floor(Math.random() * 999);
          // fire toast outside setState
          setTimeout(() => {
            const prefs = getNotificationPrefs();
            if (!prefs.orders) return;
            if (failed) {
              toast.error(`Order failed — ${o.side.toUpperCase()} ${o.qty} ${o.assetSym}`, {
                description: "Transaction reverted. Tap Retry on the order to resubmit.",
              });
              if (prefs.sound) playNotifySound("error");
            } else {
              toast.success(`Order confirmed — ${o.side.toUpperCase()} ${o.qty} ${o.assetSym}`, {
                description: `Filled @ $${o.price.toFixed(2)} • Block #${block.toLocaleString()}`,
              });
              if (prefs.sound) playNotifySound("success");
            }
          }, 0);
          return prev.map((x) =>
            x.id === id
              ? {
                  ...x,
                  confirmations: nextConf,
                  status: failed ? "failed" : "confirmed",
                  block,
                }
              : x,
          );
        }
        return prev.map((x) => (x.id === id ? { ...x, confirmations: nextConf } : x));
      });
    };
    const t = setInterval(tick, 1500);
    timersRef.current.set(id, t);
  };

  const connect = async (provider: Wallet["provider"]) => {
    setConnecting(true);
    await new Promise((r) => setTimeout(r, 800));
    const addr = "0x" + randHex(40);
    setWallet({
      provider,
      address: addr,
      balanceRGN: 12480.42,
      balanceUSD: 84210.18,
    });
    setConnecting(false);
  };

  const disconnect = () => setWallet(null);

  const submitOrder = (input: SubmitInput): Order => {
    const id = input.id ?? `ord-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
    const txHash = input.txHash ?? "0x" + randHex(64);
    const createdAt = input.createdAt ?? Date.now();
    const requiredConfirmations = input.requiredConfirmations ?? 3;
    const order: Order = {
      ...input,
      id,
      txHash,
      status: "pending",
      confirmations: 0,
      requiredConfirmations,
      createdAt,
      explorerUrl: explorerFor(txHash),
      walletProvider: wallet?.provider ?? "Sanctum",
    };
    setOrders((prev) => [order, ...prev]);
    // start ticking next frame so state is set
    setTimeout(() => startTickingOrder(id), 50);
    return order;
  };

  const refreshOrder = (id: string) => {
    setOrders((prev) => {
      const o = prev.find((x) => x.id === id);
      if (!o) return prev;
      // refresh re-checks: if pending and stalled, force a confirmation tick
      if (o.status === "pending") {
        return prev.map((x) =>
          x.id === id ? { ...x, confirmations: Math.min(x.confirmations + 1, x.requiredConfirmations) } : x,
        );
      }
      return prev;
    });
  };

  const retryOrder = (id: string) => {
    let started = false;
    setOrders((prev) => {
      const o = prev.find((x) => x.id === id);
      if (!o || o.status !== "failed") return prev;
      const newHash = "0x" + randHex(64);
      started = true;
      return prev.map((x) =>
        x.id === id
          ? {
              ...x,
              status: "pending",
              confirmations: 0,
              block: undefined,
              txHash: newHash,
              explorerUrl: explorerFor(newHash),
              createdAt: Date.now(),
            }
          : x,
      );
    });
    if (started) {
      toast(`Retrying order…`, { description: "New transaction submitted." });
      setTimeout(() => startTickingOrder(id), 50);
    }
  };

  const clearOrders = () => setOrders((prev) => prev.filter((o) => o.status === "pending"));

  const pendingCount = orders.filter((o) => o.status === "pending").length;

  const retryFailed = (ids?: string[]) => {
    const targets = orders.filter((o) => o.status === "failed" && (!ids || ids.includes(o.id)));
    targets.forEach((o) => retryOrder(o.id));
    if (targets.length) toast(`Retrying ${targets.length} failed order${targets.length === 1 ? "" : "s"}`);
    return targets.length;
  };
  const refreshPending = (ids?: string[]) => {
    const targets = orders.filter((o) => o.status === "pending" && (!ids || ids.includes(o.id)));
    targets.forEach((o) => refreshOrder(o.id));
    return targets.length;
  };

  // Synthetic stream simulator for demo mode
  const [streamEnabled, setStreamEnabled] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("rve.orders.stream") === "1";
  });
  const [streamFilters, setStreamFilters] = useState<{ asset: string; side: "all" | "buy" | "sell" }>({ asset: "All", side: "all" });
  const streamFiltersRef = useRef(streamFilters);
  useEffect(() => { streamFiltersRef.current = streamFilters; }, [streamFilters]);
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("rve.orders.stream", streamEnabled ? "1" : "0");
    }
  }, [streamEnabled]);
  useEffect(() => {
    if (!streamEnabled) return;
    const SYM_POOL = [
      { sym: "AMZ-CO₂", name: "Amazon Carbon Reserve", price: 84.2 },
      { sym: "OCN-REG", name: "Ocean Regeneration Bond", price: 142.65 },
      { sym: "BIO-IDX", name: "Biodiversity Index Unit", price: 56.1 },
      { sym: "H₂O-SEC", name: "Water Security Asset", price: 98.7 },
      { sym: "IND-STW", name: "Indigenous Stewardship", price: 211.3 },
      { sym: "SOL-INF", name: "Solar Infrastructure", price: 47.85 },
    ];
    const t = setInterval(() => {
      const sf = streamFiltersRef.current;
      const pool = sf.asset === "All" ? SYM_POOL : SYM_POOL.filter((s) => s.sym === sf.asset);
      const a = (pool.length ? pool : SYM_POOL)[Math.floor(Math.random() * (pool.length || SYM_POOL.length))];
      const qty = 1 + Math.floor(Math.random() * 25);
      const side: "buy" | "sell" = sf.side !== "all" ? sf.side : (Math.random() < 0.55 ? "buy" : "sell");
      const total = qty * a.price;
      const id = `ord-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
      const txHash = "0x" + randHex(64);
      const order: Order = {
        id, txHash, assetSym: a.sym, assetName: a.name, side, qty,
        price: a.price, total, fee: total * 0.001, restorationFee: total * 0.005,
        status: "pending", confirmations: 0, requiredConfirmations: 3,
        createdAt: Date.now(), explorerUrl: explorerFor(txHash),
        walletProvider: "Sanctum",
      };
      setOrders((prev) => [order, ...prev].slice(0, 5000));
      setTimeout(() => startTickingOrder(id), 50);
    }, 6000);
    return () => clearInterval(t);
  }, [streamEnabled]);

  return (
    <WalletCtx.Provider
      value={{ wallet, connecting, connect, disconnect, orders, pendingCount, submitOrder, refreshOrder, retryOrder, clearOrders, retryFailed, refreshPending, streamEnabled, setStreamEnabled, streamFilters, setStreamFilters }}
    >
      {children}
    </WalletCtx.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletCtx);
  if (!ctx) throw new Error("useWallet must be used inside <WalletProvider>");
  return ctx;
}

export function shortAddr(a: string) {
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

export function shortHash(h: string) {
  return `${h.slice(0, 10)}…${h.slice(-6)}`;
}
