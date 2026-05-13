import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, ClipboardList, Globe2, Sparkles } from "lucide-react";

export const Route = createFileRoute("/research-hub")({
  head: () => ({
    meta: [
      { title: "Research Hub | Atlas Sanctum" },
      { name: "description", content: "Collaborative research, intelligence reports, and data insights for regenerative governance." },
    ],
  }),
  component: ResearchHubPage,
});

const cards = [
  { title: "Active studies", value: "14", icon: BookOpen, note: "Carbon, biodiversity, water, and resilience research." },
  { title: "Data assets", value: "68", icon: Globe2, note: "Satellite, sensor, and community-sourced datasets." },
  { title: "Insights generated", value: "82", icon: Sparkles, note: "AI-assisted intelligence reports in the last 30 days." },
  { title: "Collaborators", value: "128", icon: ClipboardList, note: "Researchers, analysts, and civic partners engaged." },
];

function ResearchHubPage() {
  return (
    <div className="min-h-screen bg-background px-6 py-10 text-foreground">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-primary">Research Hub</p>
            <h1 className="text-4xl font-semibold">Intelligence, insights, and collaboration</h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Support community research, publish investigative reports, and surface data-driven ecosystem metrics for the Atlas platform.
            </p>
          </div>
          <Link
            to="/"
            className="rounded-full border border-border px-4 py-2 text-sm text-muted-foreground transition hover:border-primary hover:text-foreground"
          >
            Back to dashboard
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.title} className="rounded-3xl border border-border/70 bg-muted/50 p-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="grid h-12 w-12 place-items-center rounded-3xl bg-background text-primary shadow-sm">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">{card.title}</p>
                    <p className="mt-2 text-3xl font-semibold">{card.value}</p>
                  </div>
                </div>
                <p className="mt-5 text-sm text-muted-foreground">{card.note}</p>
              </div>
            );
          })}
        </div>

        <section className="rounded-3xl border border-border/70 bg-muted/50 p-6 shadow-sm">
          <div className="border-b border-border/60 pb-4">
            <h2 className="text-xl font-semibold">Research spotlight</h2>
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <article className="rounded-3xl bg-background/90 p-6">
              <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Featured report</p>
              <h3 className="mt-3 text-2xl font-semibold">Regenerative land use performance index</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                A cross-sector analysis of carbon drawdown, agroecological resilience, and water security for community stewardship planning.
              </p>
            </article>
            <article className="rounded-3xl bg-background/90 p-6">
              <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Community signal</p>
              <h3 className="mt-3 text-2xl font-semibold">AI verification heatmap</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Intelligence teams can spot emerging trends in validation confidence, sensor anomaly rates, and oracle consensus.<br />
                Share your dataset or start a new research initiative.
              </p>
            </article>
          </div>
        </section>
      </div>
    </div>
  );
}
