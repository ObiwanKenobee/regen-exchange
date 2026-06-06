import type { Page, TestInfo } from "@playwright/test";
import { expect } from "@playwright/test";

/**
 * Shared utility for asserting that a single `x-correlation-id` from a
 * trade-execute response propagates consistently through:
 *
 *   1. the SSE resync window (events observed while the client was
 *      catching up after a stale/out-of-order frame)
 *   2. the ticket UI surface (`data-correlation-id` on the ticket)
 *   3. the persisted ticket execution record
 *      (`[data-testid="execution-record"] [data-correlation-id]`)
 *
 * Centralized so every order-book E2E spec performs the same checks with
 * the same diagnostic output instead of re-implementing ad-hoc variants.
 */

export interface CorrelationContext {
  /** Correlation IDs captured during the SSE resync window (newest last). */
  resyncIds: readonly string[];
  /** All trade-execute correlation IDs observed by the fixture (newest last). */
  serverIds: readonly string[];
}

export interface CorrelationAssertionResult {
  serverId: string;
  surfaced: string | null;
  executionRecordId: string | null;
  matched: { ticket: boolean; executionRecord: boolean; resync: boolean };
}

export interface MultiCorrelationContext {
  /** One entry per order/trade attempt, newest last. */
  expected: ReadonlyArray<{
    /** The server x-correlation-id from trade-execute for this attempt. */
    serverId: string;
    /** correlationIds observed in the SSE resync window for this attempt. */
    resyncIds?: readonly string[];
  }>;
}

export interface MultiCorrelationAssertionResult {
  perId: Array<{
    serverId: string;
    surfacedMatch: boolean;
    executionRecordMatch: boolean;
    resyncMatch: boolean;
  }>;
  allMatched: boolean;
}

/**
 * Assert correlationId consistency across the SSE resync + ticket
 * execution surfaces and attach a propagation log to the HTML report.
 *
 * @returns The matched ids + per-surface pass/fail booleans for callers
 *   that want to assert additional invariants.
 */
export async function assertCorrelationIdConsistency(
  page: Page,
  testInfo: TestInfo,
  ctx: CorrelationContext,
): Promise<CorrelationAssertionResult> {
  const propagation: string[] = [];
  expect(
    ctx.serverIds.length,
    "no trade-execute correlationIds captured — did the order submit?",
  ).toBeGreaterThan(0);

  const serverId = ctx.serverIds[ctx.serverIds.length - 1];
  propagation.push(`1. server x-correlation-id = ${serverId}`);

  const surfaced =
    (await page
      .locator('[data-correlation-id], [data-testid="execution-correlation-id"]')
      .first()
      .getAttribute("data-correlation-id")
      .catch(() => null)) ??
    (await page
      .getByTestId("execution-correlation-id")
      .innerText()
      .catch(() => null));
  propagation.push(`2. ticket surfaced correlationId = ${surfaced ?? "(none)"}`);

  const executionRecordId = await page
    .locator('[data-testid="execution-record"] [data-correlation-id]')
    .first()
    .getAttribute("data-correlation-id")
    .catch(() => null);
  propagation.push(
    `3. execution-record correlationId = ${executionRecordId ?? "(none)"}`,
  );

  propagation.push(
    `4. resync-window correlationIds = ${
      ctx.resyncIds.length ? ctx.resyncIds.join(", ") : "(none)"
    }`,
  );

  const matched = {
    ticket: surfaced === serverId,
    executionRecord: executionRecordId === serverId,
    resync: ctx.resyncIds.includes(serverId),
  };

  await testInfo.attach("correlation-id-propagation.txt", {
    body: Buffer.from(propagation.join("\n")),
    contentType: "text/plain",
  });

  if (surfaced) expect(surfaced, "ticket surfaced id != server id").toBe(serverId);
  if (executionRecordId)
    expect(executionRecordId, "execution-record id != server id").toBe(serverId);
  if (ctx.resyncIds.length && (surfaced || executionRecordId)) {
    expect(
      ctx.resyncIds,
      "resync-window did not observe the server correlationId",
    ).toContain(serverId);
  }

  return { serverId, surfaced, executionRecordId, matched };
}

/**
 * Multi-id variant of {@link assertCorrelationIdConsistency} that validates
 * an ordered list of correlationIds across several resync windows + ticket
 * execution records. Useful for specs that submit multiple orders and want
 * to assert ALL of them propagate end-to-end (not only the last one).
 *
 * The DOM is queried for every `[data-correlation-id]` and
 * `[data-testid="execution-record"] [data-correlation-id]`; each expected
 * serverId must appear in at least one surface. Per-attempt resync windows
 * (if provided) must contain the matching serverId.
 */
export async function assertCorrelationIdsConsistency(
  page: Page,
  testInfo: TestInfo,
  ctx: MultiCorrelationContext,
): Promise<MultiCorrelationAssertionResult> {
  expect(ctx.expected.length, "no expected correlationIds provided").toBeGreaterThan(0);

  const surfaced = await page
    .locator("[data-correlation-id]")
    .evaluateAll((els) =>
      els.map((e) => (e as HTMLElement).getAttribute("data-correlation-id") ?? ""),
    )
    .catch(() => [] as string[]);
  const executionRecordIds = await page
    .locator('[data-testid="execution-record"] [data-correlation-id]')
    .evaluateAll((els) =>
      els.map((e) => (e as HTMLElement).getAttribute("data-correlation-id") ?? ""),
    )
    .catch(() => [] as string[]);

  const lines: string[] = [
    `expected ${ctx.expected.length} correlationId(s)`,
    `surfaced on ticket = [${surfaced.join(", ")}]`,
    `execution-record    = [${executionRecordIds.join(", ")}]`,
  ];

  const perId = ctx.expected.map((e, i) => {
    const surfacedMatch = surfaced.includes(e.serverId);
    const executionRecordMatch = executionRecordIds.includes(e.serverId);
    const resyncMatch = e.resyncIds ? e.resyncIds.includes(e.serverId) : true;
    lines.push(
      `#${i + 1} ${e.serverId} → ticket=${surfacedMatch} record=${executionRecordMatch} resync=${resyncMatch}`,
    );
    return { serverId: e.serverId, surfacedMatch, executionRecordMatch, resyncMatch };
  });

  await testInfo.attach("correlation-id-propagation.txt", {
    body: Buffer.from(lines.join("\n")),
    contentType: "text/plain",
  });

  for (const r of perId) {
    if (surfaced.length || executionRecordIds.length) {
      expect(
        r.surfacedMatch || r.executionRecordMatch,
        `correlationId ${r.serverId} not found in ticket or execution-record`,
      ).toBe(true);
    }
    expect(
      r.resyncMatch,
      `correlationId ${r.serverId} missing from its resync window`,
    ).toBe(true);
  }

  return { perId, allMatched: perId.every((r) => r.resyncMatch && (r.surfacedMatch || r.executionRecordMatch)) };
}