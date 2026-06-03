import { test, expect, request as pwRequest } from "@playwright/test";
import {
  signTradeRequest,
  computeSignature,
} from "../../src/lib/security/trade-signature";

const SECRET = process.env.TRADE_EXEC_SECRET || "dev-trade-secret";
const ENDPOINT = "/api/public/trade-execute";

const samplePayload = { orderId: "e2e-o-1", side: "buy", qty: 1, price: 100 };

test.describe("trade-execute API — signature/nonce/timestamp guards", () => {
  test("accepts a well-formed signed request", async ({ baseURL }) => {
    const ctx = await pwRequest.newContext({ baseURL });
    const signed = signTradeRequest(SECRET, { ...samplePayload, orderId: "ok-1" });
    const res = await ctx.post(ENDPOINT, { data: signed });
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  test("rejects replayed nonce with 409", async ({ baseURL }) => {
    const ctx = await pwRequest.newContext({ baseURL });
    const signed = signTradeRequest(SECRET, { ...samplePayload, orderId: "replay-1" });
    const first = await ctx.post(ENDPOINT, { data: signed });
    expect(first.status()).toBe(200);
    const replay = await ctx.post(ENDPOINT, { data: signed });
    expect(replay.status()).toBe(409);
    expect(await replay.json()).toMatchObject({ ok: false, error: "replayed" });
  });

  test("rejects wrong/forged signature with 401", async ({ baseURL }) => {
    const ctx = await pwRequest.newContext({ baseURL });
    const signed = signTradeRequest(SECRET, { ...samplePayload, orderId: "forged-1" });
    // Recompute signature against a different secret → mismatch.
    const forgedSignature = computeSignature(
      "attacker-secret",
      signed.payload,
      signed.timestamp,
      signed.nonce,
    );
    const res = await ctx.post(ENDPOINT, {
      data: { ...signed, signature: forgedSignature },
    });
    expect(res.status()).toBe(401);
    expect(await res.json()).toMatchObject({ ok: false, error: "bad_signature" });
  });

  test("rejects stale timestamp with 410", async ({ baseURL }) => {
    const ctx = await pwRequest.newContext({ baseURL });
    const stale = signTradeRequest(SECRET, { ...samplePayload, orderId: "stale-1" }, {
      timestamp: Date.now() - 5 * 60_000,
    });
    const res = await ctx.post(ENDPOINT, { data: stale });
    expect(res.status()).toBe(410);
    expect(await res.json()).toMatchObject({ ok: false, error: "expired" });
  });

  test("rejects future-skewed timestamp with 400", async ({ baseURL }) => {
    const ctx = await pwRequest.newContext({ baseURL });
    const future = signTradeRequest(SECRET, { ...samplePayload, orderId: "future-1" }, {
      timestamp: Date.now() + 5 * 60_000,
    });
    const res = await ctx.post(ENDPOINT, { data: future });
    expect(res.status()).toBe(400);
    expect(await res.json()).toMatchObject({ ok: false, error: "future" });
  });
});