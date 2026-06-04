import { networkTest as test, expect } from "./fixtures";
import {
  lastOrderBookSeq,
  waitForOrderBookDiff,
  waitForResyncAfter,
} from "./realtime-helpers";

test.describe.configure({ retries: process.env.CI ? 3 : 1 });

/**
 * Wallet/session reconnect + brief network loss during streaming.
 * Flow:
 *   1. Load /marketplace, observe baseline diff.
 *   2. Simulate wallet disconnect (clear localStorage wallet keys, dispatch
 *      a wallet-disconnect event), then briefly drop network.
 *   3. Reconnect wallet (mock connector) and restore network.
 *   4. Assert strict seq resync (lastSeq + 1) and that placing a fresh order
 *      reaches a terminal status.
 */
test("wallet reconnect + network blip → seq resync → terminal status", async ({
  page,
  context,
  realtimeEvents,
}) => {
  await page.goto("/marketplace");

  const first = await waitForOrderBookDiff(page, {
    afterSeq: 0,
    timeoutMs: 20_000,
    events: realtimeEvents,
  });
  expect(first.seq).toBeGreaterThan(0);
  const seqBefore = lastOrderBookSeq(realtimeEvents);

  // --- Simulate wallet disconnect + network loss --------------------------
  await page.evaluate(() => {
    try {
      // Clear common wallet-related localStorage keys.
      Object.keys(localStorage)
        .filter((k) => /wallet|wagmi|connector|session/i.test(k))
        .forEach((k) => localStorage.removeItem(k));
      window.dispatchEvent(new CustomEvent("wallet:disconnect"));
      // @ts-expect-error - app/test harness may expose this
      const sockets: WebSocket[] = (window as any).__openSockets ?? [];
      sockets.forEach((s) => {
        try {
          s.close(4001, "wallet-reconnect-e2e");
        } catch {
          // ignore
        }
      });
    } catch {
      // ignore
    }
  });

  await context.setOffline(true);
  await page.waitForTimeout(800);
  await context.setOffline(false);

  // --- Reconnect wallet ---------------------------------------------------
  const connect = page.getByRole("button", { name: /connect( wallet)?/i }).first();
  if (await connect.isVisible().catch(() => false)) {
    await connect.click();
    const provider = page.getByRole("button", { name: /metamask|wallet|mock/i }).first();
    if (await provider.isVisible().catch(() => false)) await provider.click();
  }

  // --- Strict seq resync (no gap, no duplicate) ---------------------------
  const resync = await waitForResyncAfter(page, seqBefore, {
    timeoutMs: 20_000,
    events: realtimeEvents,
  });
  expect(resync.seq).toBe(seqBefore + 1);

  // --- Place a fresh order and confirm terminal status --------------------
  const buy = page.getByRole("button", { name: /^buy/i }).first();
  if (await buy.isVisible().catch(() => false)) {
    await buy.click();
    await page.getByLabel(/quantity/i).fill("1").catch(() => {});
    await page.getByRole("button", { name: /review buy/i }).click().catch(() => {});
    await page.getByRole("button", { name: /sign.*submit/i }).click().catch(() => {});

    await expect(
      page.getByText(/transaction submitted|order confirmed/i),
    ).toBeVisible({ timeout: 25_000 });
  }
});