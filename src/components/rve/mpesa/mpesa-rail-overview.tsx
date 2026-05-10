import { MPESA_USE_CASES } from "@/lib/mpesa/types";

export function MpesaRailOverview() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {MPESA_USE_CASES.map((u) => (
        <div
          key={u.title}
          className="rounded-lg border border-border/60 bg-background/40 px-4 py-3 text-sm backdrop-blur"
        >
          <div className="text-[10px] uppercase tracking-wider text-secondary">{u.layer}</div>
          <div className="mt-1 font-medium leading-snug">{u.title}</div>
        </div>
      ))}
    </div>
  );
}
