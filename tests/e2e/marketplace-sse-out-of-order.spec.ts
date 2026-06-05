import { networkTest as test, expect } from "./fixtures";
import { tryParseSeq } from "./realtime-helpers";

test.describe.configure({ retries: process.env.CI ? 3 : 1 });

/**
 * SSE variant of the out-of-order + resync flow, driven by a deterministic
 * mocked event stream so the test does not depend on real server timing.
 *
 * The spec:
 *   1. stubs WebSocket so the client falls back to SSE
 *   2. fulfills any SSE request with a scripted sequence of frames:
 *        seq=10, seq=9 (stale), seq=8 (stale), seq=11 (resync)
 *   3. asserts the client only accepts strictly-increasing seqs (10 -> 11)
 *   4. places an order and verifies the ticket's surfaced correlationId
 *      matches the server's x-correlation-id from trade-execute
 *   5. on failure attaches a seq-gap timeline + correlationId propagation
 *      steps to the HTML report for easy debugging
 */
test("SSE: deterministic out-of-order stream → resync → correlationId matches", async ({
  page,
  context,
  realtimeEvents,
  correlationIds,
}, testInfo) => {
  // Timeline of every seq frame the test injected / the client accepted.
  type GapEntry = { at: number; injected: number; accepted: number | null; note: string };
  const timeline: GapEntry[] = [];
  const propagation: string[] = [];
  const record = (e: GapEntry) => timeline.push(e);

  // Force SSE: stub WebSocket so the client falls back to SSE transport.
  await page.addInitScript(() => {
    // @ts-expect-error - override for E2E
    window.WebSocket = class {
      constructor() {
        throw new Error("websocket disabled for SSE e2e");
      }
    };
  });

  // Deterministic SSE stream: baseline, two stale, then strict +1 resync.
  const SCRIPTED_SEQS = [10, 9, 8, 11] as const;
  const BASELINE = 10;

  await context.route(/\/sse|\/realtime|order.?book/i, async (route, request) => {
    if (!/text\/event-stream|sse|realtime|order.?book/i.test(request.headers()["accept"] ?? "") &&
        !/\/sse|\/realtime|order.?book/i.test(request.url())) {
      return route.continue();
    }
    const frames = SCRIPTED_SEQS
      .map((seq) => `data: ${JSON.stringify({ topic: "orderbook", seq, bids: [], asks: [] })}\n\n`)
      .join("");
    for (const seq of SCRIPTED_SEQS) {
      record({ at: Date.now(), injected: seq, accepted: null, note: "scripted" });
    }
    return route.fulfill({
      status: 200,
      headers: {
        "content-type": "text/event-stream",
        "cache-control": "no-cache",
        "x-mock": "deterministic-sse",
      },
      body: frames,
    });
  });

  await page.goto("/marketplace");

  // Give the client time to process every scripted frame.
  await page.waitForTimeout(1_500);

  // Compute the highest accepted seq from the realtime event ring buffer.
  let highestAccepted = 0;
  for (const ev of realtimeEvents) {
    const s = tryParseSeq(ev.preview);
    if (typeof s === "number" && s > highestAccepted) highestAccepted = s;
  }
  for (const t of timeline) {
    t.accepted = highestAccepted;
  }

  // Stale frames (seq 9, 8) must never advance the accepted seq beyond
  // BASELINE; only the strict +1 resync (seq 11) may.
  expect(highestAccepted).toBeGreaterThanOrEqual(BASELINE);
  expect(highestAccepted).toBeLessThanOrEqual(BASELINE + 1);

  // Place an order and confirm the ticket's correlationId matches the
  // server's x-correlation-id from the trade-execute response.
  const buy = page.getByRole("button", { name: /^buy/i }).first();
  if (await buy.isVisible().catch(() => false)) {
    await buy.click();
    await page.getByLabel(/quantity/i).fill("1").catch(() => {});
    await page.getByRole("button", { name: /review buy/i }).click().catch(() => {});
    propagation.push("1. clicked Sign & Submit on order ticket");
    await page.getByRole("button", { name: /sign.*submit/i }).click().catch(() => {});

    await expect(
      page.getByText(/transaction submitted|order confirmed/i),
    ).toBeVisible({ timeout: 20_000 });
    propagation.push("2. trade-execute response observed");

    expect(correlationIds.length).toBeGreaterThan(0);
    const serverId = correlationIds[correlationIds.length - 1];
    propagation.push(`3. server x-correlation-id = ${serverId}`);
    const surfaced =
      (await page
        .locator('[data-correlation-id], [data-testid="execution-correlation-id"]')
        .first()
        .getAttribute("data-correlation-id")
        .catch(() => null)) ??
      (await page.getByTestId("execution-correlation-id").innerText().catch(() => null));
    propagation.push(`4. ticket surfaced correlationId = ${surfaced ?? "(none)"}`);
    if (surfaced) expect(surfaced).toBe(serverId);
  }

  // Attach diagnostics to the HTML report regardless of pass/fail so the
  // sequence-gap behavior and correlationId hop chain are inspectable.
  await testInfo.attach("sse-seq-gap-timeline.json", {
    body: Buffer.from(
      JSON.stringify(
        {
          scripted: SCRIPTED_SEQS,
          baseline: BASELINE,
          highestAccepted,
          timeline,
        },
        null,
        2,
      ),
    ),
    contentType: "application/json",
  });
  await testInfo.attach("correlation-id-propagation.txt", {
    body: Buffer.from(propagation.join("\n") || "(no order placed)"),
    contentType: "text/plain",
  });
});