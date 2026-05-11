import { useEffect, useState } from "react";

export type NotificationPrefs = {
  orders: boolean;
  verification: boolean;
  sound: boolean;
  email: boolean;
};

const KEY = "rve.notify.prefs.v1";
const DEFAULTS: NotificationPrefs = { orders: true, verification: false, sound: false, email: false };
const listeners = new Set<() => void>();
let cache: NotificationPrefs = load();

function load(): NotificationPrefs {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}
function save() {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(KEY, JSON.stringify(cache)); } catch {}
}

export function getNotificationPrefs(): NotificationPrefs {
  return cache;
}
export function setNotificationPrefs(patch: Partial<NotificationPrefs>) {
  cache = { ...cache, ...patch };
  save();
  listeners.forEach((l) => l());
}
export function useNotificationPrefs(): NotificationPrefs {
  const [snap, setSnap] = useState<NotificationPrefs>(cache);
  useEffect(() => {
    const l = () => setSnap({ ...cache });
    listeners.add(l);
    setSnap({ ...cache });
    return () => { listeners.delete(l); };
  }, []);
  return snap;
}

// Tiny WebAudio chirp. Safe-no-op on SSR.
let audioCtx: AudioContext | null = null;
export function playNotifySound(kind: "success" | "error" | "info" = "info") {
  if (typeof window === "undefined") return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || (window as any).webkitAudioContext)();
    const ctx = audioCtx!;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    const freq = kind === "success" ? 880 : kind === "error" ? 220 : 540;
    o.frequency.value = freq;
    g.gain.value = 0.0001;
    o.connect(g).connect(ctx.destination);
    const t = ctx.currentTime;
    g.gain.exponentialRampToValueAtTime(0.18, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
    o.start(t);
    o.stop(t + 0.27);
  } catch {}
}