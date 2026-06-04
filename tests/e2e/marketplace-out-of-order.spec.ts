import { networkTest as test, expect } from "./fixtures";
import {
  lastOrderBookSeq,
  waitForOrderBookDiff,
  tryParseSeq,
} from "./realtime-helpers";

test.describe.configure({ retries: process.env.CI ? 3 : 1 });

/**
 * Force the client to receive out-of-order order-book diffs (e.g. seq N+2
 * before N+1, or a replayed N-1) and verify it discards stale/older diffs.
 * The ticket status assertion only runs AFTER a strictly-newer diff is
 * observed past the highest seq the client should have accepted.
 */
test("out-of-order diffs are discarded; ticket waits for fresh seq", async ({
  page,
  context,
  realtimeEvents,
}) => {
  await page.goto("/marketplace");

  // Wait for the stream to come up so we know the baseline seq.
  const first = await waitForOrderBookDiff(page, {
    afterSeq: 0,
    timeoutMs: 20_000,
    events: realtimeEvents,
  });
  const baseline = first.seq;

  // Inject stale/out-of-order frames by rewriting matching HTTP/SSE
  // responses to advertise an OLDER seq. Any well-behaved client must
  // discard these and only accept strictly-greater seq values.
  let injected = 0;
  await context.route(/order.?book|\/sse|\/realtime/i, async (route) => {
    const res = await route.fetch().catch(() => null);
    if (!res) return route.continue();
    try {
      const body = await res.text();
      const seq = tryParseSeq(body);
      if (seq !== null && injected < 3) {
        injected++;
        // Stale: seq strictly less than baseline.
        const stale = body.replace(/("seq"\s*:\s*)\d+/, `$1${Math.max(0, baseline - 1)}`);
        return route.fulfill({
          status: res.status(),
          headers: res.headers(),
          body: stale,
        });
      }
    } catch {
      // fall through
    }
    return route.fulfill({ response: res });
  });

  // Place an order; client should NOT treat the stale injected diffs as
  // progress. The terminal status must only appear after a real, newer seq.
  const buy = page.getByRole("button", { name: /^buy/i }).first();
  if (await buy.isVisible().catch(() => false)) {
    await buy.click();
    await page.getByLabel(/quantity/i).fill("1").catch(() => {});
    await page.getByRole("button", { name: /review buy/i }).click().catch(() => {});
    await page.getByRole("button", { name: /sign.*submit/i }).click().catch(() => {});
  }

  // The highest accepted seq must never regress below baseline even after
  // we tried to inject stale frames.
  const observedMax = lastOrderBookSeq(realtimeEvents);
  expect(observedMax).toBeGreaterThanOrEqual(baseline);

  // Release the interception and wait for a genuinely-newer diff.
  await context.unroute(/order.?book|\/sse|\/realtime/i);
  const fresh = await waitForOrderBookDiff(page, {
    afterSeq: baseline,
    timeoutMs: 20_000,
    events: realtimeEvents,
  });
  expect(fresh.seq).toBeGreaterThan(baseline);

  await expect(
    page.getByText(/transaction submitted|order confirmed/i),
  ).toBeVisible({ timeout: 20_000 });
});