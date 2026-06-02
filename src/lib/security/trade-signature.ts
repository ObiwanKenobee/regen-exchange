import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * Trade execution request signing.
 *
 * Each signed payload includes a millisecond timestamp and a one-shot nonce.
 * The verifier rejects:
 *   - signatures that don't match (tampered payload / wrong secret)
 *   - timestamps outside the allowed window (default 30s) — clock skew / replay
 *   - nonces that have already been seen (replay attack)
 */

export interface SignedTradeRequest<T = unknown> {
  payload: T;
  timestamp: number;
  nonce: string;
  signature: string;
}

export interface VerifyOptions {
  /** Max age of the timestamp in milliseconds. Default 30s. */
  maxAgeMs?: number;
  /** Max future drift allowed in ms. Default 5s. */
  maxSkewMs?: number;
  /** Clock injection for tests. */
  now?: () => number;
}

function canonicalize(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return "[" + value.map(canonicalize).join(",") + "]";
  const keys = Object.keys(value as Record<string, unknown>).sort();
  return (
    "{" +
    keys
      .map((k) => JSON.stringify(k) + ":" + canonicalize((value as Record<string, unknown>)[k]))
      .join(",") +
    "}"
  );
}

export function computeSignature(secret: string, payload: unknown, timestamp: number, nonce: string): string {
  const message = `${timestamp}.${nonce}.${canonicalize(payload)}`;
  return createHmac("sha256", secret).update(message).digest("hex");
}

export function signTradeRequest<T>(
  secret: string,
  payload: T,
  opts: { timestamp?: number; nonce?: string } = {},
): SignedTradeRequest<T> {
  const timestamp = opts.timestamp ?? Date.now();
  const nonce = opts.nonce ?? randomBytes(16).toString("hex");
  const signature = computeSignature(secret, payload, timestamp, nonce);
  return { payload, timestamp, nonce, signature };
}

export class NonceStore {
  private seen = new Map<string, number>();
  constructor(private ttlMs: number = 60_000) {}
  has(nonce: string, now: number = Date.now()): boolean {
    this.gc(now);
    return this.seen.has(nonce);
  }
  remember(nonce: string, now: number = Date.now()): void {
    this.gc(now);
    this.seen.set(nonce, now);
  }
  private gc(now: number) {
    for (const [k, ts] of this.seen) {
      if (now - ts > this.ttlMs) this.seen.delete(k);
    }
  }
}

export type VerifyResult =
  | { ok: true }
  | { ok: false; reason: "bad_signature" | "expired" | "future" | "replayed" };

export function verifyTradeRequest(
  secret: string,
  req: SignedTradeRequest,
  nonces: NonceStore,
  options: VerifyOptions = {},
): VerifyResult {
  const now = (options.now ?? Date.now)();
  const maxAge = options.maxAgeMs ?? 30_000;
  const maxSkew = options.maxSkewMs ?? 5_000;

  if (req.timestamp - now > maxSkew) return { ok: false, reason: "future" };
  if (now - req.timestamp > maxAge) return { ok: false, reason: "expired" };

  const expected = computeSignature(secret, req.payload, req.timestamp, req.nonce);
  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(req.signature, "hex");
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return { ok: false, reason: "bad_signature" };
  }

  if (nonces.has(req.nonce, now)) return { ok: false, reason: "replayed" };
  nonces.remember(req.nonce, now);
  return { ok: true };
}