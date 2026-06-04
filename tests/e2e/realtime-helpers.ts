import type { Page } from "@playwright/test";
import type { RealtimeEvent } from "./fixtures";

/**
 * Reusable helpers for asserting on order-book realtime streams.
 *
 * The marketplace publishes order-book diffs over a WebSocket frame or SSE
 * response, each tagged with a monotonic `seq` (or `sequence`) field. These
 * helpers let E2E tests wait for a specific sequence-number progression
 * deterministically, with clear failure diagnostics that include:
 *   - the seq we were waiting past
 *   - the highest seq actually observed (if any)
 *   - the transport (ws / http) the matching frame arrived on
 *   - a tail of recent realtime events for context
 */

export type Transport = "ws" | "http";

export interface OrderBookDiff {
  seq: number;
  transport: Transport;
  raw: string;
}

export interface WaitOptions {
  /** Wait for a diff with seq strictly greater than this value. */
  afterSeq: number;
  /** Hard timeout in ms. Default 20_000. */
  timeoutMs?: number;
  /** Optional asset/symbol filter applied against the raw frame text. */
  match?: RegExp;
  /** Recent realtime events used for failure diagnostics. */
  events?: Pick<RealtimeEvent, "preview" | "url" | "kind" | "direction" | "at">[];
}

/** Parse a websocket frame / HTTP body and extract its order-book seq. */
export function tryParseSeq(raw: string, match?: RegExp): number | null {
  if (!raw) return null;
  if (match && !match.test(raw)) {
    // Still allow matches if seq is present and topic looks book-ish below.
  }
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
    if (typeof seq !== "number") return null;
    if (!/order.?book|bids|asks|diff/i.test(raw)) return null;
    if (match && !match.test(raw)) return null;
    return seq;
  } catch {
    return null;
  }
}

/** Highest order-book seq observed in a buffer of realtime events. */
export function lastOrderBookSeq(
  events: Pick<RealtimeEvent, "preview">[],
  match?: RegExp,
): number {
  let max = 0;
  for (const e of events) {
    const s = tryParseSeq(e.preview, match);
    if (s !== null && s > max) max = s;
  }
  return max;
}

/**
 * Wait for an order-book diff with `seq > afterSeq` on either the WebSocket
 * channel or an HTTP/SSE response. Throws a diagnostic error on timeout —
 * never silently returns null — so test failures are actionable.
 */
export async function waitForOrderBookDiff(
  page: Page,
  opts: WaitOptions,
): Promise<OrderBookDiff> {
  const timeoutMs = opts.timeoutMs ?? 20_000;
  const { afterSeq, match } = opts;
  let highestSeen = afterSeq;

  const wsPromise = new Promise<OrderBookDiff>((resolve) => {
    page.on("websocket", (ws) => {
      ws.on("framereceived", (frame) => {
        const raw =
          typeof frame.payload === "string"
            ? frame.payload
            : (frame.payload?.toString("utf8") ?? "");
        const seq = tryParseSeq(raw, match);
        if (seq === null) return;
        if (seq > highestSeen) highestSeen = seq;
        if (seq > afterSeq) resolve({ seq, transport: "ws", raw });
      });
    });
  });

  const httpPromise = page
    .waitForResponse(
      async (r) => {
        if (!/order.?book|\/sse|\/realtime|getOrderBook/i.test(r.url())) return false;
        if (r.status() >= 400) return false;
        try {
          const body = await r.text();
          const seq = tryParseSeq(body, match);
          if (seq === null) return false;
          if (seq > highestSeen) highestSeen = seq;
          return seq > afterSeq;
        } catch {
          return false;
        }
      },
      { timeout: timeoutMs },
    )
    .then(async (r): Promise<OrderBookDiff> => {
      const body = await r.text();
      const seq = tryParseSeq(body, match) ?? afterSeq + 1;
      return { seq, transport: "http", raw: body };
    });

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => {
      const tail = (opts.events ?? []).slice(-10).map(
        (e) => `  [${new Date(e.at).toISOString()}] ${e.kind}/${e.direction} ${e.url} :: ${e.preview.slice(0, 120)}`,
      );
      const diag = [
        `waitForOrderBookDiff timed out after ${timeoutMs}ms`,
        `  waited for: seq > ${afterSeq}`,
        `  highest seen: ${highestSeen}`,
        match ? `  filter: ${match}` : `  filter: (none)`,
        tail.length
          ? `last ${tail.length} realtime events:\n${tail.join("\n")}`
          : "no realtime events observed",
      ].join("\n");
      reject(new Error(diag));
    }, timeoutMs),
  );

  return Promise.race([wsPromise, httpPromise, timeoutPromise]);
}

/**
 * After a WebSocket disconnect/reconnect, the server typically replays from
 * the last acked seq. This helper asserts the next observed seq is exactly
 * `lastSeqBeforeDisconnect + 1` (strict resync) — any gap indicates lost
 * messages, any duplicate indicates a replay bug.
 */
export async function waitForResyncAfter(
  page: Page,
  lastSeqBeforeDisconnect: number,
  opts: { timeoutMs?: number; events?: WaitOptions["events"]; match?: RegExp } = {},
): Promise<OrderBookDiff> {
  const diff = await waitForOrderBookDiff(page, {
    afterSeq: lastSeqBeforeDisconnect,
    timeoutMs: opts.timeoutMs ?? 15_000,
    events: opts.events,
    match: opts.match,
  });
  if (diff.seq !== lastSeqBeforeDisconnect + 1) {
    throw new Error(
      `resync gap: expected seq ${lastSeqBeforeDisconnect + 1}, got ${diff.seq} (transport=${diff.transport})`,
    );
  }
  return diff;
}