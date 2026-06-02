import { describe, it, expect } from "vitest";
import {
  buildOrderTrace,
  isTraceConsistent,
  playbackTrace,
  type TraceEvent,
} from "@/lib/rve/traceability";

const events: TraceEvent[] = [
  { stage: "submitted", at: 100, actor: "wallet:0xabc" },
  { stage: "validated", at: 110, actor: "oracle:rve" },
  { stage: "matched", at: 120, actor: "engine:cex" },
  { stage: "executed", at: 130, actor: "contract:0xdef" },
  { stage: "settled", at: 140, actor: "contract:0xdef" },
];

describe("smart-contract explainability — traceability", () => {
  it("builds a consistent audit trail with a stable digest", () => {
    const trace = buildOrderTrace("order-1", events);
    expect(trace.events.map((e) => e.stage)).toEqual([
      "submitted",
      "validated",
      "matched",
      "executed",
      "settled",
    ]);
    expect(isTraceConsistent(trace)).toBe(true);

    const reshuffled = [...events].reverse();
    const trace2 = buildOrderTrace("order-1", reshuffled);
    expect(trace2.digest).toBe(trace.digest);
  });

  it("detects out-of-order stage transitions", () => {
    const broken = buildOrderTrace("order-2", [
      { stage: "executed", at: 100, actor: "x" },
      { stage: "submitted", at: 101, actor: "x" },
    ]);
    expect(isTraceConsistent(broken)).toBe(false);
  });

  it("returns deterministic verification playback after an order", () => {
    const trace = buildOrderTrace("order-3", events);
    expect(playbackTrace(trace)).toEqual(playbackTrace(trace));
    expect(playbackTrace(trace)).toHaveLength(events.length);
  });
});