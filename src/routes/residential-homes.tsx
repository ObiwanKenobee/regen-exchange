import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/rve/dashboard-shell";
import { ResidentialHomesPanel } from "@/components/rve/residential-homes";

export const Route = createFileRoute("/residential-homes")({
  head: () => ({
    meta: [
      { title: "Residential Homes | RVE" },
      {
        name: "description",
        content:
          "Transform apartments and estates into regenerative residential intelligence nodes with energy, water, waste, resilience and RIU economics.",
      },
    ],
  }),
  component: ResidentialHomesPage,
});

function ResidentialHomesPage() {
  return (
    <DashboardShell
      eyebrow="RVE homes"
      title="Residential Home Intelligence"
      description="Turn every residence into a regenerative ecological node, climate-resilient living space, and RIU-earning community asset."
    >
      <ResidentialHomesPanel />
    </DashboardShell>
  );
}
