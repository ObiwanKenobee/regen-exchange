import { useServerFn } from "@tanstack/react-start";
import { Banknote, Loader2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestMpesaB2cPayout } from "@/lib/mpesa/mpesa.functions";
import type { MpesaRailPurpose } from "@/lib/mpesa/types";
import { normalizeKenyaMsisdn } from "@/lib/mpesa/phone";

type Props = {
  title: string;
  description: string;
  defaultOccasion: string;
  purpose: MpesaRailPurpose;
};

export function MpesaB2cPanel({ title, description, defaultOccasion, purpose }: Props) {
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("500");
  const [remarks, setRemarks] = useState(defaultOccasion);
  const [busy, setBusy] = useState(false);

  const doPayout = useServerFn(requestMpesaB2cPayout);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const normalized = normalizeKenyaMsisdn(phone.trim());
    if (!normalized) {
      toast.error("Enter a valid Kenya number");
      return;
    }
    const n = Number(amount);
    if (!Number.isFinite(n) || n < 1) {
      toast.error("Invalid amount");
      return;
    }

    setBusy(true);
    try {
      const res = await doPayout({
        data: {
          phone: normalized,
          amount: Math.floor(n),
          remarks: remarks.slice(0, 100),
          occasion: defaultOccasion.slice(0, 100),
          purpose,
        },
      });
      if (res.demo) {
        toast.message("Demo B2C", { description: res.responseDescription });
      } else if (res.ok) {
        toast.success(res.responseDescription ?? "Payout initiated");
      } else {
        toast.error(res.error ?? "B2C failed");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Request failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="panel p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-primary/40 bg-primary/10 text-primary">
          <Banknote className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="b2c-phone">Recipient M-Pesa</Label>
          <Input
            id="b2c-phone"
            inputMode="tel"
            placeholder="07XX XXX XXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="b2c-amt">Amount (KES)</Label>
          <Input
            id="b2c-amt"
            inputMode="numeric"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="b2c-remarks">Remarks (treasury memo)</Label>
          <Input
            id="b2c-remarks"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            maxLength={100}
          />
        </div>
        <Button type="submit" disabled={busy} variant="secondary" className="w-full">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send B2C payout"}
        </Button>
      </form>
    </div>
  );
}
