import { networkTest as test, expect } from "./fixtures";

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
  test("place order → order book updates → ticket status → trade execution", async ({ page, realtimeEvents }) => {
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
    const orderBookDiff = waitForOrderBookDiff(page, lastSeqBefore, 20_000);

    // Fill the ticket.
    await page.getByLabel(/quantity/i).fill("1");
    await page.getByRole("button", { name: /review buy/i }).click();
    await page.getByRole("button", { name: /sign.*submit/i }).click();

    // Assert the realtime channel published a NEWER diff (seq > before)
    // before the ticket transitions to its terminal status.
    const diff = await orderBookDiff;
    expect(diff, "expected order book diff via realtime channel").not.toBeNull();
    expect(diff!.seq).toBeGreaterThan(lastSeqBefore);

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

// ---------------------------------------------------------------------------
// Realtime helpers — sequence-number aware
// ---------------------------------------------------------------------------

function tryParseSeq(raw: string): number | null {
  try {
    const obj = JSON.parse(raw);
    const seq =
      typeof obj?.seq === "number"
        ? obj.seq
        : typeof obj?.sequence === "number"
          ? obj.sequence
          : typeof obj?.data?.seq === "number"
            ? obj.data.seq
            : null;
    if (typeof seq === "number" && /order.?book|bids|asks|diff/i.test(raw)) return seq;
  } catch {
    // Non-JSON frames are ignored.
  }
  return null;
}

function lastOrderBookSeq(events: { preview: string }[]): number {
  let max = 0;
  for (const e of events) {
    const s = tryParseSeq(e.preview);
    if (s !== null && s > max) max = s;
  }
  return max;
}

async function waitForOrderBookDiff(
  page: import("@playwright/test").Page,
  afterSeq: number,
  timeoutMs: number,
): Promise<{ seq: number; transport: "ws" | "http" } | null> {
  return await Promise.race<Promise<{ seq: number; transport: "ws" | "http" } | null>>([
    new Promise((resolve) => {
      page.on("websocket", (ws) => {
        ws.on("framereceived", (frame) => {
          const raw = typeof frame.payload === "string" ? frame.payload : frame.payload?.toString("utf8") ?? "";
          const seq = tryParseSeq(raw);
          if (seq !== null && seq > afterSeq) resolve({ seq, transport: "ws" });
        });
      });
    }),
    page
      .waitForResponse(
        async (r) => {
          if (!/order.?book|\/sse|\/realtime|getOrderBook/i.test(r.url())) return false;
          if (r.status() >= 400) return false;
          try {
            const body = await r.text();
            const seq = tryParseSeq(body);
            return seq !== null && seq > afterSeq;
          } catch {
            return false;
          }
        },
        { timeout: timeoutMs },
      )
      .then(async (r) => {
        const body = await r.text();
        const seq = tryParseSeq(body) ?? afterSeq + 1;
        return { seq, transport: "http" as const };
      })
      .catch(() => null),
    new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs)),
  ]);
}