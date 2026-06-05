import { request as pwRequest } from "@playwright/test";
import { networkTest as test, expect } from "./fixtures";
import { signTradeRequest } from "../../src/lib/security/trade-signature";
import { lastOrderBookSeq, waitForOrderBookDiff } from "./realtime-helpers";
import { loadPerfBudgets } from "./perf-budgets";

/**
 * Load smoke with performance guardrails. In addition to the conservation +
 * no-duplicate-trade-id checks from marketplace-load, this spec captures two
 * regression budgets that CI can fail on:
 *
 *   - MAX_TTS_MS: max time-to-terminal-status for a UI-placed order while
 *     the API is under concurrent load.
 *   - MAX_DIFF_LAG_MS: max wall-clock gap between consecutive accepted
 *     order-book diffs (proxy for streaming backpressure).
 *
 * Budgets are overridable via env for local tuning; defaults are intentionally
 * generous and only meant to catch order-of-magnitude regressions.
 */

const SECRET = process.env.TRADE_EXEC_SECRET || "dev-trade-secret";
const ENDPOINT = "/api/public/trade-execute";
const N = Number(process.env.E2E_PERF_LOAD_N ?? 50);
// Fail fast if E2E_MAX_TTS_MS / E2E_MAX_DIFF_LAG_MS are set but malformed.
// loadPerfBudgets() throws with an actionable message in that case so CI
// surfaces the configuration error instead of silently using NaN budgets.
const { maxTtsMs: MAX_TTS_MS, maxDiffLagMs: MAX_DIFF_LAG_MS } = loadPerfBudgets();

test.describe.configure({ retries: 1 });

test("load smoke: perf guardrails + conservation + no duplicate trade IDs", async ({
  page,
  baseURL,
  realtimeEvents,
}, testInfo) => {
  await page.goto("/marketplace");

  // Wait for the stream to come up so we can measure diff lag.
  await waitForOrderBookDiff(page, {
    afterSeq: 0,
    timeoutMs: 20_000,
    events: realtimeEvents,
  });

  // Fire the load burst against the API in parallel with the UI flow.
  const ctx = await pwRequest.newContext({ baseURL });
  const orders = Array.from({ length: N }, (_, i) => ({
    orderId: `perf-${Date.now()}-${i}`,
    side: (i % 2 === 0 ? "buy" : "sell") as "buy" | "sell",
    qty: 1 + (i % 5),
    price: 100 + i,
  }));
  const expectedTotalQty = orders.reduce((s, o) => s + o.qty, 0);
  const expectedBuyQty = orders.filter((o) => o.side === "buy").reduce((s, o) => s + o.qty, 0);
  const expectedSellQty = expectedTotalQty - expectedBuyQty;

  const burst = Promise.all(
    orders.map((o, i) =>
      new Promise<Awaited<ReturnType<typeof ctx.post>>>((resolve) =>
        setTimeout(() => resolve(ctx.post(ENDPOINT, { data: signTradeRequest(SECRET, o) })), i * 20),
      ),
    ),
  );

  // --- UI guardrail: time-to-terminal-status under load --------------------
  const buy = page.getByRole("button", { name: /^buy/i }).first();
  await expect(buy).toBeVisible({ timeout: 15_000 });
  await buy.click();
  await page.getByLabel(/quantity/i).fill("1");
  await page.getByRole("button", { name: /review buy/i }).click();

  const t0 = Date.now();
  await page.getByRole("button", { name: /sign.*submit/i }).click();
  await expect(
    page.getByText(/transaction submitted|order confirmed/i),
  ).toBeVisible({ timeout: MAX_TTS_MS + 5_000 });
  const tts = Date.now() - t0;

  // --- Realtime guardrail: max gap between consecutive accepted diffs ------
  const responses = await burst;
  await page.waitForTimeout(1_000);

  const diffTimes: number[] = [];
  let lastSeq = 0;
  for (const ev of realtimeEvents) {
    try {
      const obj = JSON.parse(ev.preview);
      const seq =
        typeof obj?.seq === "number" ? obj.seq : typeof obj?.sequence === "number" ? obj.sequence : null;
      if (typeof seq === "number" && seq > lastSeq) {
        diffTimes.push(ev.at);
        lastSeq = seq;
      }
    } catch {
      // ignore non-JSON frames
    }
  }
  let maxLag = 0;
  for (let i = 1; i < diffTimes.length; i++) {
    maxLag = Math.max(maxLag, diffTimes[i] - diffTimes[i - 1]);
  }

  // --- Guardrail assertions ------------------------------------------------
  const summary = {
    browser: testInfo.project.name,
    orders: N,
    timeToTerminalStatusMs: tts,
    maxTtsBudgetMs: MAX_TTS_MS,
    maxOrderBookDiffLagMs: maxLag,
    maxLagBudgetMs: MAX_DIFF_LAG_MS,
    acceptedDiffs: diffTimes.length,
    lastSeq,
  };
  // Concise perf summary -> stdout (CI logs) and HTML report attachment.
  // eslint-disable-next-line no-console
  console.log(`[perf-summary] ${JSON.stringify(summary)}`);
  await testInfo.attach("perf-summary.json", {
    body: Buffer.from(JSON.stringify(summary, null, 2)),
    contentType: "application/json",
  });

  expect(
    tts,
    `time-to-terminal-status ${tts}ms exceeded budget ${MAX_TTS_MS}ms`,
  ).toBeLessThanOrEqual(MAX_TTS_MS);

  if (diffTimes.length >= 2) {
    expect(
      maxLag,
      `max order-book diff lag ${maxLag}ms exceeded budget ${MAX_DIFF_LAG_MS}ms`,
    ).toBeLessThanOrEqual(MAX_DIFF_LAG_MS);
  }

  // --- Conservation + no-duplicate trade IDs still hold --------------------
  const bodies = await Promise.all(responses.map((r) => r.json().catch(() => ({}))));
  const ids = new Set(bodies.map((b) => b?.correlationId).filter(Boolean));
  expect(ids.size).toBe(bodies.filter((b) => b?.ok).length);

  const book = await ctx.get("/api/public/order-book").catch(() => null);
  if (book && book.status() < 400) {
    const json = await book.json().catch(() => null);
    if (json) {
      const fills: Array<{ id?: string; qty?: number; side?: string }> =
        json?.fills ?? json?.trades ?? [];
      const remaining: Array<{ qty?: number; side?: string }> = [
        ...(json?.bids ?? []),
        ...(json?.asks ?? []),
      ];
      const fillTotal = fills.reduce((s, f) => s + (Number(f.qty) || 0), 0);
      const remTotal = remaining.reduce((s, r) => s + (Number(r.qty) || 0), 0);
      if (fillTotal + remTotal > 0) {
        expect(fillTotal + remTotal).toBe(expectedTotalQty);
        const sideQty = (arr: Array<{ qty?: number; side?: string }>, side: string) =>
          arr.filter((x) => x.side === side).reduce((s, x) => s + (Number(x.qty) || 0), 0);
        expect(sideQty(fills, "buy") + sideQty(remaining, "buy")).toBe(expectedBuyQty);
        expect(sideQty(fills, "sell") + sideQty(remaining, "sell")).toBe(expectedSellQty);
      }
      const tradeIds = fills.map((f) => f.id).filter((id): id is string => !!id);
      expect(new Set(tradeIds).size).toBe(tradeIds.length);
    }
  }

  // Used for downstream debugging via attached realtime-events.json.
  expect(lastOrderBookSeq(realtimeEvents)).toBeGreaterThan(0);
});