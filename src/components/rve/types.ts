import type { LucideIcon } from "lucide-react";
import { TreePine, Waves, Leaf, Droplets, Compass, Zap } from "lucide-react";

export type Asset = {
  sym: string;
  name: string;
  price: number;
  change: number;
  vol: string;
  region: string;
  icon: LucideIcon;
  ecosystem: "Forest" | "Ocean" | "Biodiversity" | "Water" | "Cultural" | "Energy";
  liquidity: number; // in millions
  verification: number; // 0-100
  hectares: number;
  story: string;
};

export const ASSETS: Asset[] = [
  { sym: "AMZ-CO₂", name: "Amazon Carbon Reserve", price: 84.20, change: 2.4, vol: "412M", region: "South America", icon: TreePine, ecosystem: "Forest", liquidity: 142, verification: 99, hectares: 412000, story: "Protected Amazon basin reforestation across 412,000 ha. Verified by Sentinel-2 + community rangers." },
  { sym: "OCN-REG", name: "Ocean Regeneration Bond", price: 142.65, change: 4.8, vol: "318M", region: "Pacific", icon: Waves, ecosystem: "Ocean", liquidity: 98, verification: 96, hectares: 218000, story: "Pacific marine protected areas with kelp restoration and reef recovery monitoring." },
  { sym: "BIO-IDX", name: "Biodiversity Index Unit", price: 56.10, change: -1.2, vol: "204M", region: "Global", icon: Leaf, ecosystem: "Biodiversity", liquidity: 76, verification: 94, hectares: 0, story: "Composite index tracking species recovery across 64 indicator regions worldwide." },
  { sym: "H₂O-SEC", name: "Water Security Asset", price: 98.70, change: 1.6, vol: "188M", region: "East Africa", icon: Droplets, ecosystem: "Water", liquidity: 64, verification: 98, hectares: 88000, story: "Sahel water table restoration through agroforestry and aquifer recharge basins." },
  { sym: "IND-STW", name: "Indigenous Stewardship", price: 211.30, change: 6.1, vol: "156M", region: "Andes", icon: Compass, ecosystem: "Cultural", liquidity: 52, verification: 92, hectares: 134000, story: "Quechua and Aymara stewardship bonds funding cultural continuity and land defense." },
  { sym: "SOL-INF", name: "Solar Infrastructure", price: 47.85, change: 0.9, vol: "142M", region: "MENA", icon: Zap, ecosystem: "Energy", liquidity: 88, verification: 97, hectares: 24000, story: "Distributed solar + battery infrastructure across MENA, displacing diesel generation." },
];

export const ECOSYSTEMS = ["All", "Forest", "Ocean", "Biodiversity", "Water", "Cultural", "Energy"] as const;
