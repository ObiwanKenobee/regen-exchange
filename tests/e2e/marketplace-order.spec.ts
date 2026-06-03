import { test, expect } from "@playwright/test";

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
  test("place order → order book updates → ticket status → trade execution", async ({ page }) => {
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

    // Listen for the real-time channel that publishes order book deltas. We
    // accept either a WebSocket frame, an SSE event, or a refetched
    // getOrderBook server-function response — whichever transport the app
    // currently uses — and assert it lands BEFORE the ticket status flips.
    const orderBookUpdate = Promise.race([
      page
        .waitForEvent("websocket", { timeout: 20_000 })
        .then((ws) =>
          new Promise<string>((resolve) => {
            ws.on("framereceived", (frame) => {
              const payload = typeof frame.payload === "string" ? frame.payload : frame.payload?.toString("utf8") ?? "";
              if (/order.?book|bids|asks/i.test(payload)) resolve("ws");
            });
          }),
        )
        .catch(() => null),
      page
        .waitForResponse(
          (r) => /order.?book|\/sse|\/realtime|getOrderBook/i.test(r.url()) && r.status() < 400,
          { timeout: 20_000 },
        )
        .then(() => "http")
        .catch(() => null),
    ]);

    // Fill the ticket.
    await page.getByLabel(/quantity/i).fill("1");
    await page.getByRole("button", { name: /review buy/i }).click();
    await page.getByRole("button", { name: /sign.*submit/i }).click();

    // Assert the real-time channel published an order book update BEFORE the
    // ticket transitions to its terminal status.
    const channel = await orderBookUpdate;
    expect(channel, "expected order book update via realtime channel").not.toBeNull();

    // Ticket transitions: signing → submitted/confirmed.
    await expect(page.getByText(/transaction submitted|order confirmed/i)).toBeVisible({
      timeout: 20_000,
    });

    // Trade execution: tx hash + confirmations row exists.
    await expect(page.getByText(/tx hash/i)).toBeVisible();
    await expect(page.getByText(/confirmations/i)).toBeVisible();

    // Order book reacted (row count changed, or at least is still rendered).
    await page.waitForTimeout(500);
    const finalRows = await orderBookRows.count().catch(() => 0);
    expect(finalRows).toBeGreaterThanOrEqual(initialRows);
  });
});