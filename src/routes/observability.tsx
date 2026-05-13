import { createFileRoute, Link } from "@tanstack/react-router";
import { BarChart3, Cpu, Eye, Satellite } from "lucide-react";

export const Route = createFileRoute("/observability")({
  head: () => ({
    meta: [
      { title: "Observability | Atlas Sanctum" },
      { name: "description", content: "Platform observability, telemetry, and service health for the Atlas Sanctum ecosystem." },
    ],
  }),
  component: ObservabilityPage,
});

const metrics = [
  { label: "API latency", value: "120ms", trend: "+8%", icon: Cpu },
  { label: "Verification uptime", value: "99.93%", trend: "+0.6%", icon: Satellite },
  { label: "Event processing", value: "3,420 / min", trend: "+12%", icon: BarChart3 },
  { label: "Alert rate", value: "2 active", trend: "-18%", icon: Eye },
];

function ObservabilityPage() {
  return (
    <div className="min-h-screen bg-background px-6 py-10 text-foreground">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-primary">Observability</p>
            <h1 className="text-4xl font-semibold">Atlas Sanctum monitoring</h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Service health, telemetry, and incident awareness for infrastructure, oracle pipelines, and treasury throughput.
            </p>
          </div>
          <Link
            to="/"
            className="rounded-full border border-border px-4 py-2 text-sm text-muted-foreground transition hover:border-primary hover:text-foreground"
          >
            Back to dashboard
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div key={metric.label} className="rounded-3xl border border-border/70 bg-muted/50 p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">{metric.label}</p>
                    <p className="mt-3 text-3xl font-semibold">{metric.value}</p>
                  </div>
                  <div className="grid h-12 w-12 place-items-center rounded-3xl bg-background text-primary shadow-sm">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <p className="mt-4 text-sm text-success">{metric.trend}</p>
              </div>
            );
          })}
        </div>

        <section className="rounded-3xl border border-border/70 bg-muted/50 p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4 border-b border-border/60 pb-4">
            <div>
              <h2 className="text-xl font-semibold">Incident stream</h2>
              <p className="text-sm text-muted-foreground">Recent alerts from the verification pipeline and treasury integrations.</p>
            </div>
            <span className="rounded-full bg-background px-3 py-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">Live</span>
          </div>
          <div className="mt-6 space-y-3 text-sm text-foreground">
            <div className="rounded-3xl bg-background/70 p-4">
              <p className="font-medium">Oracle validator queue latency</p>
              <p className="mt-1 text-muted-foreground">Warning: average processing time has risen above 400ms for the last 6 minutes.</p>
            </div>
            <div className="rounded-3xl bg-background/70 p-4">
              <p className="font-medium">Treasury payout confirmations</p>
              <p className="mt-1 text-muted-foreground">4 payouts pending from MPESA callback delivery window.</p>
            </div>
            <div className="rounded-3xl bg-background/70 p-4">
              <p className="font-medium">Platform health checks</p>
              <p className="mt-1 text-muted-foreground">All checks are green. No service degradation detected.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
