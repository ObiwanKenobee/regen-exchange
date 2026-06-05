import type { BrowserContext, Page, TestInfo } from "@playwright/test";

/**
 * Reusable deterministic SSE event stream helpers for order-book E2E tests.
 *
 * Shared by every spec that needs to drive the client off a scripted
 * sequence of order-book diffs over SSE (rather than a real server stream).
 */

export interface SseTimelineEntry {
  at: number;
  injected: number;
  accepted: number | null;
  note: string;
}

export interface MockSseOptions {
  /** Ordered list of `seq` values to emit in a single SSE response body. */
  seqs: readonly number[];
  /** Topic field on each emitted frame. Default "orderbook". */
  topic?: string;
  /** Route pattern matched against requests. Default order-book/sse routes. */
  pattern?: RegExp;
  /** Mutable timeline buffer that records every injected seq. */
  timeline?: SseTimelineEntry[];
}

/**
 * Force the client off WebSocket so it falls back to SSE transport.
 * Must be installed before page.goto().
 */
export async function forceSseTransport(page: Page): Promise<void> {
  await page.addInitScript(() => {
    // @ts-expect-error - override for E2E
    window.WebSocket = class {
      constructor() {
        throw new Error("websocket disabled for SSE e2e");
      }
    };
  });
}

/**
 * Install a deterministic SSE responder that fulfills any matching request
 * with a scripted list of order-book seq frames. Records every injected
 * seq into the provided timeline buffer for HTML report diagnostics.
 */
export async function installMockSseStream(
  context: BrowserContext,
  opts: MockSseOptions,
): Promise<void> {
  const topic = opts.topic ?? "orderbook";
  const pattern = opts.pattern ?? /\/sse|\/realtime|order.?book/i;
  const timeline = opts.timeline;

  await context.route(pattern, async (route, request) => {
    const accept = request.headers()["accept"] ?? "";
    if (!/text\/event-stream|sse|realtime|order.?book/i.test(accept) &&
        !pattern.test(request.url())) {
      return route.continue();
    }
    const frames = opts.seqs
      .map((seq) =>
        `data: ${JSON.stringify({ topic, seq, bids: [], asks: [] })}\n\n`,
      )
      .join("");
    if (timeline) {
      const now = Date.now();
      for (const seq of opts.seqs) {
        timeline.push({ at: now, injected: seq, accepted: null, note: "scripted" });
      }
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
}

/** Attach the SSE seq-gap timeline JSON to the HTML report. */
export async function attachSseTimeline(
  info: TestInfo,
  payload: {
    scripted: readonly number[];
    baseline: number;
    highestAccepted: number;
    timeline: SseTimelineEntry[];
  },
  name = "sse-seq-gap-timeline.json",
): Promise<void> {
  await info.attach(name, {
    body: Buffer.from(JSON.stringify(payload, null, 2)),
    contentType: "application/json",
  });
}