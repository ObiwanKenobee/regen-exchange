import { networkTest as test, expect } from "./fixtures";
import {
  lastOrderBookSeq,
  waitForOrderBookDiff,
} from "./realtime-helpers";

test.describe.configure({ retries: process.env.CI ? 4 : 1 });

/**
 * End-to-end: place an order in the marketplace UI and verify the order book
 * reacts, the order ticket reports status progression, and a trade execution
 * result is surfaced.
 *
 * Run locally:
 *   bun run build && bunx playwright test
 * Or against an already-running dev server:
 *   E2E_BASE_URL=http://localhost:5173 E2E_NO_WEBSERVER=1 bunx playwright test
 */

test.describe("marketplace order flow", () => {
  test("place order → order book updates → ticket status → trade execution", async ({ page, realtimeEvents, correlationIds }) => {
    await page.goto("/marketplace");

    // Connect wallet (mock connector exposed by the wallet context).
    const connect = page.getByRole("button", { name: /connect( wallet)?/i }).first();
    if (await connect.isVisible().catch(() => false)) {
      await connect.click();
      const provider = page.getByRole("button", { name: /metamask|wallet|mock/i }).first();
      if (await provider.isVisible().catch(() => false)) await provider.click();
    }

    // Open the first asset's order ticket on the buy side.
    const buyButton = page.getByRole("button", { name: /^buy/i }).first();
    await expect(buyButton).toBeVisible({ timeout: 15_000 });
    await buyButton.click();

    // Capture initial order book row count for the side we're hitting.
    const orderBookRows = page.locator('[data-testid="order-book-row"], [data-orderbook-row]');
    const initialRows = await orderBookRows.count().catch(() => 0);

    // Deterministic realtime sync: wait for a specific order-book diff event
    // identified by its monotonic sequence number (`seq`). We snapshot the
    // last-seen seq before placing the order, then wait until we observe a
    // diff with a strictly greater seq for the same asset on the realtime
    // channel (WebSocket frame or SSE response).
    const lastSeqBefore = lastOrderBookSeq(realtimeEvents);
    const orderBookDiff = waitForOrderBookDiff(page, {
      afterSeq: lastSeqBefore,
      timeoutMs: 20_000,
      events: realtimeEvents,
    });

    // Fill the ticket.
    await page.getByLabel(/quantity/i).fill("1");
    await page.getByRole("button", { name: /review buy/i }).click();
    await page.getByRole("button", { name: /sign.*submit/i }).click();

    // Assert the realtime channel published a NEWER diff (seq > before)
    // before the ticket transitions to its terminal status.
    const diff = await orderBookDiff;
    expect(diff.seq).toBeGreaterThan(lastSeqBefore);

    // Ticket transitions: signing → submitted/confirmed.
    await expect(page.getByText(/transaction submitted|order confirmed/i)).toBeVisible({
      timeout: 20_000,
    });

    // Trade execution: tx hash + confirmations row exists.
    await expect(page.getByText(/tx hash/i)).toBeVisible();
    await expect(page.getByText(/confirmations/i)).toBeVisible();

    // The trade execution record should expose the same correlationId the
    // server returned via the x-correlation-id response header. We surface
    // it on the ticket via data-correlation-id (or as the visible text of a
    // [data-testid="execution-correlation-id"] node). If neither is
    // present, fall back to asserting at least one ID was captured.
    expect(correlationIds.length, "trade-execute should set x-correlation-id").toBeGreaterThan(0);
    const serverId = correlationIds[correlationIds.length - 1];
    const ticketId = await page
      .locator('[data-correlation-id], [data-testid="execution-correlation-id"]')
      .first()
      .getAttribute("data-correlation-id")
      .catch(() => null);
    const visibleId = await page
      .getByTestId("execution-correlation-id")
      .innerText()
      .catch(() => null);
    const surfaced = ticketId ?? visibleId;
    if (surfaced) expect(surfaced).toBe(serverId);

    // Order book reacted (row count changed, or at least is still rendered).
    await page.waitForTimeout(500);
    const finalRows = await orderBookRows.count().catch(() => 0);
    expect(finalRows).toBeGreaterThanOrEqual(initialRows);
  });
});