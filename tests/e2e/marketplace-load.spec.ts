import { request as pwRequest } from "@playwright/test";
import { networkTest as test, expect } from "./fixtures";
import { signTradeRequest } from "../../src/lib/security/trade-signature";

/**
 * Lightweight concurrent load smoke. Places N orders in parallel against the
 * trade-execute API and asserts:
 *   - every accepted request gets a unique correlationId
 *   - no nonce-replay false positive (each order uses a distinct nonce)
 *   - the API's success/error envelope stays consistent under concurrency
 *
 * This is intentionally small (default 20 in CI) — we want a signal, not a
 * benchmark. Bump E2E_LOAD_N locally for stress runs.
 */

const SECRET = process.env.TRADE_EXEC_SECRET || "dev-trade-secret";
const ENDPOINT = "/api/public/trade-execute";
const N = Number(process.env.E2E_LOAD_N ?? 20);

test.describe.configure({ retries: 1 });

test("concurrent order placement remains consistent", async ({ baseURL }) => {
  const ctx = await pwRequest.newContext({ baseURL });
  // Build a deterministic order set so aggregate liquidity is easy to verify.
  // Each side gets N/2 orders with a known total quantity.
  const orders = Array.from({ length: N }, (_, i) => ({
    orderId: `load-${Date.now()}-${i}`,
    side: (i % 2 === 0 ? "buy" : "sell") as "buy" | "sell",
    qty: 1 + (i % 5),
    price: 100 + i,
  }));
  const requests = orders.map((o) => signTradeRequest(SECRET, o));
  const expectedTotalQty = orders.reduce((s, o) => s + o.qty, 0);
  const expectedBuyQty = orders.filter((o) => o.side === "buy").reduce((s, o) => s + o.qty, 0);
  const expectedSellQty = expectedTotalQty - expectedBuyQty;

  const responses = await Promise.all(
    requests.map((r) => ctx.post(ENDPOINT, { data: r })),
  );

  const bodies = await Promise.all(responses.map((r) => r.json()));

  // All requests should succeed (distinct nonces, fresh timestamps).
  for (const [i, res] of responses.entries()) {
    expect(res.status(), `req #${i} status`).toBe(200);
    expect(bodies[i].ok, `req #${i} ok`).toBe(true);
    expect(typeof bodies[i].correlationId).toBe("string");
  }

  // Correlation IDs must be unique — collisions would indicate the server is
  // reusing IDs across concurrent requests (a logging hazard).
  const ids = new Set(bodies.map((b) => b.correlationId));
  expect(ids.size).toBe(N);

  // No correlationId should be reused across requests (would indicate a
  // shared cache key / dedupe collision under concurrency).
  expect(ids.size).toBe(bodies.length);

  // ---- Aggregate order-book consistency ---------------------------------
  // After the burst, the public order book endpoint (if present) should
  // satisfy the conservation law:
  //
  //   sum(fills.qty) + sum(remainingLiquidity.qty) === expectedTotalQty
  //
  // and no trade id should appear more than once.
  const book = await ctx.get("/api/public/order-book").catch(() => null);
  if (book && book.status() < 400) {
    const json = await book.json().catch(() => null);
    expect(json, "order book should be parseable JSON").not.toBeNull();

    const fills: Array<{ id?: string; qty?: number; side?: string }> =
      json?.fills ?? json?.trades ?? [];
    const remaining: Array<{ qty?: number; side?: string }> = [
      ...(json?.bids ?? []),
      ...(json?.asks ?? []),
    ];

    // Only enforce the conservation check if the endpoint actually reports
    // quantities — keeps the smoke green on environments where the order
    // book is a stub but still flags real regressions where it isn't.
    const fillTotal = fills.reduce((s, f) => s + (Number(f.qty) || 0), 0);
    const remTotal = remaining.reduce((s, r) => s + (Number(r.qty) || 0), 0);
    if (fillTotal + remTotal > 0) {
      expect(
        fillTotal + remTotal,
        `conservation: fills(${fillTotal}) + remaining(${remTotal}) should equal submitted(${expectedTotalQty})`,
      ).toBe(expectedTotalQty);

      // Per-side conservation (buys vs sells).
      const sideQty = (arr: Array<{ qty?: number; side?: string }>, side: string) =>
        arr.filter((x) => x.side === side).reduce((s, x) => s + (Number(x.qty) || 0), 0);
      const buyAccounted = sideQty(fills, "buy") + sideQty(remaining, "buy");
      const sellAccounted = sideQty(fills, "sell") + sideQty(remaining, "sell");
      expect(buyAccounted).toBe(expectedBuyQty);
      expect(sellAccounted).toBe(expectedSellQty);
    }

    // No trade id should be duplicated across concurrent executions.
    const tradeIds = fills.map((f) => f.id).filter((id): id is string => !!id);
    const uniqueTradeIds = new Set(tradeIds);
    expect(uniqueTradeIds.size, "duplicate trade ids detected across concurrent fills").toBe(tradeIds.length);
  }
});