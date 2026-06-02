/**
 * Minimal traceability / audit-trail helpers used by the smart-contract
 * explainability surface. Pure functions, no I/O — easy to smoke test.
 *
 * An audit trail captures every state transition for an order so the
 * traceability explorer can replay verification step by step.
 */

export type TraceStage =
  | "submitted"
  | "validated"
  | "matched"
  | "executed"
  | "settled";

export interface TraceEvent {
  stage: TraceStage;
  at: number;
  actor: string;
  details?: Record<string, unknown>;
}

export interface OrderTrace {
  orderId: string;
  events: TraceEvent[];
  digest: string;
}

const STAGE_ORDER: TraceStage[] = ["submitted", "validated", "matched", "executed", "settled"];

export function buildOrderTrace(orderId: string, events: TraceEvent[]): OrderTrace {
  const sorted = [...events].sort((a, b) => a.at - b.at);
  const digest = sorted
    .map((e) => `${e.stage}@${e.at}:${e.actor}`)
    .join("|");
  return { orderId, events: sorted, digest };
}

export function isTraceConsistent(trace: OrderTrace): boolean {
  let lastIdx = -1;
  for (const e of trace.events) {
    const idx = STAGE_ORDER.indexOf(e.stage);
    if (idx < lastIdx) return false;
    lastIdx = idx;
  }
  return true;
}

export function playbackTrace(trace: OrderTrace): TraceEvent[] {
  // Deterministic playback — identical input always produces identical output.
  return trace.events.map((e) => ({ ...e }));
}