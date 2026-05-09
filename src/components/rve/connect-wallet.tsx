import { useState } from "react";
import { Wallet as WalletIcon, Copy, LogOut, Check, Shield } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useWallet, shortAddr, type Wallet } from "@/lib/wallet-context";

const PROVIDERS: { id: Wallet["provider"]; desc: string }[] = [
  { id: "Sanctum", desc: "Native Atlas Sanctum wallet — recommended" },
  { id: "MetaMask", desc: "Connect via browser extension" },
  { id: "WalletConnect", desc: "Mobile & hardware wallets" },
  { id: "Coinbase", desc: "Coinbase Wallet" },
];

export function ConnectWalletButton() {
  const { wallet, connecting, connect, disconnect } = useWallet();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyAddr = async () => {
    if (!wallet) return;
    await navigator.clipboard.writeText(wallet.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (wallet) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button className="flex items-center gap-2 rounded-md border border-primary/40 bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/20">
            <span className="h-2 w-2 rounded-full bg-primary ticker-pulse" />
            <span className="font-mono">{shortAddr(wallet.address)}</span>
          </button>
        </DialogTrigger>
        <DialogContent className="border-border bg-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><WalletIcon className="h-4 w-4 text-primary" /> {wallet.provider} Wallet</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-muted/40 p-4">
              <div className="text-xs text-muted-foreground">Address</div>
              <div className="mt-1 flex items-center justify-between gap-2">
                <span className="break-all font-mono text-sm">{wallet.address}</span>
                <button onClick={copyAddr} className="shrink-0 rounded-md border border-border p-1.5 hover:bg-muted">
                  {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border bg-muted/40 p-4">
                <div className="text-xs text-muted-foreground">RGN Balance</div>
                <div className="font-mono text-2xl">{wallet.balanceRGN.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
              </div>
              <div className="rounded-lg border border-border bg-muted/40 p-4">
                <div className="text-xs text-muted-foreground">USD Value</div>
                <div className="font-mono text-2xl">${wallet.balanceUSD.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-md border border-secondary/30 bg-secondary/5 px-3 py-2 text-xs text-secondary">
              <Shield className="h-3.5 w-3.5" /> Connected to Mainnet • RVE v4.2
            </div>
            <button
              onClick={() => { disconnect(); setOpen(false); }}
              className="flex w-full items-center justify-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/20"
            >
              <LogOut className="h-4 w-4" /> Disconnect
            </button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="rounded-md bg-gradient-aurora px-4 py-1.5 text-sm font-semibold text-background glow-emerald hover:opacity-90">
          Connect Wallet
        </button>
      </DialogTrigger>
      <DialogContent className="border-border bg-card sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect a wallet</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">Sign in to trade regenerative assets, vote on governance, and view your on-chain impact.</p>
        <div className="space-y-2">
          {PROVIDERS.map((p) => (
            <button
              key={p.id}
              disabled={connecting}
              onClick={async () => { await connect(p.id); setOpen(false); }}
              className="flex w-full items-center justify-between rounded-lg border border-border bg-muted/30 p-4 text-left transition hover:border-primary/40 hover:bg-primary/5 disabled:opacity-50"
            >
              <div>
                <div className="font-medium">{p.id}</div>
                <div className="text-xs text-muted-foreground">{p.desc}</div>
              </div>
              {p.id === "Sanctum" && <span className="rounded-full bg-gradient-aurora px-2 py-0.5 text-[10px] font-semibold text-background">Recommended</span>}
            </button>
          ))}
        </div>
        {connecting && <div className="text-center text-xs text-muted-foreground">Establishing secure session…</div>}
      </DialogContent>
    </Dialog>
  );
}
