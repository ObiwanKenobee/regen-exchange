import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import livingPlanet from "@/assets/living-planet.jpg";
import {
  Activity, ArrowUpRight, BarChart3, Brain, CheckCircle2,
  Database, Eye, FileCheck, Globe2, Leaf, LineChart, Network, Radio,
  Satellite, Shield, Sparkles, TrendingUp, Users, Cpu, Layers, Coins, Droplets,
  ArrowDownRight,
} from "lucide-react";
import { ConnectWalletButton } from "@/components/rve/connect-wallet";
import { OrderTicket } from "@/components/rve/order-ticket";
import { AssetDetailDrawer } from "@/components/rve/asset-detail-drawer";
import { PlanetaryMap } from "@/components/rve/planetary-map";
import { VerificationFeed } from "@/components/rve/verification-feed";
import { GovernanceSection } from "@/components/rve/governance-section";
import { OrderStatusDrawer, OrderActivityButton } from "@/components/rve/order-status-drawer";
import { ASSETS, type Asset } from "@/components/rve/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RVE — Regenerative Value Exchange | Atlas Sanctum" },
      { name: "description", content: "The economic coordination layer for planetary stewardship. Trade carbon, biodiversity, water and cultural assets — AI-verified, blockchain-transparent." },
    ],
  }),
  component: RVEDashboard,
});

const ticker = [
  "AMZ-CO₂ +2.4%", "OCN-REG +4.8%", "BIO-IDX −1.2%", "H₂O-SEC +1.6%",
  "IND-STW +6.1%", "SOL-INF +0.9%", "SOIL-RGN +3.2%", "CULT-PRS +5.4%",
  "REEF-RST +7.0%", "MNGRV-BD +2.1%",
];

