import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BookOpen, Map, Newspaper, Radio, Share2, TrendingUp, BarChart3, PieChart as PieChartIcon } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
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

  // Sample data for visualizations
  const restorationData = [
    { month: "Jan", carbon: 1200, water: 800, biodiversity: 600 },
    { month: "Feb", carbon: 1350, water: 950, biodiversity: 720 },
    { month: "Mar", carbon: 1180, water: 1100, biodiversity: 680 },
    { month: "Apr", carbon: 1420, water: 1200, biodiversity: 850 },
    { month: "May", carbon: 1680, water: 1350, biodiversity: 920 },
    { month: "Jun", carbon: 1520, water: 1280, biodiversity: 880 },
  ];

  const assetTypeData = [
    { name: "Carbon RIUs", value: 45, color: "#22c55e" },
    { name: "Water Restoration", value: 25, color: "#3b82f6" },
    { name: "Biodiversity", value: 20, color: "#8b5cf6" },
    { name: "Cultural Preservation", value: 10, color: "#f59e0b" },
  ];

  const verificationData = [
    { date: "2024-01", verified: 85, pending: 12, rejected: 3 },
    { date: "2024-02", verified: 92, pending: 8, rejected: 0 },
    { date: "2024-03", verified: 88, pending: 15, rejected: 2 },
    { date: "2024-04", verified: 95, pending: 6, rejected: 1 },
    { date: "2024-05", verified: 97, pending: 4, rejected: 0 },
  ];

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

      {/* New Data Visualization Section */}
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="panel p-6">
          <DashSectionHeader
            eyebrow="Analytics"
            title="Restoration Impact Trends"
            desc="Monthly ecological restoration metrics across asset types"
          />
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={restorationData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="carbon" stackId="1" stroke="#22c55e" fill="#22c55e" fillOpacity={0.6} />
                <Area type="monotone" dataKey="water" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                <Area type="monotone" dataKey="biodiversity" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel p-6">
          <DashSectionHeader
            eyebrow="Distribution"
            title="Asset Type Breakdown"
            desc="Current distribution of verified regenerative assets"
          />
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={assetTypeData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {assetTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-6 panel p-6">
        <DashSectionHeader
          eyebrow="Verification"
          title="Oracle Verification Pipeline"
          desc="Real-time status of ecological verification processes"
        />
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={verificationData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="verified" stackId="a" fill="#22c55e" name="Verified" />
              <Bar dataKey="pending" stackId="a" fill="#f59e0b" name="Pending Review" />
              <Bar dataKey="rejected" stackId="a" fill="#ef4444" name="Rejected" />
            </BarChart>
          </ResponsiveContainer>
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
