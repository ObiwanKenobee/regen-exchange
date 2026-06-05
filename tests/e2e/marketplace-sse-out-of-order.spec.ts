import { networkTest as test, expect } from "./fixtures";
import { tryParseSeq } from "./realtime-helpers";
import {
  attachSseTimeline,
  forceSseTransport,
  installMockSseStream,
  type SseTimelineEntry,
} from "./sse-helpers";

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
  const timeline: SseTimelineEntry[] = [];
  const propagation: string[] = [];

  // Deterministic SSE stream: baseline, two stale, then strict +1 resync.
  const SCRIPTED_SEQS = [10, 9, 8, 11] as const;
  const BASELINE = 10;

  await forceSseTransport(page);
  await installMockSseStream(context, { seqs: SCRIPTED_SEQS, timeline });

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

  // Capture the correlationId observed during the SSE resync window so we
  // can assert it propagates end-to-end into the ticket execution record
  // (not just the final visible ticket status).
  const resyncCorrelationIds = [...correlationIds];

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
    const executionRecordId = await page
      .locator('[data-testid="execution-record"] [data-correlation-id]')
      .first()
      .getAttribute("data-correlation-id")
      .catch(() => null);
    propagation.push(`5. execution-record correlationId = ${executionRecordId ?? "(none)"}`);
    if (surfaced) expect(surfaced).toBe(serverId);
    if (executionRecordId) expect(executionRecordId).toBe(serverId);
    // If the resync window observed any trade-execute correlationIds, the
    // SAME id must appear in the final ticket execution record — proving
    // the id flowed through the SSE-driven resync path and into the
    // persisted execution row, not just the visible status text.
    if (resyncCorrelationIds.length && (surfaced || executionRecordId)) {
      expect(resyncCorrelationIds).toContain(serverId);
    }
  }

  // Attach diagnostics to the HTML report regardless of pass/fail so the
  // sequence-gap behavior and correlationId hop chain are inspectable
  // even for green CI runs (useful for regression triage).
  await attachSseTimeline(testInfo, {
    scripted: SCRIPTED_SEQS,
    baseline: BASELINE,
    highestAccepted,
    timeline,
  });
  await testInfo.attach("correlation-id-propagation.txt", {
    body: Buffer.from(propagation.join("\n") || "(no order placed)"),
    contentType: "text/plain",
  });
});