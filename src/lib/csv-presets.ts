import { useEffect, useState } from "react";

export type CsvScope = "orders" | "feed";
export type CsvPreset = { id: string; name: string; ts: number; cols: string[] };

const KEY = (s: CsvScope) => `rve.csv.presets.${s}.v1`;
const cache = new Map<CsvScope, CsvPreset[]>();
const subs = new Map<CsvScope, Set<() => void>>();

function load(s: CsvScope): CsvPreset[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY(s));
    return raw ? (JSON.parse(raw) as CsvPreset[]) : [];
  } catch { return []; }
}
function ensure(s: CsvScope) {
  if (!cache.has(s)) cache.set(s, load(s));
  return cache.get(s)!;
}
function persist(s: CsvScope, list: CsvPreset[]) {
  cache.set(s, list);
  if (typeof window !== "undefined") {
    try { window.localStorage.setItem(KEY(s), JSON.stringify(list)); } catch {}
  }
  (subs.get(s) ?? new Set()).forEach((l) => l());
}

export function listCsvPresets(s: CsvScope) { return ensure(s); }
export function saveCsvPreset(s: CsvScope, name: string, cols: string[]) {
  const list = ensure(s).filter((p) => p.name !== name);
  const p: CsvPreset = { id: `csv-${Date.now()}`, name, ts: Date.now(), cols };
  persist(s, [p, ...list]);
  return p;
}
export function deleteCsvPreset(s: CsvScope, id: string) {
  persist(s, ensure(s).filter((p) => p.id !== id));
}

export function useCsvPresets(s: CsvScope) {
  const [snap, setSnap] = useState<CsvPreset[]>(() => ensure(s));
  useEffect(() => {
    if (!subs.has(s)) subs.set(s, new Set());
    const set = subs.get(s)!;
    const l = () => setSnap([...ensure(s)]);
    set.add(l); setSnap([...ensure(s)]);
    return () => { set.delete(l); };
  }, [s]);
  return snap;
}
