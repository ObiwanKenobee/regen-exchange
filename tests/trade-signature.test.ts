import { describe, it, expect } from "vitest";
import {
  signTradeRequest,
  verifyTradeRequest,
  NonceStore,
  computeSignature,
} from "@/lib/security/trade-signature";

const SECRET = "trade-exec-secret-aaaaaaaaaaaaaaaaaaaaaaaa";
const payload = { orderId: "o-1", side: "buy", qty: 10, price: 42 };

describe("trade execution signature", () => {
  it("verifies a freshly signed request", () => {
    const req = signTradeRequest(SECRET, payload);
    expect(verifyTradeRequest(SECRET, req, new NonceStore())).toEqual({ ok: true });
  });

  it("rejects tampered payloads", () => {
    const req = signTradeRequest(SECRET, payload);
    const tampered = { ...req, payload: { ...payload, qty: 9999 } };
    expect(verifyTradeRequest(SECRET, tampered, new NonceStore())).toEqual({
      ok: false,
      reason: "bad_signature",
    });
  });

  it("rejects requests signed with the wrong secret", () => {
    const req = signTradeRequest("attacker-secret", payload);
    expect(verifyTradeRequest(SECRET, req, new NonceStore()).ok).toBe(false);
  });

  it("rejects expired timestamps (replay outside the window)", () => {
    const now = 1_700_000_000_000;
    const req = signTradeRequest(SECRET, payload, { timestamp: now - 60_000 });
    expect(verifyTradeRequest(SECRET, req, new NonceStore(), { now: () => now })).toEqual({
      ok: false,
      reason: "expired",
    });
  });

  it("rejects timestamps from the far future", () => {
    const now = 1_700_000_000_000;
    const req = signTradeRequest(SECRET, payload, { timestamp: now + 60_000 });
    expect(verifyTradeRequest(SECRET, req, new NonceStore(), { now: () => now })).toEqual({
      ok: false,
      reason: "future",
    });
  });

  it("prevents nonce replay even within the time window", () => {
    const store = new NonceStore();
    const req = signTradeRequest(SECRET, payload, { nonce: "nonce-fixed-1" });
    expect(verifyTradeRequest(SECRET, req, store)).toEqual({ ok: true });
    expect(verifyTradeRequest(SECRET, req, store)).toEqual({ ok: false, reason: "replayed" });
  });

  it("derives deterministic signatures for the same inputs", () => {
    const s1 = computeSignature(SECRET, payload, 1700000000000, "n-1");
    const s2 = computeSignature(SECRET, payload, 1700000000000, "n-1");
    expect(s1).toBe(s2);
  });
});