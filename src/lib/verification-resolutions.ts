import { useEffect, useState } from "react";

export type ResolutionStatus = "open" | "human_review" | "resolved";
export type Resolution = { status: ResolutionStatus; ts: number; note?: string };

const KEY = "rve.resolutions.v1";
const listeners = new Set<() => void>();
let cache: Record<string, Resolution> = load();

function load(): Record<string, Resolution> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(window.localStorage.getItem(KEY) || "{}"); } catch { return {}; }
}
function save() {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(KEY, JSON.stringify(cache)); } catch {}
}

export function getResolution(id: string): Resolution | undefined {
  return cache[id];
}

export function setResolution(id: string, status: ResolutionStatus, note?: string) {
  cache = { ...cache, [id]: { status, ts: Date.now(), note } };
  save();
  listeners.forEach((l) => l());
}

export function useResolutions(): Record<string, Resolution> {
  const [snap, setSnap] = useState<Record<string, Resolution>>(cache);
  useEffect(() => {
    const l = () => setSnap({ ...cache });
    listeners.add(l);
    // re-sync on mount in case cache loaded after SSR
    setSnap({ ...cache });
    return () => { listeners.delete(l); };
  }, []);
  return snap;
}