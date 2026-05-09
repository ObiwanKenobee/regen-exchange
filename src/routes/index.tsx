import { createFileRoute } from "@tanstack/react-router";
import livingPlanet from "@/assets/living-planet.jpg";
import {
  Activity, ArrowUpRight, ArrowDownRight, BarChart3, Brain, CheckCircle2,
  Compass, Database, Droplets, Globe2, Leaf, LineChart, Network, Radio,
  Satellite, Shield, Sparkles, TreePine, TrendingUp, Users, Waves, Zap,
  Coins, FileCheck, Eye, Cpu, Layers,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RVE — Regenerative Value Exchange | Atlas Sanctum" },
      { name: "description", content: "The economic coordination layer for planetary stewardship. Trade carbon, biodiversity, water and cultural assets — AI-verified, blockchain-transparent." },
    ],
  }),
  component: RVEDashboard,
});

const assets = [
  { sym: "AMZ-CO₂", name: "Amazon Carbon Reserve", price: 84.20, change: 2.4, vol: "412M", region: "South America", icon: TreePine },
  { sym: "OCN-REG", name: "Ocean Regeneration Bond", price: 142.65, change: 4.8, vol: "318M", region: "Pacific", icon: Waves },
  { sym: "BIO-IDX", name: "Biodiversity Index Unit", price: 56.10, change: -1.2, vol: "204M", region: "Global", icon: Leaf },
  { sym: "H₂O-SEC", name: "Water Security Asset", price: 98.70, change: 1.6, vol: "188M", region: "East Africa", icon: Droplets },
  { sym: "IND-STW", name: "Indigenous Stewardship", price: 211.30, change: 6.1, vol: "156M", region: "Andes", icon: Compass },
  { sym: "SOL-INF", name: "Solar Infrastructure", price: 47.85, change: 0.9, vol: "142M", region: "MENA", icon: Zap },
];

const ticker = [
  "AMZ-CO₂ +2.4%", "OCN-REG +4.8%", "BIO-IDX −1.2%", "H₂O-SEC +1.6%",
  "IND-STW +6.1%", "SOL-INF +0.9%", "SOIL-RGN +3.2%", "CULT-PRS +5.4%",
  "REEF-RST +7.0%", "MNGRV-BD +2.1%",
];

