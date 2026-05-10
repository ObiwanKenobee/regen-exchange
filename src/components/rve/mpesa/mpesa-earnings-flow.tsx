import { ArrowRight, Brain, Coins, Smartphone, Sprout, TreeDeciduous } from "lucide-react";

const steps = [
  { icon: TreeDeciduous, label: "Verified action", sub: "Tree planted, cleanup, sensor fix" },
  { icon: Brain, label: "AI + oracle attestation", sub: "Confidence crosses mint threshold" },
  { icon: Coins, label: "RIUs minted to steward wallet", sub: "Abstract balance — no jargon in UI" },
  { icon: Sprout, label: "Convert to local payout", sub: "Treasury FX + compliance checks" },
  { icon: Smartphone, label: "M-Pesa B2C instantly", sub: "SMS receipt + ledger sealed" },
];

export function MpesaEarningsFlow() {
  return (
    <div className="panel overflow-x-auto p-5">
      <div className="text-xs uppercase tracking-[0.2em] text-primary">Highest priority rail</div>
      <h3 className="mt-2 text-lg font-semibold">Community steward earnings</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Turn restoration from volunteer work into real economic activity — instant, trusted, mobile-native.
      </p>
      <div className="mt-6 flex min-w-[640px] items-stretch gap-2 md:min-w-0 md:flex-wrap">
        {steps.map((s, i) => (
          <div key={s.label} className="flex min-w-[120px] flex-1 items-center gap-2">
            <div className="flex flex-1 flex-col items-center text-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-muted/30">
                <s.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="mt-2 text-xs font-medium leading-tight">{s.label}</div>
              <div className="mt-0.5 text-[10px] text-muted-foreground">{s.sub}</div>
            </div>
            {i < steps.length - 1 && (
              <ArrowRight className="hidden h-4 w-4 shrink-0 text-muted-foreground md:block" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
