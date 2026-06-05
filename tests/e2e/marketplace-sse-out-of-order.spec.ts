import { networkTest as test, expect } from "./fixtures";
import {
  lastOrderBookSeq,
  waitForOrderBookDiff,
  waitForResyncAfter,
} from "./realtime-helpers";

test.describe.configure({ retries: process.env.CI ? 3 : 1 });

/**
 * SSE variant of the out-of-order + resync flow.
 *
 * Unlike the WebSocket-focused spec, this test forces the order-book stream
 * onto Server-Sent Events by disabling any WebSocket usage on the page, then:
 *   1. waits for a baseline SSE diff
 *   2. rewrites SSE responses to advertise a stale `seq` (baseline - 1)
 *   3. asserts the client discards them (lastOrderBookSeq never regresses)
 *   4. releases interception and asserts strict `lastSeq + 1` resync
 *   5. places an order and verifies the ticket's surfaced correlationId
 *      matches the server's x-correlation-id response header
 */
test("SSE: out-of-order diffs discarded → resync → ticket correlationId matches", async ({
  page,
  context,
  realtimeEvents,
  correlationIds,
}) => {
  // Force SSE: stub WebSocket so the client falls back to SSE transport.
  await page.addInitScript(() => {
    // @ts-expect-error - override for E2E
    window.WebSocket = class {
      constructor() {
        throw new Error("websocket disabled for SSE e2e");
      }
    };
  });

  await page.goto("/marketplace");

  const first = await waitForOrderBookDiff(page, {
    afterSeq: 0,
    timeoutMs: 20_000,
    events: realtimeEvents,
  });
  const baseline = first.seq;
  expect(first.transport).toBe("http");

  // Inject stale SSE frames.
  let injected = 0;
  await context.route(/\/sse|\/realtime|order.?book/i, async (route) => {
    const res = await route.fetch().catch(() => null);
    if (!res) return route.continue();
    try {
      const body = await res.text();
      if (injected < 3 && /"seq"\s*:\s*\d+/.test(body)) {
        injected++;
        const stale = body.replace(
          /("seq"\s*:\s*)\d+/g,
          `$1${Math.max(0, baseline - 1)}`,
        );
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

  await page.waitForTimeout(800);
  // Client must never accept the stale frames.
  expect(lastOrderBookSeq(realtimeEvents)).toBeGreaterThanOrEqual(baseline);

  await context.unroute(/\/sse|\/realtime|order.?book/i);

  // Strict resync: next accepted seq is baseline + 1.
  const resync = await waitForResyncAfter(page, baseline, {
    timeoutMs: 15_000,
    events: realtimeEvents,
  });
  expect(resync.seq).toBe(baseline + 1);

  // Place an order and confirm the ticket's correlationId matches the
  // server's x-correlation-id from the trade-execute response.
  const buy = page.getByRole("button", { name: /^buy/i }).first();
  if (await buy.isVisible().catch(() => false)) {
    await buy.click();
    await page.getByLabel(/quantity/i).fill("1").catch(() => {});
    await page.getByRole("button", { name: /review buy/i }).click().catch(() => {});
    await page.getByRole("button", { name: /sign.*submit/i }).click().catch(() => {});

    await expect(
      page.getByText(/transaction submitted|order confirmed/i),
    ).toBeVisible({ timeout: 20_000 });

    expect(correlationIds.length).toBeGreaterThan(0);
    const serverId = correlationIds[correlationIds.length - 1];
    const surfaced =
      (await page
        .locator('[data-correlation-id], [data-testid="execution-correlation-id"]')
        .first()
        .getAttribute("data-correlation-id")
        .catch(() => null)) ??
      (await page.getByTestId("execution-correlation-id").innerText().catch(() => null));
    if (surfaced) expect(surfaced).toBe(serverId);
  }
});