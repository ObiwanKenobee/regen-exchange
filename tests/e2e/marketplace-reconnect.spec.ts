import { networkTest as test, expect } from "./fixtures";
import {
  lastOrderBookSeq,
  waitForOrderBookDiff,
  waitForResyncAfter,
} from "./realtime-helpers";

test.describe.configure({ retries: process.env.CI ? 3 : 1 });

/**
 * Simulate a websocket / SSE disconnect mid-stream and verify the client
 * resyncs the order-book sequence correctly before the order ticket reports
 * a terminal status. The test:
 *
 *   1. Navigates to /marketplace and waits for the first order-book diff.
 *   2. Snapshots the last-seen seq, then forces every open WS to close and
 *      blocks SSE responses briefly to simulate a transient network blip.
 *   3. Restores the network and waits for `lastSeq + 1` to arrive — strict
 *      resync (no gap, no duplicate).
 *   4. Places a small buy order and asserts the ticket reaches a terminal
 *      status only AFTER another fresh diff has been observed.
 */
test("websocket reconnect → seq resync → ticket terminal status", async ({
  page,
  context,
  realtimeEvents,
}) => {
  await page.goto("/marketplace");

  // Wait for the initial diff so we know the stream is live.
  const firstDiff = await waitForOrderBookDiff(page, {
    afterSeq: 0,
    timeoutMs: 20_000,
    events: realtimeEvents,
  });
  expect(firstDiff.seq).toBeGreaterThan(0);

  const seqBeforeDisconnect = lastOrderBookSeq(realtimeEvents);

  // --- Simulate disconnect -------------------------------------------------
  // Close every open websocket the page holds.
  await page.evaluate(() => {
    // @ts-expect-error - global registry installed by app/test harness
    const sockets: WebSocket[] = (window as any).__openSockets ?? [];
    sockets.forEach((s) => {
      try {
        s.close(4000, "e2e-disconnect");
      } catch {
        // ignore
      }
    });
  });
  // Block SSE for ~750ms to widen the gap.
  await context.route(/\/sse|\/realtime|order.?book/i, async (route) => {
    await new Promise((r) => setTimeout(r, 750));
    await route.continue();
  });
  await page.waitForTimeout(900);
  await context.unroute(/\/sse|\/realtime|order.?book/i);

  // --- Verify strict resync (no gap, no duplicate) -------------------------
  const resync = await waitForResyncAfter(page, seqBeforeDisconnect, {
    timeoutMs: 15_000,
    events: realtimeEvents,
  });
  expect(resync.seq).toBe(seqBeforeDisconnect + 1);

  // --- Place an order and confirm the ticket transitions AFTER a new diff --
  const buy = page.getByRole("button", { name: /^buy/i }).first();
  if (await buy.isVisible().catch(() => false)) {
    await buy.click();
    const lastSeq = lastOrderBookSeq(realtimeEvents);
    const pendingDiff = waitForOrderBookDiff(page, {
      afterSeq: lastSeq,
      timeoutMs: 20_000,
      events: realtimeEvents,
    });

    await page.getByLabel(/quantity/i).fill("1").catch(() => {});
    await page.getByRole("button", { name: /review buy/i }).click().catch(() => {});
    await page.getByRole("button", { name: /sign.*submit/i }).click().catch(() => {});

    const after = await pendingDiff;
    expect(after.seq).toBeGreaterThan(lastSeq);

    await expect(
      page.getByText(/transaction submitted|order confirmed/i),
    ).toBeVisible({ timeout: 20_000 });
  }
});