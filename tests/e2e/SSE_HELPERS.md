# SSE helper API (`tests/e2e/sse-helpers.ts`)

Reusable utilities for driving order-book E2E specs off a deterministic,
scripted SSE event stream instead of a real server stream. Use these to
remove flakiness from anything that asserts on order-book sequence
numbers, resync windows, or correlationId propagation.

## Exports

| Export | Purpose |
| --- | --- |
| `forceSseTransport(page)` | Stub `window.WebSocket` so the client falls back to SSE. Install **before** `page.goto`. |
| `installMockSseStream(context, opts)` | Route-fulfill any SSE/order-book request with a scripted list of `seq` frames. Records every injected seq into `opts.timeline`. |
| `attachSseTimeline(testInfo, payload, name?)` | Attach the seq-gap timeline JSON to the HTML report. Pass/fail agnostic — call it in both branches. |
| `SseTimelineEntry` | `{ at, injected, accepted, note }` record stored in the shared timeline buffer. |
| `MockSseOptions` | `{ seqs, topic?, pattern?, timeline? }`. `pattern` defaults to `/\/sse|\/realtime|order.?book/i`. |

## Canonical usage

```ts
import { networkTest as test, expect } from "./fixtures";
import { tryParseSeq } from "./realtime-helpers";
import {
  attachSseTimeline,
  forceSseTransport,
  installMockSseStream,
  type SseTimelineEntry,
} from "./sse-helpers";

test("order book discards stale SSE diffs", async ({
  page, context, realtimeEvents,
}, testInfo) => {
  const timeline: SseTimelineEntry[] = [];
  const SCRIPTED = [10, 9, 8, 11] as const; // baseline, stale, stale, resync

  await forceSseTransport(page);
  await installMockSseStream(context, { seqs: SCRIPTED, timeline });

  await page.goto("/marketplace");
  await page.waitForTimeout(1_500);

  let highest = 0;
  for (const ev of realtimeEvents) {
    const s = tryParseSeq(ev.preview);
    if (typeof s === "number" && s > highest) highest = s;
  }
  expect(highest).toBeGreaterThanOrEqual(10);
  expect(highest).toBeLessThanOrEqual(11); // stale 9/8 must be discarded

  await attachSseTimeline(testInfo, {
    scripted: SCRIPTED, baseline: 10, highestAccepted: highest, timeline,
  });
});
```

## Recipes

**Strict +1 resync only.** Use sequences like `[N, N-1, N-2, N+1]`. Assert
`highestAccepted === N + 1`.

**Custom topic / pattern.** Pass `topic` to change the frame `topic` field;
pass `pattern` to widen/narrow the routes fulfilled (e.g. only your shard).

**Correlation assertions.** Combine with
`tests/e2e/correlation-assertions.ts` →
`assertCorrelationIdConsistency` to verify the same `x-correlation-id`
flows through the SSE resync window and the ticket execution record.

## Gotchas

- `forceSseTransport` MUST be called before `page.goto` — it uses
  `addInitScript` and only takes effect on the next document load.
- `installMockSseStream` fulfills a single response body. The client
  consumes it as a normal SSE stream, but no further frames are pushed
  after the body ends — script the full sequence up-front.
- Always invoke `attachSseTimeline` regardless of pass/fail so green CI
  runs still surface diagnostics for regression triage.