function RVEDashboard() {
  const [drawerAsset, setDrawerAsset] = useState<Asset | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [orderAsset, setOrderAsset] = useState<Asset | null>(null);
  const [orderOpen, setOrderOpen] = useState(false);
  const [orderSide, setOrderSide] = useState<"buy" | "sell">("buy");
  const [activityOpen, setActivityOpen] = useState(false);

  const openDrawer = (a: Asset) => { setDrawerAsset(a); setDrawerOpen(true); };
  const openOrder = (a: Asset, side: "buy" | "sell" = "buy") => {
    setOrderAsset(a); setOrderSide(side); setOrderOpen(true);
  };
  const tradeFromDrawer = (a: Asset, side: "buy" | "sell") => {
    setDrawerOpen(false);
    setTimeout(() => openOrder(a, side), 200);
  };

  return (
    <div className="min-h-screen text-foreground">
      {/* TOP NAV */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-[1600px] items-center gap-8 px-6">
          <a href="#" className="flex items-center gap-2">
            <div className="relative h-7 w-7 rounded-md bg-gradient-aurora glow-emerald">
              <Globe2 className="absolute inset-0 m-auto h-4 w-4 text-background" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-wide">ATLAS SANCTUM</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Regenerative Value Exchange</div>
            </div>
          </a>
          <nav className="ml-4 hidden flex-wrap items-center gap-1 text-sm lg:flex">
            <Link
              to="/platform-architecture"
              className="rounded-md px-3 py-1.5 text-muted-foreground transition hover:bg-muted/50 hover:text-foreground"
            >
              Architecture
            </Link>
            <Link
              to="/command-center"
              className="rounded-md bg-muted px-3 py-1.5 text-foreground transition hover:bg-muted/80"
            >
              Command Center
            </Link>
            <Link
              to="/marketplace"
              className="rounded-md px-3 py-1.5 text-muted-foreground transition hover:bg-muted/50 hover:text-foreground"
            >
              RIU Market
            </Link>
            <Link
              to="/orders"
              className="rounded-md px-3 py-1.5 text-muted-foreground transition hover:bg-muted/50 hover:text-foreground"
            >
              Orders
            </Link>
            {[
              { l: "Exchange", h: "#markets" },
              { l: "Verification", h: "#verification" },
              { l: "Gov", to: "/governance" as const },
            ].map((n) =>
              "to" in n ? (
                <Link
                  key={n.l}
                  to={n.to}
                  className="rounded-md px-3 py-1.5 text-muted-foreground transition hover:bg-muted/50 hover:text-foreground"
                >
                  {n.l}
                </Link>
              ) : (
                <a
                  key={n.l}
                  href={n.h}
                  className="rounded-md px-3 py-1.5 text-muted-foreground transition hover:bg-muted/50 hover:text-foreground"
                >
                  {n.l}
                </a>
              ),
            )}
            <Link
              to="/nairobi-twin"
              className="rounded-md px-3 py-1.5 text-muted-foreground transition hover:bg-muted/50 hover:text-foreground"
            >
              Nairobi Twin
            </Link>
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs lg:flex">
              <span className="h-2 w-2 rounded-full bg-primary ticker-pulse" />
              <span className="text-muted-foreground">Network</span>
              <span className="font-mono text-foreground">Mainnet • Block 18,402,118</span>
            </div>
            <OrderActivityButton onOpen={() => setActivityOpen(true)} />
            <ConnectWalletButton />
          </div>
        </div>
        <div className="overflow-hidden border-t border-border/60 bg-background/50">
          <div className="flex animate-ticker whitespace-nowrap py-1.5 text-xs font-mono">
            {[...ticker, ...ticker].map((t, i) => {
              const up = !t.includes("−");
              return (
                <span key={i} className="mx-6 flex items-center gap-1.5">
                  <span className={up ? "text-primary" : "text-destructive"}>●</span>
                  <span className="text-foreground">{t}</span>
                </span>
              );
            })}
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="absolute right-0 top-0 h-full w-full md:w-[60%]">
          <img src={livingPlanet} alt="Living Planet" width={1536} height={1024} className="h-full w-full object-cover opacity-60 [mask-image:linear-gradient(to_left,black_30%,transparent_95%)]" />
        </div>
        <div className="relative mx-auto grid max-w-[1600px] gap-12 px-6 py-20 md:grid-cols-2 md:py-28">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs">
              <Sparkles className="h-3 w-3 text-primary" />
              <span className="text-primary">Live • Planetary Restoration Network v4.2</span>
            </div>
            <h1 className="text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
              Trade <span className="text-gradient-aurora">Regenerative Value</span> at Planetary Scale
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Seamless exchange of carbon credits, ecosystem restoration assets, biodiversity credits, water security and cultural preservation funding — powered by AI verification and living smart contracts.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/command-center"
                className="rounded-md bg-gradient-aurora px-6 py-3 text-sm font-semibold text-background glow-emerald hover:opacity-90"
              >
                Global Command Center
              </Link>
              <Link
                to="/marketplace"
                className="rounded-md border border-primary/40 bg-primary/10 px-6 py-3 text-sm font-semibold text-primary hover:bg-primary/20"
              >
                RIU Marketplace
              </Link>
              <a href="#markets" className="rounded-md border border-border bg-background/40 px-6 py-3 text-sm font-medium backdrop-blur hover:bg-muted/50">
                Exchange (scroll)
              </a>
              <a href="#map" className="rounded-md border border-border bg-background/40 px-6 py-3 text-sm font-medium backdrop-blur hover:bg-muted/50">
                Living planet
              </a>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-6 text-xs text-muted-foreground">
              {[
                { icon: Satellite, label: "Satellite verified" },
                { icon: Shield, label: "On-chain proof" },
                { icon: Brain, label: "AI oracles" },
                { icon: Users, label: "Community validated" },
              ].map(({ icon: I, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <I className="h-4 w-4 text-primary" /> {label}
                </div>
              ))}
            </div>
          </div>

          <div className="relative hidden md:block">
            <div className="animate-float">
              <div className="panel panel-glow relative aspect-square max-w-[460px] overflow-hidden p-4 ml-auto">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-mono">
                    <span className="h-2 w-2 rounded-full bg-primary ticker-pulse" /> LIVING PLANET LAYER
                  </div>
                  <span className="text-muted-foreground">REAL-TIME</span>
                </div>
                <div className="relative mt-3 h-[calc(100%-2rem)] overflow-hidden rounded-md">
                  <img src={livingPlanet} alt="Earth" width={800} height={800} className="h-full w-full object-cover animate-spin-slow" />
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent animate-scan" />
                  <div className="absolute bottom-3 left-3 right-3 flex justify-between rounded-md border border-border/60 bg-background/70 px-3 py-2 text-xs backdrop-blur">
                    <div><div className="text-muted-foreground">Forests</div><div className="font-mono text-primary">+1.24%</div></div>
                    <div><div className="text-muted-foreground">Oceans</div><div className="font-mono text-secondary">+0.86%</div></div>
                    <div><div className="text-muted-foreground">Biodiv.</div><div className="font-mono text-accent">+2.10%</div></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* KPI METRICS */}
      <section className="border-b border-border/60">
        <div className="mx-auto grid max-w-[1600px] gap-px bg-border/40 px-0 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Trading Volume", value: "$1.84B", sub: "Total value exchanged", trend: "+12.4%", icon: BarChart3, color: "text-primary" },
            { label: "Verified Regenerative Assets", value: "12.6M", sub: "Across ecosystems & communities", trend: "+5.8%", icon: Leaf, color: "text-secondary" },
            { label: "Verification Confidence", value: "98.7%", sub: "AI + satellite validated", trend: "+0.3%", icon: Shield, color: "text-accent" },
            { label: "Communities Supported", value: "4,280", sub: "Through revenue sharing", trend: "+184", icon: Users, color: "text-primary" },
          ].map(({ label, value, sub, trend, icon: I, color }) => (
            <div key={label} className="bg-background/60 p-6 transition hover:bg-muted/20">
              <div className="flex items-start justify-between">
                <I className={`h-5 w-5 ${color}`} />
                <span className="flex items-center gap-1 text-xs text-primary"><ArrowUpRight className="h-3 w-3" />{trend}</span>
              </div>
              <div className="mt-6 font-mono text-4xl font-semibold tracking-tight">{value}</div>
              <div className="mt-1 text-sm font-medium">{label}</div>
              <div className="text-xs text-muted-foreground">{sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* MARKETS */}
      <section id="markets" className="mx-auto max-w-[1600px] px-6 py-16 scroll-mt-20">
        <SectionHeader eyebrow="Asset Marketplace" title="Live Regenerative Markets" desc="Trade verified ecological and cultural assets with full provenance. Click an asset to inspect or trade." />
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="panel lg:col-span-8">
            <div className="flex items-center justify-between border-b border-border/60 px-5 py-3 text-sm">
              <div className="flex items-center gap-2 font-medium"><Activity className="h-4 w-4 text-primary" /> Order Book — Top Markets</div>
              <div className="flex gap-1 text-xs">
                {["All", "Carbon", "Water", "Biodiversity", "Cultural"].map((t, i) => (
                  <button key={t} className={`rounded px-2 py-1 ${i===0?"bg-primary/15 text-primary":"text-muted-foreground hover:text-foreground"}`}>{t}</button>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-5 py-3 text-left font-normal">Asset</th>
                    <th className="px-3 py-3 text-right font-normal">Price</th>
                    <th className="px-3 py-3 text-right font-normal">24h</th>
                    <th className="px-3 py-3 text-right font-normal">Volume</th>
                    <th className="px-3 py-3 text-left font-normal">Region</th>
                    <th className="px-3 py-3 text-right font-normal">Depth</th>
                    <th className="px-5 py-3 text-right font-normal"></th>
                  </tr>
                </thead>
                <tbody>
                  {ASSETS.map(a => {
                    const up = a.change >= 0;
                    const I = a.icon;
                    return (
                      <tr key={a.sym} onClick={() => openDrawer(a)} className="cursor-pointer border-b border-border/40 transition hover:bg-muted/20">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-muted/30"><I className="h-4 w-4 text-primary" /></div>
                            <div>
                              <div className="font-mono text-xs text-muted-foreground">{a.sym}</div>
                              <div className="font-medium">{a.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-4 text-right font-mono">${a.price.toFixed(2)}</td>
                        <td className={`px-3 py-4 text-right font-mono ${up?"text-primary":"text-destructive"}`}>
                          <span className="inline-flex items-center gap-1">{up?<ArrowUpRight className="h-3 w-3"/>:<ArrowDownRight className="h-3 w-3"/>}{up?"+":""}{a.change}%</span>
                        </td>
                        <td className="px-3 py-4 text-right font-mono text-muted-foreground">{a.vol}</td>
                        <td className="px-3 py-4 text-xs text-muted-foreground">{a.region}</td>
                        <td className="px-3 py-4">
                          <div className="ml-auto flex h-6 w-24 items-end gap-0.5">
                            {Array.from({length:14}).map((_,i)=>(
                              <div key={i} className="flex-1 rounded-sm bg-gradient-to-t from-primary/40 to-secondary/60" style={{height:`${20+Math.abs(Math.sin(i+a.price))*80}%`}} />
                            ))}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button onClick={(e) => { e.stopPropagation(); openOrder(a, "buy"); }} className="rounded-md border border-primary/40 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/20">Buy</button>
                            <button onClick={(e) => { e.stopPropagation(); openOrder(a, "sell"); }} className="rounded-md border border-destructive/40 bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive hover:bg-destructive/20">Sell</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-6 lg:col-span-4">
            <div className="panel p-5">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium"><Radio className="h-4 w-4 text-secondary" /> AI Oracle Network</div>
                <span className="text-xs text-secondary">7 of 7 healthy</span>
              </div>
              <div className="space-y-3">
                {[
                  { name: "Sentinel-2 Satellite", trust: 99, icon: Satellite },
                  { name: "Climate Reanalysis", trust: 96, icon: Cpu },
                  { name: "Biodiversity Index", trust: 94, icon: Leaf },
                  { name: "IoT Water Sensors", trust: 98, icon: Droplets },
                  { name: "Community Validators", trust: 91, icon: Users },
                ].map(({ name, trust, icon: I }) => (
                  <div key={name}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2 text-muted-foreground"><I className="h-3.5 w-3.5"/> {name}</span>
                      <span className="font-mono text-foreground">{trust}%</span>
                    </div>
                    <div className="h-1 overflow-hidden rounded-full bg-muted">
                      <div className="h-full bg-gradient-aurora" style={{width:`${trust}%`}} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel p-5">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium"><FileCheck className="h-4 w-4 text-accent" /> Living Smart Contracts</div>
                <span className="text-xs text-muted-foreground">Last 24h</span>
              </div>
              <ul className="space-y-3 text-sm">
                {[
                  { t: "Borneo Reforestation • Milestone 4 reached", v: "+ $1.42M released", time: "2m" },
                  { t: "Great Barrier Reef coral cover +3.2%", v: "Trigger fired", time: "14m" },
                  { t: "Sahel water table restoration", v: "Tranche 2 unlocked", time: "1h" },
                  { t: "Quechua cultural archive funded", v: "+ 240 contributors", time: "3h" },
                ].map((e,i)=>(
                  <li key={i} className="flex items-start gap-3 border-b border-border/40 pb-3 last:border-0 last:pb-0">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <div className="flex-1">
                      <div className="text-foreground">{e.t}</div>
                      <div className="text-xs text-primary">{e.v}</div>
                    </div>
                    <span className="text-xs text-muted-foreground">{e.time}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* PLANETARY MAP */}
      <section id="map" className="border-y border-border/60 bg-background/40 scroll-mt-20">
        <div className="mx-auto grid max-w-[1600px] gap-6 px-6 py-16 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <PlanetaryMap assets={ASSETS} onSelect={openDrawer} />
          </div>
          <div className="space-y-6 lg:col-span-4">
            <div className="panel p-5">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium"><Eye className="h-4 w-4 text-primary"/> Verification Confidence</div>
              <div className="relative mx-auto my-4 h-32 w-32">
                <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="oklch(0.26 0.025 200)" strokeWidth="2.5"/>
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="url(#g)" strokeWidth="2.5" strokeDasharray="98.7 100" strokeLinecap="round"/>
                  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="oklch(0.74 0.18 155)"/><stop offset="100%" stopColor="oklch(0.78 0.16 205)"/></linearGradient></defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="font-mono text-3xl">98.7%</div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">AI + Sat</div>
                </div>
              </div>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex justify-between"><span>Satellite cross-check</span><span className="text-primary">Pass</span></li>
                <li className="flex justify-between"><span>Drone imagery</span><span className="text-primary">Pass</span></li>
                <li className="flex justify-between"><span>Community sign-off</span><span className="text-primary">Pass</span></li>
                <li className="flex justify-between"><span>Anomaly detection</span><span className="text-accent">Review 1</span></li>
              </ul>
            </div>
            <div className="panel p-5">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium"><Database className="h-4 w-4 text-secondary"/> On-chain Treasury Flow</div>
              <div className="space-y-2 font-mono text-xs">
                {[
                  {h:"0xa1f…d20", v:"+ 1,420,000 RGN", to:"Borneo DAO"},
                  {h:"0x8e3…0c7", v:"+ 642,000 RGN", to:"Pacific Reef Trust"},
                  {h:"0x55b…91a", v:"+ 318,500 RGN", to:"Sahel Water Coop"},
                  {h:"0x2c9…f44", v:"+ 210,000 RGN", to:"Quechua Archive"},
                ].map((r,i)=>(
                  <div key={i} className="flex items-center justify-between border-b border-border/40 py-1.5 last:border-0">
                    <span className="text-muted-foreground">{r.h}</span>
                    <span className="text-primary">{r.v}</span>
                    <span className="hidden text-muted-foreground sm:inline">→ {r.to}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VERIFICATION FEED */}
      <section id="verification" className="mx-auto max-w-[1600px] px-6 py-20 scroll-mt-20">
        <SectionHeader eyebrow="Impact Verification" title="Live Verification Feed" desc="Multi-source attestations from satellites, drones, sensors, AI and community validators — filterable in real time." />
        <VerificationFeed />
      </section>

      {/* GOVERNANCE */}
      <section id="governance" className="border-y border-border/60 bg-background/40 scroll-mt-20">
        <div className="mx-auto max-w-[1600px] px-6 py-20">
          <SectionHeader eyebrow="Governance & Treasury" title="Open vote history & community revenue" desc="Every contract event, vote, and disbursement — transparently on-chain." />
          <GovernanceSection />
        </div>
      </section>

      {/* MODULES */}
      <section className="mx-auto max-w-[1600px] px-6 py-20">
        <SectionHeader eyebrow="Core Modules" title="Built for civilization-scale coordination" desc="Five interlocking systems forming the infrastructure of post-extractive finance." />
        <p className="mb-10 max-w-2xl text-sm text-muted-foreground">
          These modules sit inside a non-negotiable{" "}
          <Link to="/platform-architecture" className="font-medium text-primary hover:underline">
            20-pillar architecture
          </Link>
          : regenerative identity, oracle verification, RIU minting, smart contracts, geospatial and IoT intelligence, community
          and M-Pesa rails, digital twin, marketplace, DAO, data lake, security, AI decisions, APIs, transparency, climate
          emergency response, ecological reputation, and knowledge systems.
        </p>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: LineChart, t: "Asset Marketplace", d: "Live order books, liquidity pools, and routing for carbon, water, biodiversity, soil, and cultural assets.", tags:["Order book","Liquidity","Routing"] },
            { icon: Shield, t: "Impact Verification", d: "Multi-source proof: satellite, drone, IoT sensors, AI anomaly detection and community validation.", tags:["Satellite","IoT","Community"] },
            { icon: Layers, t: "Blockchain Transparency", d: "Immutable provenance, treasury movement, contract registry and on-chain governance signatures.", tags:["Provenance","Audit","Vote"] },
            { icon: Brain, t: "AI Oracle Network", d: "Trusted planetary data feeds with health monitoring, trust scoring, and predictive forecasting.", tags:["Oracles","Forecast","Trust"] },
            { icon: Network, t: "Living Smart Contracts", d: "Contracts that evolve with real-world outcomes — milestone-based payouts and dynamic pricing.", tags:["Milestones","Dynamic","Auto"] },
            { icon: Coins, t: "Regenerative Treasury", d: "Programmable revenue sharing to communities, restoration funds, and stewardship bonds.", tags:["Revenue","Bonds","DAO"] },
          ].map(({icon:I,t,d,tags})=>(
            <div key={t} className="panel group relative p-6 transition hover:-translate-y-0.5 hover:glow-emerald">
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-aurora text-background">
                <I className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold">{t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{d}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {tags.map(tg=><span key={tg} className="rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">{tg}</span>)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-[1600px] px-6 pb-20">
        <div className="panel panel-glow relative overflow-hidden p-10 md:p-16">
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl"/>
          <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-secondary/20 blur-3xl"/>
          <div className="relative grid items-center gap-10 md:grid-cols-2">
            <div>
              <div className="mb-3 text-xs uppercase tracking-[0.25em] text-accent">Future Expansion</div>
              <h2 className="text-4xl font-semibold leading-tight md:text-5xl">A planetary treasury for <span className="text-gradient-aurora">post-extractive</span> civilization</h2>
              <p className="mt-5 max-w-xl text-muted-foreground">CBDC bridges, sovereign restoration funds, decentralized governance, AI planetary economics, and restoration-backed stable assets — converging on a single coordination layer.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button className="rounded-md bg-gradient-aurora px-6 py-3 text-sm font-semibold text-background glow-emerald">Apply for Early Access</button>
                <a href="#governance" className="rounded-md border border-border bg-background/40 px-6 py-3 text-sm font-medium hover:bg-muted/50">View Governance</a>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                "CBDC Integrations","Sovereign Funds","Biodiversity Markets","Planetary Insurance",
                "Decentralized Governance","Stable Restoration Assets","AI Planetary Economics","Indigenous Stewardship",
              ].map(t=>(
                <div key={t} className="rounded-lg border border-border bg-background/40 p-4 text-sm backdrop-blur transition hover:border-primary/40 hover:bg-primary/5">
                  <div className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary"/>{t}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border/60">
        <div className="mx-auto flex max-w-[1600px] flex-col items-center justify-between gap-4 px-6 py-8 text-xs text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded bg-gradient-aurora"/>
            <span>© Atlas Sanctum • Regenerative Value Exchange</span>
          </div>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            <Link to="/platform-architecture" className="hover:text-foreground">
              20 pillars
            </Link>
            <Link to="/command-center" className="hover:text-foreground">
              Dashboard hub
            </Link>
            <a href="#markets" className="hover:text-foreground">Markets</a>
            <a href="#verification" className="hover:text-foreground">Verification</a>
            <Link to="/governance" className="hover:text-foreground">Governance</Link>
            <a href="#" className="hover:text-foreground">Docs</a>
          </div>
          <div className="font-mono">v4.2.1 • Mainnet</div>
        </div>
      </footer>

      {/* DRAWERS / MODALS */}
      <AssetDetailDrawer asset={drawerAsset} open={drawerOpen} onOpenChange={setDrawerOpen} onTrade={tradeFromDrawer} />
      <OrderTicket asset={orderAsset} open={orderOpen} onOpenChange={setOrderOpen} initialSide={orderSide} onViewOrders={() => setActivityOpen(true)} />
      <OrderStatusDrawer open={activityOpen} onOpenChange={setActivityOpen} />
    </div>
  );
}

function SectionHeader({ eyebrow, title, desc }: { eyebrow: string; title: string; desc: string }) {
  return (
    <div className="mb-10 max-w-3xl">
      <div className="text-xs uppercase tracking-[0.25em] text-primary">{eyebrow}</div>
      <h2 className="mt-3 text-3xl font-semibold leading-tight md:text-4xl">{title}</h2>
      <p className="mt-3 text-muted-foreground">{desc}</p>
    </div>
  );
}
