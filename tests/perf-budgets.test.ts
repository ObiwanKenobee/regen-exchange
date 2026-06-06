import { describe, it, expect } from "vitest";
import {
  loadPerfBudgets,
  PERF_BUDGET_DEFAULTS,
} from "../tests/e2e/perf-budgets";

describe("perf-budgets", () => {
  it("returns defaults when env vars are missing", () => {
    const b = loadPerfBudgets({});
    expect(b).toEqual(PERF_BUDGET_DEFAULTS);
  });

  it("returns defaults for empty-string env vars", () => {
    const b = loadPerfBudgets({ E2E_MAX_TTS_MS: "", E2E_MAX_DIFF_LAG_MS: "" });
    expect(b).toEqual(PERF_BUDGET_DEFAULTS);
  });

  it("parses valid millisecond budgets", () => {
    const b = loadPerfBudgets({
      E2E_MAX_TTS_MS: "20000",
      E2E_MAX_DIFF_LAG_MS: "1500",
    });
    expect(b).toEqual({ maxTtsMs: 20000, maxDiffLagMs: 1500 });
  });

  it("fails fast with actionable message for malformed E2E_MAX_TTS_MS", () => {
    expect(() => loadPerfBudgets({ E2E_MAX_TTS_MS: "fast" })).toThrow(
      /\[perf-budgets\] E2E_MAX_TTS_MS=.*"fast".* is not a positive number/,
    );
  });

  it("fails fast for malformed E2E_MAX_DIFF_LAG_MS", () => {
    expect(() => loadPerfBudgets({ E2E_MAX_DIFF_LAG_MS: "-5" })).toThrow(
      /\[perf-budgets\] E2E_MAX_DIFF_LAG_MS=.*"-5".* is not a positive number/,
    );
  });

  it("rejects budgets below the absolute minimum", () => {
    expect(() => loadPerfBudgets({ E2E_MAX_TTS_MS: "50" })).toThrow(
      /outside the allowed range/,
    );
  });

  it("rejects budgets above the absolute maximum", () => {
    expect(() =>
      loadPerfBudgets({ E2E_MAX_DIFF_LAG_MS: String(60 * 60_000) }),
    ).toThrow(/outside the allowed range/);
  });

  it("includes the env var name in every error so CI logs are actionable", () => {
    try {
      loadPerfBudgets({ E2E_MAX_TTS_MS: "NaN" });
      throw new Error("expected throw");
    } catch (e) {
      expect((e as Error).message).toContain("E2E_MAX_TTS_MS");
      expect((e as Error).message).toContain("[perf-budgets]");
    }
  });
});