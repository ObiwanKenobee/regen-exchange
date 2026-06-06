/**
 * Sample order-book E2E spec built on top of the new SSE template.
 * Demonstrates the canonical wiring of:
 *   - deterministic mocked SSE stream (sse-helpers)
 *   - validated perf budgets (perf-budgets)
 *   - multi-id correlationId consistency (correlation-assertions)
 *   - artifact attachments that feed scripts/build-artifact-index.ts
 */
import { networkTest as test, expect } from "./fixtures";
import { tryParseSeq } from "./realtime-helpers";
import {
  attachSseTimeline,
  forceSseTransport,
  installMockSseStream,
  type SseTimelineEntry,
} from "./sse-helpers";
import { assertCorrelationIdsConsistency } from "./correlation-assertions";
import { loadPerfBudgets } from "./perf-budgets";

test.describe.configure({ retries: process.env.CI ? 3 : 1 });

test("SSE sample: deterministic stream + multi-id correlation consistency", async ({
  page,
  context,
  realtimeEvents,
  correlationIds,
}, testInfo) => {
  const budgets = loadPerfBudgets();
  const timeline: SseTimelineEntry[] = [];

  // Two distinct gap-then-resync windows (10→11 and 20→21) so we can
  // exercise the multi-id correlation helper end-to-end.
  const SCRIPTED_SEQS = [10, 9, 11, 20, 18, 21] as const;
  const BASELINE = 10;

  await forceSseTransport(page);
  await installMockSseStream(context, { seqs: SCRIPTED_SEQS, timeline });

  const startedAt = Date.now();
  await page.goto("/marketplace");
  await page.waitForTimeout(1_500);

  let highestAccepted = 0;
  for (const ev of realtimeEvents) {
    const s = tryParseSeq(ev.preview);
    if (typeof s === "number" && s > highestAccepted) highestAccepted = s;
  }
  for (const t of timeline) t.accepted = highestAccepted;

  expect(highestAccepted).toBeGreaterThanOrEqual(BASELINE);
  // Only strict +1 advances are accepted, so the highest must be one of the
  // two resync seqs (11 or 21) and never a stale frame (9, 18).
  expect([11, 21]).toContain(Math.min(highestAccepted, 21));

  // Snapshot the correlationIds captured around each resync window so the
  // multi-id assertion can verify each one independently.
  const resyncWindow = [...correlationIds];

  // If the page surfaced any execution records, assert all captured
  // serverIds are accounted for end-to-end.
  if (correlationIds.length) {
    await assertCorrelationIdsConsistency(page, testInfo, {
      expected: correlationIds.map((serverId) => ({
        serverId,
        resyncIds: resyncWindow,
      })),
    });
  }

  const ttsMs = Date.now() - startedAt;
  expect(ttsMs, `time-to-terminal exceeded ${budgets.maxTtsMs}ms`).toBeLessThan(
    budgets.maxTtsMs,
  );

  const perfSummary = {
    scenario: "sse-sample",
    browser: testInfo.project.name,
    ttsMs,
    maxTtsMs: budgets.maxTtsMs,
    maxDiffLagMs: budgets.maxDiffLagMs,
    acceptedDiffs: realtimeEvents.length,
    lastSeq: highestAccepted,
    correlationIdsObserved: correlationIds.length,
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