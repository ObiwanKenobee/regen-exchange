/**
 * Non-negotiable RVE platform architecture — canonical pillar definitions.
 * UI and docs should derive from this source of truth where possible.
 */

export type PlatformPillarHorizon = "core" | "future";

export type PlatformPillar = {
  id: string;
  ordinal: number;
  shortTitle: string;
  title: string;
  purpose: string;
  whyItMatters?: string;
  features: string[];
  technologies?: string[];
  relatedRoutes?: { to: string; label: string }[];
  horizon: PlatformPillarHorizon;
};

export const PLATFORM_PILLARS: PlatformPillar[] = [
  {
    id: "rid",
    ordinal: 1,
    shortTitle: "RID",
    title: "Regenerative Identity Layer (RID)",
    purpose: "Establish trusted ecological participation — every participant carries a regenerative identity.",
    whyItMatters:
      "Without identity: fake restoration, reward farming, and brittle governance. RID anchors who earns, votes, and stewards.",
    features: [
      "Decentralized identity (DID)",
      "Ecological reputation scoring",
      "Verifiable credentials",
      "Community trust graphs",
      "Anti-fraud identity validation",
      "Stewardship history",
    ],
    technologies: ["DID methods", "VC / W3C patterns", "Graph analytics"],
    relatedRoutes: [
      { to: "/community", label: "Community" },
      { to: "/governance", label: "Governance" },
    ],
    horizon: "core",
  },
  {
    id: "oracle",
    ordinal: 2,
    shortTitle: "Oracle",
    title: "AI Oracle Verification Engine",
    purpose: "Verify that ecological activity is real — the trust nucleus of RVE.",
    whyItMatters: "Verified impact is the only legitimate input to RIU minting and treasury release.",
    features: [
      "Ecological validation & temporal change analysis",
      "Fraud detection & anomaly detection",
      "Consensus scoring & confidence metrics",
    ],
    technologies: [
      "Satellite imagery",
      "IoT sensors",
      "Drone feeds",
      "Geospatial analytics",
      "Community reports",
      "Edge AI",
      "Environmental APIs",
    ],
    relatedRoutes: [{ to: "/oracle", label: "AI Oracle" }],
    horizon: "core",
  },
  {
    id: "riu-engine",
    ordinal: 3,
    shortTitle: "RIU engine",
    title: "RIU Minting & Asset Engine",
    purpose: "Transform verified restoration into tradable value — the economic conversion layer.",
    features: [
      "RIU issuance",
      "Asset classification",
      "Dynamic valuation & scarcity modeling",
      "Impact weighting",
      "Carbon equivalence mapping",
    ],
    technologies: ["Carbon / biodiversity / water / circular / cultural asset classes"],
    relatedRoutes: [
      { to: "/marketplace", label: "Marketplace" },
      { to: "/refi", label: "ReFi" },
    ],
    horizon: "core",
  },
  {
    id: "contracts",
    ordinal: 4,
    shortTitle: "Contracts",
    title: "Smart Contract Infrastructure",
    purpose: "Automation backbone for escrow, payouts, governance, treasury, staking, grants, and settlement.",
    whyItMatters: "Contracts must be upgradeable (governed), audited, modular, and event-driven.",
    features: [
      "Escrow & automated payouts",
      "Governance execution",
      "Treasury operations",
      "Staking & grant distribution",
      "Marketplace settlement",
    ],
    technologies: ["Modular proxies", "Event indexing", "Audit pipelines"],
    relatedRoutes: [
      { to: "/governance", label: "Governance" },
      { to: "/marketplace", label: "Marketplace" },
    ],
    horizon: "core",
  },
  {
    id: "geospatial",
    ordinal: 5,
    shortTitle: "Geospatial",
    title: "Geospatial Intelligence System",
    purpose: "Visualize the city and biomes as living ecological systems.",
    features: [
      "Satellite mapping & ecological heatmaps",
      "Flood prediction & river monitoring",
      "Urban heat analysis",
      "Restoration zone tracking",
      "Biodiversity mapping",
    ],
    technologies: ["PostGIS", "CesiumJS", "Mapbox", "Earth Engine", "Deck.gl"],
    relatedRoutes: [
      { to: "/nairobi-twin", label: "Nairobi Twin" },
      { to: "/command-center", label: "Command Center" },
      { to: "/impact-explorer", label: "Impact Explorer" },
    ],
    horizon: "core",
  },
  {
    id: "iot",
    ordinal: 6,
    shortTitle: "IoT",
    title: "IoT Environmental Sensor Network",
    purpose: "Real-world sensing fabric with edge validation before cloud upload.",
    features: [
      "Air & water quality",
      "Soil health",
      "Flood sensors & weather stations",
      "Noise monitoring",
      "Waste tracking",
    ],
    technologies: ["Edge AI", "MQTT / LPWAN", "Time-series stores"],
    relatedRoutes: [{ to: "/oracle", label: "Oracle" }],
    horizon: "core",
  },
  {
    id: "community",
    ordinal: 7,
    shortTitle: "Community",
    title: "Community Steward Platform",
    purpose: "Human coordination layer for mass participation in regeneration.",
    whyItMatters: "Without communities, regeneration becomes performative.",
    features: [
      "Restoration missions & ecological jobs",
      "Gamification & rewards",
      "M-Pesa payouts",
      "Impact leaderboards",
      "Community DAOs",
      "Mobile-first participation",
    ],
    relatedRoutes: [{ to: "/community", label: "Community" }],
    horizon: "core",
  },
  {
    id: "payments",
    ordinal: 8,
    shortTitle: "Wallet",
    title: "Mobile Wallet & Payment Infrastructure",
    purpose: "Economic access layer with strong abstraction — most users never see chain jargon.",
    features: [
      "M-Pesa",
      "Stablecoins & RIUs",
      "Fiat conversion",
      "QR payments",
      "Escrow balances",
    ],
    technologies: ["Daraja", "Account abstraction", "Custody policies"],
    relatedRoutes: [
      { to: "/community", label: "Community" },
      { to: "/marketplace", label: "Marketplace" },
      { to: "/refi", label: "ReFi" },
    ],
    horizon: "core",
  },
  {
    id: "digital-twin",
    ordinal: 9,
    shortTitle: "Digital twin",
    title: "Digital Twin Engine",
    purpose: "Simulate Nairobi (and other cities) as dynamic ecological-economic organisms.",
    features: [
      "Flood risk & urban growth",
      "Carbon absorption & waste flow",
      "Traffic emissions & water systems",
      "Heat islands",
    ],
    technologies: ["Predictive models", "Policy simulation", "Scenario ensembles"],
    relatedRoutes: [
      { to: "/nairobi-twin", label: "Nairobi Twin" },
      { to: "/eco-intelligence", label: "Eco Intelligence" },
    ],
    horizon: "core",
  },
  {
    id: "marketplace",
    ordinal: 10,
    shortTitle: "Marketplace",
    title: "Regenerative Marketplace",
    purpose: "Liquidity layer for RIUs, impact investing, staking, retirement, funding, and bonds.",
    features: [
      "RIU exchange & ecological staking",
      "Carbon retirement",
      "Restoration funding & regenerative bonds",
      "AI pricing models & ecological derivatives",
      "Dynamic impact scoring",
    ],
    relatedRoutes: [
      { to: "/marketplace", label: "Marketplace" },
      { to: "/refi", label: "ReFi" },
    ],
    horizon: "core",
  },
  {
    id: "dao",
    ordinal: 11,
    shortTitle: "DAO",
    title: "DAO Governance Layer",
    purpose: "Coordination protocol for proposals, treasury, quadratic voting, and ecological policy.",
    whyItMatters: "Long-term goal: shift from centralized ops to regenerative civic intelligence networks.",
    features: [
      "Proposal systems & treasury voting",
      "Community governance",
      "Reputation-weighted participation",
      "Ecological policy coordination",
    ],
    relatedRoutes: [{ to: "/governance", label: "Governance" }],
    horizon: "core",
  },
  {
    id: "data-lake",
    ordinal: 12,
    shortTitle: "Data lake",
    title: "Data Lake & Ecological Intelligence Platform",
    purpose: "Institutional memory — sensor streams, imagery, models, finance, and governance history.",
    features: [
      "Sensor streams & satellite imagery",
      "Restoration records & ecological models",
      "Financial activity & governance history",
    ],
    technologies: ["Delta Lake", "Apache Iceberg", "Spark", "DuckDB", "MLflow"],
    relatedRoutes: [
      { to: "/eco-intelligence", label: "Eco Intelligence" },
      { to: "/institutional-esg", label: "Institutional ESG" },
    ],
    horizon: "core",
  },
  {
    id: "security",
    ordinal: 13,
    shortTitle: "Security",
    title: "Cybersecurity & Trust Layer",
    purpose: "Existential security for climate finance, infrastructure intelligence, and city-scale coordination.",
    features: [
      "Zero-trust architecture",
      "HSMs & secure enclaves",
      "Oracle tamper detection",
      "AI model integrity checks",
      "Smart contract auditing",
      "Identity protection",
    ],
    relatedRoutes: [{ to: "/oracle", label: "Oracle" }],
    horizon: "core",
  },
  {
    id: "ai-decision",
    ordinal: 14,
    shortTitle: "AI brain",
    title: "AI Decision Intelligence Layer",
    purpose: "Predictive brain for forecasting, recommendations, risk, resilience, resources, and fraud.",
    whyItMatters: "Future: AI agents coordinating city-scale regeneration with human oversight.",
    features: [
      "Ecological forecasting",
      "Restoration recommendations",
      "Risk & fraud prediction",
      "Urban resilience modeling",
      "Resource optimization",
    ],
    relatedRoutes: [{ to: "/eco-intelligence", label: "Eco Intelligence" }],
    horizon: "core",
  },
  {
    id: "developer",
    ordinal: 15,
    shortTitle: "APIs / SDKs",
    title: "Developer & API Ecosystem",
    purpose: "Scalability through open ecological, RIU, geospatial, oracle, and governance APIs.",
    whyItMatters:
      "Open developer surfaces unlock partners, accelerators, and trusted integrations for regenerative systems.",
    features: [
      "Open REST/GraphQL APIs",
      "SDKs for mobile and web",
      "Webhook and event stream support",
      "Extensible plugin architecture",
      "Reference app templates",
    ],
    technologies: ["Flutter", "TypeScript", "Python", "Rust SDKs"],
    relatedRoutes: [{ to: "/impact-explorer", label: "Impact Explorer" }],
    horizon: "core",
  },
  {
    id: "transparency",
    ordinal: 16,
    shortTitle: "Transparency",
    title: "Public Transparency Portal",
    purpose: "Trust amplifier — open maps, dashboards, treasury visibility, verification explorer, audit trails.",
    whyItMatters: "People trust systems they can inspect.",
    features: [
      "Open restoration maps",
      "Live ecological dashboards",
      "Treasury visibility",
      "Impact verification explorer",
      "Public audit trails",
    ],
    relatedRoutes: [
      { to: "/impact-explorer", label: "Impact Explorer" },
      { to: "/command-center", label: "Command Center" },
    ],
    horizon: "core",
  },
  {
    id: "climate-emergency",
    ordinal: 17,
    shortTitle: "Emergency",
    title: "Climate Emergency Response Layer",
    purpose: "High-value for Nairobi — alerts and civic coordination under stress.",
    features: [
      "Flood & pollution warnings",
      "Heatwave & water scarcity alerts",
      "Infrastructure risk detection",
    ],
    technologies: ["SMS", "WhatsApp", "Emergency & civic APIs"],
    relatedRoutes: [
      { to: "/nairobi-twin", label: "Nairobi Twin" },
      { to: "/command-center", label: "Command Center" },
    ],
    horizon: "core",
  },
  {
    id: "eco-reputation",
    ordinal: 18,
    shortTitle: "Eco rep",
    title: "Ecological Reputation System",
    purpose: "Long-horizon civic capital from restoration contribution, trust, verification reliability, and governance participation.",
    whyItMatters: "Ecological reputation becomes a new form of civic capital.",
    features: [
      "Restoration contribution scoring",
      "Community trust & verification reliability",
      "Governance participation history",
      "Stewardship lineage",
    ],
    relatedRoutes: [
      { to: "/community", label: "Community" },
      { to: "/governance", label: "Governance" },
    ],
    horizon: "core",
  },
  {
    id: "autonomous",
    ordinal: 19,
    shortTitle: "Autonomous",
    title: "Autonomous Restoration Infrastructure",
    purpose: "Moonshot robotics and agents for scaled physical restoration.",
    features: [
      "Cleanup drones & robotic waste sorting",
      "Autonomous reforestation",
      "Swarm environmental robotics",
      "AI-directed restoration agents",
    ],
    horizon: "future",
  },
  {
    id: "knowledge",
    ordinal: 20,
    shortTitle: "Knowledge",
    title: "Regenerative Knowledge Engine",
    purpose: "Cultural and educational layer — indigenous intelligence, climate education, tutorials, storytelling, open research.",
    features: [
      "Indigenous ecological intelligence",
      "Climate education & restoration tutorials",
      "Community storytelling",
      "Open environmental research",
    ],
    relatedRoutes: [{ to: "/impact-explorer", label: "Impact Explorer" }],
    horizon: "core",
  },
];

export function pillarsByHorizon(horizon: PlatformPillarHorizon): PlatformPillar[] {
  return PLATFORM_PILLARS.filter((p) => p.horizon === horizon);
}
