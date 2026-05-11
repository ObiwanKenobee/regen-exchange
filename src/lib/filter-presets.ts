import { useEffect, useState } from "react";

export type PresetScope = "feed" | "orders";
export type Preset<T> = { id: string; name: string; ts: number; filters: T };

const KEY = (scope: PresetScope) => `rve.presets.${scope}.v1`;
const listeners = new Map<PresetScope, Set<() => void>>();
const cache = new Map<PresetScope, Preset<any>[]>();

function load<T>(scope: PresetScope): Preset<T>[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY(scope));
    return raw ? (JSON.parse(raw) as Preset<T>[]) : [];
  } catch { return []; }
}
function persist<T>(scope: PresetScope, list: Preset<T>[]) {
  cache.set(scope, list);
  if (typeof window !== "undefined") {
    try { window.localStorage.setItem(KEY(scope), JSON.stringify(list)); } catch {}
  }
  (listeners.get(scope) ?? new Set()).forEach((l) => l());
}
function ensure<T>(scope: PresetScope): Preset<T>[] {
  if (!cache.has(scope)) cache.set(scope, load<T>(scope));
  return cache.get(scope) as Preset<T>[];
}

export function listPresets<T>(scope: PresetScope): Preset<T>[] { return ensure<T>(scope); }
export function savePreset<T>(scope: PresetScope, name: string, filters: T): Preset<T> {
  const list = ensure<T>(scope).filter((p) => p.name !== name);
  const preset: Preset<T> = { id: `pst-${Date.now()}`, name, ts: Date.now(), filters };
  persist(scope, [preset, ...list]);
  return preset;
}
export function deletePreset(scope: PresetScope, id: string) {
  persist(scope, ensure<any>(scope).filter((p) => p.id !== id));
}

export function usePresets<T>(scope: PresetScope): Preset<T>[] {
  const [snap, setSnap] = useState<Preset<T>[]>(() => ensure<T>(scope));
  useEffect(() => {
    if (!listeners.has(scope)) listeners.set(scope, new Set());
    const ls = listeners.get(scope)!;
    const l = () => setSnap([...(cache.get(scope) as Preset<T>[])]);
    ls.add(l);
    setSnap([...ensure<T>(scope)]);
    return () => { ls.delete(l); };
  }, [scope]);
  return snap;
}