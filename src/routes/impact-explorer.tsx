import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BookOpen, Map, Newspaper, Radio, Share2 } from "lucide-react";
import { AssetDetailDrawer } from "@/components/rve/asset-detail-drawer";
import {
  DashboardShell,
  DashSectionHeader,
} from "@/components/rve/dashboard-shell";
import { PlanetaryMap } from "@/components/rve/planetary-map";
import { ASSETS, type Asset } from "@/components/rve/types";

export const Route = createFileRoute("/impact-explorer")({
  head: () => ({
    meta: [
      { title: "Impact Explorer | RVE" },
      {
        name: "description",
        content:
          "Public transparency portal — restoration maps, open datasets, stories, and live feeds for media and researchers.",
      },
    ],
  }),
  component: ImpactExplorerPage,
});

function ImpactExplorerPage() {
  const [asset, setAsset] = useState<Asset | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <DashboardShell
      eyebrow="Public trust"
      title="Impact Explorer Dashboard"
      description="People trust what they can see — open ecological datasets, timelines, and community stories without wallet friction."
    >
      <div className="grid gap-4 md:grid-cols-3">
        <div className="panel flex gap-3 p-4">
          <Map className="h-10 w-10 shrink-0 text-primary" />
          <div>
            <div className="font-medium">Interactive restoration maps</div>
            <div className="text-xs text-muted-foreground">
              Embeddable widgets for newsrooms — CC-BY attribution.
            </div>
          </div>
        </div>
        <div className="panel flex gap-3 p-4">
          <BookOpen className="h-10 w-10 shrink-0 text-secondary" />
          <div>
            <div className="font-medium">Open ecological datasets</div>
            <div className="text-xs text-muted-foreground">
              Parquet + STAC catalogs mirrored to researcher endpoints.
            </div>
          </div>
        </div>
        <div className="panel flex gap-3 p-4">
          <Newspaper className="h-10 w-10 shrink-0 text-accent" />
          <div>
            <div className="font-medium">Storytelling engine</div>
            <div className="text-xs text-muted-foreground">
              Auto-narratives from verification timelines + human edits.
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <DashSectionHeader
            eyebrow="Explore"
            title="Living planet — public view"
            desc="Tap hotspots for plain-language impact cards suitable for citizens and classrooms."
          />
          <PlanetaryMap
            assets={ASSETS}
            onSelect={(a) => {
              setAsset(a);
              setOpen(true);
            }}
          />
        </div>
        <div className="space-y-4 lg:col-span-4">
          <div className="panel p-5">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Radio className="h-4 w-4 text-primary" />
              Live restoration feeds
            </div>
            <ul className="mt-4 space-y-3 text-xs text-muted-foreground">
              {[
                "Sahel: grassland green-up ahead of seasonal mean",
                "Pacific: reef bleach watch downgraded one band",
                "Nairobi: community riparian fence completion verified",
              ].map((t) => (
                <li key={t} className="border-b border-border/40 pb-2 last:border-0">
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="panel p-5">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Share2 className="h-4 w-4 text-secondary" />
              Community success stories
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Short films, photo essays, and audio from stewards — surfaced when verification confidence crosses thresholds.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-10 panel p-6">
        <DashSectionHeader
          eyebrow="Timelines"
          title="Impact history"
          desc="Every public asset exposes a non-technical timeline — milestones, satellite passes, and treasury events."
        />
        <div className="mt-4 flex flex-wrap gap-2">
          {["2019 baseline", "2021 corridor", "2023 flood recovery", "2025 RIU issuance"].map((x) => (
            <span
              key={x}
              className="rounded-full border border-border bg-muted/30 px-3 py-1 text-xs text-muted-foreground"
            >
              {x}
            </span>
          ))}
        </div>
      </div>

      <AssetDetailDrawer
        asset={asset}
        open={open}
        onOpenChange={setOpen}
        onTrade={() => setOpen(false)}
      />
    </DashboardShell>
  );
}
