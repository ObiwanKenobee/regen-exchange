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
  const requests = Array.from({ length: N }, (_, i) =>
    signTradeRequest(SECRET, {
      orderId: `load-${Date.now()}-${i}`,
      side: i % 2 === 0 ? "buy" : "sell",
      qty: 1 + (i % 5),
      price: 100 + i,
    }),
  );

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

  // Order-book consistency check: after the burst, the public order book
  // endpoint (if present) should still respond 2xx and return parseable JSON.
  const book = await ctx.get("/api/public/order-book").catch(() => null);
  if (book && book.status() < 400) {
    const json = await book.json().catch(() => null);
    expect(json, "order book should be parseable JSON").not.toBeNull();
  }
});