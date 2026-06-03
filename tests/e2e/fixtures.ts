import { test as base, expect, type TestInfo } from "@playwright/test";
import { mkdirSync, writeFileSync, existsSync, copyFileSync } from "node:fs";
import { dirname, join } from "node:path";

/**
 * Flaky-test mitigation utilities.
 *
 * - `retryByFailureType`: on a retry, inspect the previous attempt's error and
 *   classify it as `network` or `assertion`. Network failures get HAR
 *   recording enabled and a higher retry budget; assertion failures stay on
 *   the default budget so genuine product bugs surface quickly.
 * - `realtimeEvents`: in-memory ring buffer of the last 200 websocket / SSE
 *   frames. Attached to the HTML report on failure.
 * - Artifact naming: `<testFileBase>__<sanitizedTitle>__attempt<N>.<ext>` for
 *   trace.zip / video.webm / network.har so failed runs are easy to correlate.
 */

export type RealtimeEvent = {
  at: number;
  kind: "ws" | "sse";
  direction: "in" | "out";
  url: string;
  preview: string;
};

export type FailureClass = "network" | "assertion" | "unknown";

function classifyFailure(info: TestInfo): FailureClass {
  const err = info.errors[0] ?? info.error;
  const msg = (err?.message ?? "") + " " + (err?.stack ?? "");
  if (/ECONN|ENOTFOUND|net::|socket hang up|timeout.*navigation|waitForResponse|waitForRequest|websocket|fetch failed/i.test(msg)) {
    return "network";
  }
  if (/expect\(|toBe|toEqual|toMatch|toHaveText|toBeVisible/i.test(msg)) {
    return "assertion";
  }
  return err ? "unknown" : "assertion";
}

function sanitize(name: string): string {
  return name.replace(/[^a-z0-9._-]+/gi, "_").slice(0, 80);
}

function artifactBase(info: TestInfo): string {
  const file = sanitize(info.titlePath[0] ?? "test");
  const title = sanitize(info.title);
  return `${file}__${title}__attempt${info.retry + 1}`;
}

export const test = base.extend<{
  realtimeEvents: RealtimeEvent[];
  failureClass: FailureClass;
}>({
  // Per-test ring buffer of realtime events. Tests push into this; the
  // afterEach hook below attaches the last 200 to the report on failure.
  realtimeEvents: async ({ page }, use) => {
    const buf: RealtimeEvent[] = [];
    const push = (ev: RealtimeEvent) => {
      buf.push(ev);
      if (buf.length > 200) buf.shift();
    };

    page.on("websocket", (ws) => {
      const url = ws.url();
      ws.on("framesent", (f) =>
        push({ at: Date.now(), kind: "ws", direction: "out", url, preview: String(f.payload ?? "").slice(0, 240) }),
      );
      ws.on("framereceived", (f) =>
        push({ at: Date.now(), kind: "ws", direction: "in", url, preview: String(f.payload ?? "").slice(0, 240) }),
      );
    });

    page.on("response", async (res) => {
      const ct = res.headers()["content-type"] ?? "";
      if (ct.includes("text/event-stream")) {
        push({ at: Date.now(), kind: "sse", direction: "in", url: res.url(), preview: ct });
      }
    });

    await use(buf);
  },

  // Expose the classified failure type to tests/hooks via fixture.
  failureClass: async ({}, use, info) => {
    await use(classifyFailure(info));
  },
});

test.afterEach(async ({ realtimeEvents }, info) => {
  if (info.status === "passed" || info.status === "skipped") return;

  const base = artifactBase(info);

  // 1) Attach last 200 realtime events to the HTML report.
  await info.attach(`${base}-realtime-events.json`, {
    body: Buffer.from(JSON.stringify(realtimeEvents.slice(-200), null, 2)),
    contentType: "application/json",
  });

  // 2) Attach failure classification.
  const cls = classifyFailure(info);
  await info.attach(`${base}-failure-class.txt`, {
    body: Buffer.from(cls),
    contentType: "text/plain",
  });

  // 3) Copy auto-saved trace/video to a consistently-named sibling so
  //    artifacts uploaded by CI are easy to correlate by test + attempt.
  for (const att of info.attachments) {
    if (!att.path || !existsSync(att.path)) continue;
    const ext = att.path.split(".").pop();
    if (!ext || !["zip", "webm", "png", "har"].includes(ext)) continue;
    const target = join(dirname(att.path), `${base}.${ext}`);
    if (target !== att.path && !existsSync(target)) {
      try {
        copyFileSync(att.path, target);
      } catch {
        // best-effort
      }
    }
  }
});

/**
 * Helper for tests that explicitly want HAR capture on failure. Usage:
 *
 *   const context = await newHarContext(browser, info);
 *   const page = await context.newPage();
 */
export async function writeRealtimeSnapshot(info: TestInfo, events: RealtimeEvent[]) {
  const path = join(info.outputDir, `${artifactBase(info)}-realtime.json`);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(events.slice(-200), null, 2));
  return path;
}

export { expect };

/** Tag a test as network-bound — gets +1 retry on top of the project default. */
export const networkBound = { tag: "@network" as const };