function RVEDashboard() {
  return (
    <div className="min-h-screen text-foreground">
      {/* TOP NAV */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
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
          <nav className="ml-4 hidden items-center gap-1 text-sm md:flex">
            {["Exchange", "Markets", "Treasury", "Governance", "Intelligence"].map((n, i) => (
              <a key={n} href="#" className={`rounded-md px-3 py-1.5 transition ${i === 0 ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}>{n}</a>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs lg:flex">
              <span className="h-2 w-2 rounded-full bg-primary ticker-pulse" />
              <span className="text-muted-foreground">Network</span>
              <span className="font-mono text-foreground">Mainnet • Block 18,402,118</span>
            </div>
            <button className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted/50">Sign in</button>
            <button className="rounded-md bg-gradient-aurora px-4 py-1.5 text-sm font-semibold text-background glow-emerald hover:opacity-90">Connect Wallet</button>
          </div>
        </div>
        {/* TICKER */}
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
          <img src={livingPlanet} alt="Living Planet visualization" width={1536} height={1024} className="h-full w-full object-cover opacity-60 [mask-image:linear-gradient(to_left,black_30%,transparent_95%)]" />
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
              <button className="rounded-md bg-gradient-aurora px-6 py-3 text-sm font-semibold text-background glow-emerald hover:opacity-90">Enter the Exchange</button>
              <button className="rounded-md border border-border bg-background/40 px-6 py-3 text-sm font-medium backdrop-blur hover:bg-muted/50">Explore Living Planet</button>
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

          {/* Floating planet panel */}
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
                  <img src={livingPlanet} alt="Earth restoration data" width={800} height={800} className="h-full w-full object-cover animate-spin-slow" />
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

      {/* MAIN GRID — Markets / Map / Oracles */}
      <section className="mx-auto max-w-[1600px] px-6 py-16">
        <SectionHeader eyebrow="Asset Marketplace" title="Live Regenerative Markets" desc="Trade verified ecological and cultural assets with full provenance." />

        <div className="grid gap-6 lg:grid-cols-12">
          {/* LEFT — Markets table */}
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
                  {assets.map(a => {
                    const up = a.change >= 0;
                    const I = a.icon;
                    return (
                      <tr key={a.sym} className="border-b border-border/40 transition hover:bg-muted/20">
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
                          <button className="rounded-md border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/20">Trade</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* RIGHT — Oracle + Smart contracts */}
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

      {/* PLANETARY MAP / Verification */}
      <section className="border-y border-border/60 bg-background/40">
        <div className="mx-auto grid max-w-[1600px] gap-6 px-6 py-16 lg:grid-cols-12">
          <div className="panel panel-glow relative overflow-hidden lg:col-span-8">
            <div className="absolute inset-0">
              <img src={livingPlanet} alt="Planetary restoration map" loading="lazy" width={1536} height={1024} className="h-full w-full object-cover opacity-70" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
              <div className="absolute inset-0 grid-bg opacity-30" />
            </div>
            <div className="relative p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.25em] text-secondary">Living Planet Layer</div>
                  <h3 className="mt-2 text-3xl font-semibold">Real-Time Restoration Map</h3>
                </div>
                <div className="hidden gap-4 text-xs sm:flex">
                  {[{c:"bg-primary",l:"Forest"},{c:"bg-secondary",l:"Water"},{c:"bg-accent",l:"Cultural"},{c:"bg-destructive",l:"Alert"}].map(x=>(
                    <span key={x.l} className="flex items-center gap-1.5"><span className={`h-2 w-2 rounded-full ${x.c}`}/>{x.l}</span>
                  ))}
                </div>
              </div>
            </div>
            {/* hotspots */}
            <div className="absolute inset-0 pointer-events-none">
              {[
                {top:"38%",left:"22%",c:"bg-primary"},
                {top:"55%",left:"30%",c:"bg-accent"},
                {top:"42%",left:"58%",c:"bg-secondary"},
                {top:"30%",left:"70%",c:"bg-primary"},
                {top:"68%",left:"75%",c:"bg-destructive"},
                {top:"50%",left:"45%",c:"bg-accent"},
              ].map((h,i)=>(
                <span key={i} style={{top:h.top,left:h.left}} className="absolute -translate-x-1/2 -translate-y-1/2">
                  <span className={`block h-2.5 w-2.5 rounded-full ${h.c} ticker-pulse`} />
                </span>
              ))}
            </div>
            <div className="relative grid grid-cols-2 gap-px border-t border-border/60 bg-border/40 sm:grid-cols-4">
              {[
                { l: "Hectares Restored", v: "8.42M" },
                { l: "Tonnes CO₂ Sequestered", v: "1.18B" },
                { l: "Species Protected", v: "12,940" },
                { l: "Water Bodies Restored", v: "3,712" },
              ].map(s=>(
                <div key={s.l} className="bg-background/80 p-4">
                  <div className="font-mono text-2xl">{s.v}</div>
                  <div className="text-xs text-muted-foreground">{s.l}</div>
                </div>
              ))}
            </div>
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

      {/* MODULES GRID */}
      <section className="mx-auto max-w-[1600px] px-6 py-20">
        <SectionHeader eyebrow="Core Modules" title="Built for civilization-scale coordination" desc="Five interlocking systems forming the infrastructure of post-extractive finance." />
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

      {/* INTELLIGENCE / FORECAST */}
      <section className="border-t border-border/60 bg-background/40">
        <div className="mx-auto grid max-w-[1600px] gap-6 px-6 py-20 lg:grid-cols-2">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-secondary/10 px-3 py-1 text-xs text-secondary"><Brain className="h-3 w-3"/> Regenerative Intelligence</div>
            <h2 className="text-4xl font-semibold leading-tight md:text-5xl">An AI continuously evaluating <span className="text-gradient-aurora">planetary health</span></h2>
            <p className="mt-5 max-w-xl text-muted-foreground">Ecosystem health, restoration ROI, regional resilience, fraud probability, social impact and long-term sustainability — modeled in real time and surfaced as actionable signals.</p>
            <div className="mt-8 grid grid-cols-2 gap-3 text-sm">
              {[
                {l:"Restoration ROI",v:"+ 4.2x"},
                {l:"Fraud probability",v:"0.04%"},
                {l:"Resilience index",v:"82.1"},
                {l:"Social impact",v:"A+"},
              ].map(s=>(
                <div key={s.l} className="panel flex items-center justify-between p-4"><span className="text-muted-foreground">{s.l}</span><span className="font-mono text-foreground">{s.v}</span></div>
              ))}
            </div>
          </div>
          <div className="panel p-6">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Predictive Restoration Forecast — 12 months</div>
              <span className="text-xs text-primary">Confidence 94%</span>
            </div>
            {/* SVG chart */}
            <svg viewBox="0 0 600 240" className="mt-4 h-64 w-full">
              <defs>
                <linearGradient id="area" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.74 0.18 155)" stopOpacity="0.5"/>
                  <stop offset="100%" stopColor="oklch(0.74 0.18 155)" stopOpacity="0"/>
                </linearGradient>
                <linearGradient id="area2" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.78 0.16 205)" stopOpacity="0.4"/>
                  <stop offset="100%" stopColor="oklch(0.78 0.16 205)" stopOpacity="0"/>
                </linearGradient>
              </defs>
              {[40,80,120,160,200].map(y=><line key={y} x1="0" x2="600" y1={y} y2={y} stroke="oklch(0.30 0.025 200 / 50%)" strokeDasharray="2 4"/>)}
              <path d="M0,180 C60,160 100,150 150,130 C200,110 240,140 290,110 C340,80 390,90 440,60 C490,35 540,50 600,30 L600,240 L0,240 Z" fill="url(#area)"/>
              <path d="M0,180 C60,160 100,150 150,130 C200,110 240,140 290,110 C340,80 390,90 440,60 C490,35 540,50 600,30" fill="none" stroke="oklch(0.74 0.18 155)" strokeWidth="2"/>
              <path d="M0,200 C80,190 140,180 200,170 C260,160 320,165 380,140 C440,115 500,120 600,95 L600,240 L0,240 Z" fill="url(#area2)"/>
              <path d="M0,200 C80,190 140,180 200,170 C260,160 320,165 380,140 C440,115 500,120 600,95" fill="none" stroke="oklch(0.78 0.16 205)" strokeWidth="2"/>
              {["Q1","Q2","Q3","Q4"].map((q,i)=><text key={q} x={75+i*150} y="232" fill="oklch(0.70 0.025 200)" fontSize="10" fontFamily="monospace">{q}</text>)}
            </svg>
            <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary"/>Forest cover</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-secondary"/>Biodiversity</span>
            </div>
          </div>
        </div>
      </section>

      {/* GOVERNANCE / CTA */}
      <section className="mx-auto max-w-[1600px] px-6 py-20">
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
                <button className="rounded-md border border-border bg-background/40 px-6 py-3 text-sm font-medium hover:bg-muted/50">Read the Manifesto</button>
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
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground">Markets</a>
            <a href="#" className="hover:text-foreground">Verification</a>
            <a href="#" className="hover:text-foreground">Governance</a>
            <a href="#" className="hover:text-foreground">Treasury</a>
            <a href="#" className="hover:text-foreground">Docs</a>
          </div>
          <div className="font-mono">v4.2.1 • Mainnet</div>
        </div>
      </footer>
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
