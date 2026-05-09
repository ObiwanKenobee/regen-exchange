import { createContext, useContext, useState, type ReactNode } from "react";

export type Wallet = {
  address: string;
  provider: "MetaMask" | "WalletConnect" | "Coinbase" | "Sanctum";
  balanceRGN: number;
  balanceUSD: number;
};

type Ctx = {
  wallet: Wallet | null;
  connecting: boolean;
  connect: (provider: Wallet["provider"]) => Promise<void>;
  disconnect: () => void;
};

const WalletCtx = createContext<Ctx | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [connecting, setConnecting] = useState(false);

  const connect = async (provider: Wallet["provider"]) => {
    setConnecting(true);
    await new Promise((r) => setTimeout(r, 800));
    const hex = "abcdef0123456789";
    const addr = "0x" + Array.from({ length: 40 }, () => hex[Math.floor(Math.random() * 16)]).join("");
    setWallet({
      provider,
      address: addr,
      balanceRGN: 12480.42,
      balanceUSD: 84210.18,
    });
    setConnecting(false);
  };

  const disconnect = () => setWallet(null);

  return <WalletCtx.Provider value={{ wallet, connecting, connect, disconnect }}>{children}</WalletCtx.Provider>;
}

export function useWallet() {
  const ctx = useContext(WalletCtx);
  if (!ctx) throw new Error("useWallet must be used inside <WalletProvider>");
  return ctx;
}

export function shortAddr(a: string) {
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}
