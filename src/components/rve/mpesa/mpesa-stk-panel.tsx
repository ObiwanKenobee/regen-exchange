import { useServerFn } from "@tanstack/react-start";
import { Loader2, Smartphone } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { initiateMpesaStkPush, queryMpesaStkStatus } from "@/lib/mpesa/mpesa.functions";
import type { MpesaRailPurpose } from "@/lib/mpesa/types";
import { formatMsisdnDisplay, normalizeKenyaMsisdn } from "@/lib/mpesa/phone";

type Props = {
  title: string;
  description: string;
  defaultAmount?: number;
  purpose: MpesaRailPurpose;
  accountReference: string;
};

export function MpesaStkPanel({
  title,
  description,
  defaultAmount = 500,
  purpose,
  accountReference,
}: Props) {
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState(String(defaultAmount));
  const [checkoutId, setCheckoutId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const doStk = useServerFn(initiateMpesaStkPush);
  const doQuery = useServerFn(queryMpesaStkStatus);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const normalized = normalizeKenyaMsisdn(phone.trim());
    if (!normalized) {
      toast.error("Enter a valid Kenya number (e.g. 0712 345 678)");
      return;
    }
    const n = Number(amount);
    if (!Number.isFinite(n) || n < 1) {
      toast.error("Amount must be at least KES 1");
      return;
    }

    setBusy(true);
    try {
      const res = await doStk({
        data: {
          phone: normalized,
          amount: Math.floor(n),
          accountReference: accountReference.slice(0, 12),
          purpose,
        },
      });
      if (!res.ok) {
        toast.error(res.error ?? "STK Push failed");
        return;
      }
      if (res.demo) {
        toast.message("Demo STK", {
          description: res.customerMessage,
        });
      } else {
        toast.success(res.customerMessage ?? "Check your phone to complete M-Pesa payment");
      }
      if (res.checkoutRequestId) setCheckoutId(res.checkoutRequestId);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Request failed");
    } finally {
      setBusy(false);
    }
  }

  async function onPollStatus() {
    if (!checkoutId) return;
    setBusy(true);
    try {
      const res = await doQuery({ data: { checkoutRequestId: checkoutId } });
      if (res.demo) {
        toast.message("Demo status", { description: res.resultDesc });
      } else if (res.ok) {
        toast.success(res.resultDesc ?? "Payment completed");
      } else {
        toast.error(res.error ?? res.resultDesc ?? "Not completed yet");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Query failed");
    } finally {
      setBusy(false);
    }
  }

  const preview = normalizeKenyaMsisdn(phone.trim());

  return (
    <div className="panel p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-aurora text-background">
          <Smartphone className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="mpesa-phone">M-Pesa phone</Label>
          <Input
            id="mpesa-phone"
            inputMode="tel"
            autoComplete="tel"
            placeholder="0712 345 678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          {preview && (
            <p className="text-[10px] text-muted-foreground">
              Sends STK to {formatMsisdnDisplay(preview)} (254…)
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="mpesa-amt">Amount (KES)</Label>
          <Input
            id="mpesa-amt"
            inputMode="numeric"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={busy} className="w-full bg-gradient-aurora text-primary-foreground">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send STK Push"}
        </Button>
      </form>

      {checkoutId && (
        <div className="mt-4 rounded-md border border-border/60 bg-muted/20 p-3 text-xs">
          <div className="font-mono text-[10px] text-muted-foreground break-all">
            CheckoutRequestID: {checkoutId}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2 w-full"
            disabled={busy}
            onClick={onPollStatus}
          >
            Poll payment status
          </Button>
          <p className="mt-2 text-[10px] text-muted-foreground">
            Production: rely on your callback URL + treasury idempotency; polling is a fallback UX.
          </p>
        </div>
      )}
    </div>
  );
}
