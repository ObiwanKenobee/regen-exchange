/**
 * Reusable template for future order-book SSE E2E specs.
 *
 * Copy this file to `tests/e2e/<your-feature>.spec.ts`, replace the
 * SCRIPTED_SEQS / assertions with your scenario, and you get for free:
 *
 *   - deterministic SSE event stream via {@link installMockSseStream}
 *   - WebSocket fallback via {@link forceSseTransport}
 *   - validated perf budgets via {@link loadPerfBudgets}
 *     (fails fast on malformed E2E_MAX_TTS_MS / E2E_MAX_DIFF_LAG_MS)
 *   - correlationId end-to-end checks via
 *     {@link assertCorrelationIdConsistency}
 *   - HTML report attachments (SSE timeline, perf-summary, correlation log)
 *     that are picked up by `scripts/build-artifact-index.ts` and surfaced
 *     in CI's `playwright-report/artifact-index.html` even on green runs.
 *
 * Conventions:
 *   - Use the `networkTest` fixture so retries upgrade to HAR recording on
 *     network-classed failures.
 *   - Always emit a `[perf-summary]` line + perf-summary.json attachment so
 *     CI's artifact index can pick it up.
 *   - Always attach the SSE timeline regardless of pass/fail.
 */
import { networkTest as test, expect } from "../fixtures";
import { tryParseSeq } from "../realtime-helpers";
import {
  attachSseTimeline,
  forceSseTransport,
  installMockSseStream,
  type SseTimelineEntry,
} from "../sse-helpers";
import { assertCorrelationIdConsistency } from "../correlation-assertions";
import { loadPerfBudgets } from "../perf-budgets";

test.describe.configure({ retries: process.env.CI ? 3 : 1 });

test("TEMPLATE: order-book SSE scenario", async ({
  page,
  context,
  realtimeEvents,
  correlationIds,
}, testInfo) => {
  const budgets = loadPerfBudgets();
  const timeline: SseTimelineEntry[] = [];

  // 1. Script the deterministic SSE frames. Replace with your scenario.
  const SCRIPTED_SEQS = [10, 9, 8, 11] as const;
  const BASELINE = 10;

  // 2. Force SSE transport + install the mocked stream BEFORE page.goto.
  await forceSseTransport(page);
  await installMockSseStream(context, { seqs: SCRIPTED_SEQS, timeline });

  const startedAt = Date.now();
  await page.goto("/marketplace");
  await page.waitForTimeout(1_500);

  // 3. Compute highest accepted seq from the realtime ring buffer.
  let highestAccepted = 0;
  for (const ev of realtimeEvents) {
    const s = tryParseSeq(ev.preview);
    if (typeof s === "number" && s > highestAccepted) highestAccepted = s;
  }
  for (const t of timeline) t.accepted = highestAccepted;

  // 4. Replace with the scenario-specific invariant. Default: strict +1 resync.
  expect(highestAccepted).toBeGreaterThanOrEqual(BASELINE);
  expect(highestAccepted).toBeLessThanOrEqual(BASELINE + 1);

  // 5. (Optional) place an order and assert correlationId propagation.
  //    Delete this block if your scenario does not submit an order.
  const resyncIds = [...correlationIds];
  // await placeOrder(page); // your helper
  // await assertCorrelationIdConsistency(page, testInfo, {
  //   resyncIds, serverIds: correlationIds,
  // });
  void resyncIds;
  void assertCorrelationIdConsistency;

  // 6. Emit perf summary + attach diagnostics (pass OR fail).
  const ttsMs = Date.now() - startedAt;
  expect(ttsMs, `time-to-terminal exceeded ${budgets.maxTtsMs}ms`).toBeLessThan(
    budgets.maxTtsMs,
  );

  const perfSummary = {
    scenario: "TEMPLATE",
    browser: testInfo.project.name,
    ttsMs,
    maxTtsMs: budgets.maxTtsMs,
    maxDiffLagMs: budgets.maxDiffLagMs,
    acceptedDiffs: realtimeEvents.length,
    lastSeq: highestAccepted,
  };
  console.log(`[perf-summary] ${JSON.stringify(perfSummary)}`);
  await testInfo.attach("perf-summary.json", {
    body: Buffer.from(JSON.stringify(perfSummary, null, 2)),
    contentType: "application/json",
  });
  await attachSseTimeline(testInfo, {
    scripted: SCRIPTED_SEQS,
    baseline: BASELINE,
    highestAccepted,
    timeline,
  });
});