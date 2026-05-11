import { createFileRoute } from "@tanstack/react-router";
import {
  Award,
  Camera,
  Flame,
  MapPinned,
  MessageCircle,
  Smartphone,
  Trophy,
  Wallet,
  Sprout,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import {
  DashboardShell,
  DashSectionHeader,
  MetricTile,
} from "@/components/rve/dashboard-shell";
import { MpesaB2cPanel } from "@/components/rve/mpesa/mpesa-b2c-panel";
import { MpesaEarningsFlow } from "@/components/rve/mpesa/mpesa-earnings-flow";
import { MpesaRailOverview } from "@/components/rve/mpesa/mpesa-rail-overview";
import { MpesaStkPanel } from "@/components/rve/mpesa/mpesa-stk-panel";

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "Community Steward Dashboard | RVE" },
      {
        name: "description",
        content:
          "Earn RIUs from verified actions — geo-tagged evidence, M-Pesa rails, microgrants, and gamified stewardship.",
      },
    ],
  }),
  component: CommunityPage,
});

function CommunityPage() {
  // Sample data for progress tracking
  const weeklyEarnings = [
    { day: "Mon", earnings: 45 },
    { day: "Tue", earnings: 62 },
    { day: "Wed", earnings: 38 },
    { day: "Thu", earnings: 71 },
    { day: "Fri", earnings: 55 },
    { day: "Sat", earnings: 89 },
    { day: "Sun", earnings: 42 },
  ];

  const missionProgress = [
    { name: "Riparian planting", completed: 85, total: 100 },
    { name: "Waste sorting", completed: 60, total: 80 },
    { name: "Climate stories", completed: 3, total: 5 },
  ];

  return (
    <DashboardShell
      eyebrow="Mobile-first"
      title="Community Steward Dashboard"
      description="Built for restoration workers, youth climate crews, farmers, and NGOs — lightweight, offline-friendly paths, Swahili + English copy hooks, and SMS fallbacks."
    >
      <div className="mb-6 flex flex-wrap gap-2 rounded-lg border border-border/60 bg-muted/20 p-3 text-xs text-muted-foreground md:hidden">
        <Smartphone className="h-4 w-4 text-primary" />
        Optimized narrow view — this route prioritizes thumb reach and low-bandwidth panels.
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricTile label="Your RIU balance" value="1,284" sub="Verified this season" trend="+120" icon={Wallet} />
        <MetricTile label="Restoration streak" value="14 days" sub="Photo + GPS attested" trend="🔥" icon={Flame} />
        <MetricTile label="Clan rank" value="Silver" sub="Mukuru restoration collective" trend="↑" icon={Trophy} />
        <MetricTile label="Microgrants unlocked" value="KES 42k" sub="M-Pesa disbursement ready" trend="pending" icon={Sprout} />
      </div>

      {/* Progress Tracking Section */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="panel p-6">
          <DashSectionHeader
            eyebrow="This week"
            title="RIU Earnings Progress"
            desc="Your verified restoration earnings over the past 7 days"
          />
          <div className="mt-4 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyEarnings}>
                <XAxis dataKey="day" />
                <YAxis />
                <Bar dataKey="earnings" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel p-6">
          <DashSectionHeader
            eyebrow="Active missions"
            title="Mission Progress"
            desc="Track your completion status for current restoration tasks"
          />
          <div className="mt-4 space-y-4">
            {missionProgress.map((mission) => (
              <div key={mission.name}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{mission.name}</span>
                  <span className="text-muted-foreground">
                    {mission.completed}/{mission.total}
                  </span>
                </div>
                <Progress
                  value={(mission.completed / mission.total) * 100}
                  className="mt-2"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-10 space-y-6">
        <MpesaEarningsFlow />
        <DashSectionHeader
          eyebrow="Ecological gig economy"
          title="M-Pesa use cases on this rail"
          desc="River cleanup, waste incentives, urban farming, biodiversity gigs, climate surveys, sensor maintenance — all settle to the same verified treasury + B2C spine."
        />
        <MpesaRailOverview />
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-5">
          <DashSectionHeader
            eyebrow="Earn & prove"
            title="Verified field actions"
            desc="Upload restoration evidence with geo-tags — compressed media and queued sync when offline."
          />
          <div className="panel p-5">
            <Button className="w-full bg-gradient-aurora text-primary-foreground glow-emerald">
              <Camera className="mr-2 h-4 w-4" />
              Submit evidence
            </Button>
            <Button variant="outline" className="mt-3 w-full border-primary/40">
              <MapPinned className="mr-2 h-4 w-4" />
              Geo-tagged impact
            </Button>
            <p className="mt-4 text-center text-[10px] text-muted-foreground">
              Daraja STK / B2C • SMS receipts • offline-first mobile client (Flutter) path
            </p>
          </div>
          <MpesaB2cPanel
            title="Claim verified earnings → M-Pesa"
            description="After AI + oracle attestation, treasury converts RIUs and disburses via B2C (demo without Daraja secrets)."
            defaultOccasion="Steward payout"
            purpose="steward_earnings"
          />
        </div>
        <div className="space-y-6 lg:col-span-7">
          <MpesaStkPanel
            title="Climate cashback (STK test)"
            description="When sustainable behavior is verified, users can receive promotional top-ups — same STK rail as marketplace on-ramp."
            defaultAmount={200}
            purpose="climate_cashback"
            accountReference="RVE-CASHBK"
          />
          <DashSectionHeader
            eyebrow="Tasks & grants"
            title="Restoration missions"
            desc="Seasonal missions, leaderboards, and clan competitions tied to on-the-ground outcomes."
          />
          <div className="space-y-3">
            {[
              {
                t: "Riparian planting — Nairobi North",
                reward: "+85 RIU",
                due: "3d",
              },
              { t: "Waste sorting audit — informal market", reward: "+40 RIU", due: "5d" },
              { t: "Youth climate story — community radio", reward: "Badge + 20 RIU", due: "open" },
            ].map((m) => (
              <div
                key={m.t}
                className="panel flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="font-medium">{m.t}</div>
                  <div className="text-xs text-muted-foreground">Due: {m.due}</div>
                </div>
                <div className="font-mono text-sm text-primary">{m.reward}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        <div className="panel p-5">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Users className="h-4 w-4 text-secondary" />
            Community leaderboard
          </div>
          <ol className="mt-4 space-y-2 text-sm">
            {["Green Youth Nairobi", "Kibera Watershed Crew", "Athi Farmers Coop"].map((n, i) => (
              <li key={n} className="flex justify-between border-b border-border/40 pb-2 last:border-0">
                <span className="text-muted-foreground">
                  {i + 1}. {n}
                </span>
                <span className="font-mono text-xs text-primary">{1200 - i * 140} pts</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="panel p-5">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Award className="h-4 w-4 text-accent" />
            Impact badges
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {["River Guardian", "Canopy Builder", "Circular Waste", "Storyteller"].map((b) => (
              <span
                key={b}
                className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs text-muted-foreground"
              >
                {b}
              </span>
            ))}
          </div>
        </div>
        <div className="panel p-5">
          <div className="flex items-center gap-2 text-sm font-medium">
            <MessageCircle className="h-4 w-4 text-primary" />
            AI guidance assistant
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Lightweight on-device prompts for planting windows, species mix, and safety — full LLM path optional when bandwidth allows.
          </p>
          <Button variant="secondary" className="mt-4 w-full text-xs">
            Open steward copilot
          </Button>
        </div>
      </div>
    </DashboardShell>
  );
}
