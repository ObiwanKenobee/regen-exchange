import { ECOSYSTEMS } from "./types";
import { getResolution } from "@/lib/verification-resolutions";

export type VerificationStatus = "verified" | "review" | "anomaly";
export type VerificationSource = "Satellite" | "Drone" | "IoT" | "Community" | "AI";

export type VerificationEvent = {
  id: string;
  ts: number; // epoch ms
  asset: string;
  ecosystem: typeof ECOSYSTEMS[number];
  region: string;
  source: VerificationSource;
  confidence: number;
  status: VerificationStatus;
  detail: string;
};

export const SOURCES = ["All", "Satellite", "Drone", "IoT", "Community", "AI"] as const;

const now = Date.now();
const m = (n: number) => now - n * 60_000;

export const SEED_EVENTS: VerificationEvent[] = [
  { id: "v1", ts: m(2),  asset: "AMZ-CO₂", ecosystem: "Forest",       region: "Amazon Basin",       source: "Satellite", confidence: 99, status: "verified", detail: "Canopy expansion +1.4% over 412 ha — Sentinel-2 cross-checked" },
  { id: "v2", ts: m(8),  asset: "OCN-REG", ecosystem: "Ocean",        region: "Great Barrier Reef", source: "Drone",     confidence: 96, status: "verified", detail: "Coral cover +3.2% in monitoring grid B-7" },
  { id: "v3", ts: m(14), asset: "H₂O-SEC", ecosystem: "Water",        region: "Sahel",              source: "IoT",       confidence: 98, status: "verified", detail: "Aquifer recharge sensors report +2.1m water table rise" },
  { id: "v4", ts: m(22), asset: "BIO-IDX", ecosystem: "Biodiversity", region: "Borneo",             source: "AI",        confidence: 71, status: "review",   detail: "Species count anomaly — flagged for community validators" },
  { id: "v5", ts: m(31), asset: "IND-STW", ecosystem: "Cultural",     region: "Andes",              source: "Community", confidence: 94, status: "verified", detail: "27 of 27 stewards signed milestone 4 attestation" },
  { id: "v6", ts: m(47), asset: "SOL-INF", ecosystem: "Energy",       region: "Morocco",            source: "IoT",       confidence: 97, status: "verified", detail: "8.2 GWh generated, displaced 4,100t CO₂ this week" },
  { id: "v7", ts: m(60), asset: "AMZ-CO₂", ecosystem: "Forest",       region: "Pará",               source: "AI",        confidence: 42, status: "anomaly",  detail: "Possible logging activity detected — escalated to ranger network" },
  { id: "v8", ts: m(120),asset: "OCN-REG", ecosystem: "Ocean",        region: "Pacific Northwest",  source: "Satellite", confidence: 95, status: "verified", detail: "Kelp forest extent +0.8% confirmed" },
  { id: "v9", ts: m(180),asset: "H₂O-SEC", ecosystem: "Water",        region: "Lake Chad",          source: "Satellite", confidence: 93, status: "verified", detail: "Surface water +1.1% YoY across monitored basin" },
  { id: "v10",ts: m(240),asset: "IND-STW", ecosystem: "Cultural",     region: "Cuzco",              source: "Community", confidence: 90, status: "verified", detail: "Oral history archive milestone 3 attested by 18 elders" },
  { id: "v11",ts: m(300),asset: "BIO-IDX", ecosystem: "Biodiversity", region: "Congo Basin",        source: "Drone",     confidence: 88, status: "verified", detail: "Forest elephant count up 4% in surveyed corridor" },
  { id: "v12",ts: m(420),asset: "SOL-INF", ecosystem: "Energy",       region: "Atacama",            source: "Satellite", confidence: 96, status: "verified", detail: "PV array degradation within tolerance" },
];

export function tsAgo(ts: number): string {
  const s = Math.max(1, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return `${s}s ago`;
  const min = Math.floor(s / 60);
  if (min < 60) return `${min}m ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export function getEventsForAsset(events: VerificationEvent[], sym: string) {
  return events.filter((e) => e.asset === sym).sort((a, b) => b.ts - a.ts);
}

export function getLatestConfidenceForAsset(events: VerificationEvent[], sym: string, fallback: number) {
  const list = getEventsForAsset(events, sym);
  if (!list.length) return fallback;
  const recent = list.slice(0, 3);
  return Math.round(recent.reduce((s, e) => s + e.confidence, 0) / recent.length);
}

// Timeline progress derived from verified milestones for an asset (0-100)
const TIMELINE_TARGETS: Record<string, number> = {
  "AMZ-CO₂": 8,
  "OCN-REG": 6,
  "BIO-IDX": 5,
  "H₂O-SEC": 6,
  "IND-STW": 5,
  "SOL-INF": 6,
};

export function getTimelineProgress(events: VerificationEvent[], sym: string) {
  const list = getEventsForAsset(events, sym);
  const verified = list.filter((e) => e.status === "verified").length;
  // Resolved anomalies count as completed milestones too
  const resolved = list.filter((e) => {
    if (e.status !== "anomaly") return false;
    const r = getResolution(e.id);
    return r?.status === "resolved";
  }).length;
  const target = TIMELINE_TARGETS[sym] ?? 6;
  return Math.min(100, Math.round(((verified + resolved) / target) * 100));
}

const RAND_DETAILS: Record<VerificationSource, string[]> = {
  Satellite: [
    "Sentinel-2 pass confirms canopy stability",
    "NDVI uptick +0.4% in monitored cell",
    "No deforestation alert in tile",
  ],
  Drone: [
    "Drone sweep — coral health index improving",
    "Aerial survey: no encroachment detected",
    "Mangrove transect mapped, +0.6% extent",
  ],
  IoT: [
    "Soil moisture sensors report nominal",
    "Aquifer level +0.18m vs baseline",
    "Water turbidity within target band",
  ],
  Community: [
    "Local steward attestation submitted",
    "Ranger patrol log uploaded",
    "Indigenous council co-signed milestone",
  ],
  AI: [
    "Anomaly model: no flags this cycle",
    "Forecast model retrained, drift low",
    "Cross-source confidence aggregated",
  ],
};

let streamCounter = 0;
export function generateLiveEvent(seed?: VerificationEvent[]): VerificationEvent {
  const pool = seed && seed.length ? seed : SEED_EVENTS;
  const base = pool[Math.floor(Math.random() * pool.length)];
  const source: VerificationSource = (["Satellite", "Drone", "IoT", "Community", "AI"] as const)[Math.floor(Math.random() * 5)];
  const conf = Math.floor(70 + Math.random() * 30);
  const status: VerificationStatus = conf > 85 ? "verified" : conf > 60 ? "review" : "anomaly";
  const details = RAND_DETAILS[source];
  return {
    id: `live-${Date.now()}-${++streamCounter}`,
    ts: Date.now(),
    asset: base.asset,
    ecosystem: base.ecosystem,
    region: base.region,
    source,
    confidence: conf,
    status,
    detail: details[Math.floor(Math.random() * details.length)],
  };
}