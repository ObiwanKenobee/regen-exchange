/**
 * Validation + defaults for CI-tunable performance budgets used by the
 * marketplace load-perf smoke. Centralized so missing/malformed env vars
 * fail fast with a clear, actionable message instead of producing
 * meaningless `NaN` budgets that silently pass or fail.
 */

export interface PerfBudgets {
  /** Max time-to-terminal-status for a UI-placed order under load (ms). */
  maxTtsMs: number;
  /** Max wall-clock gap between consecutive accepted order-book diffs (ms). */
  maxDiffLagMs: number;
}

export const PERF_BUDGET_DEFAULTS: PerfBudgets = {
  maxTtsMs: 15_000,
  maxDiffLagMs: 3_000,
};

const ABSOLUTE_MIN_MS = 100;
const ABSOLUTE_MAX_MS = 10 * 60_000;

function parseBudget(
  envName: string,
  raw: string | undefined,
  fallback: number,
): number {
  if (raw === undefined || raw === "") return fallback;
  const trimmed = raw.trim();
  if (!/^\d+(\.\d+)?$/.test(trimmed)) {
    throw new Error(
      `[perf-budgets] ${envName}=${JSON.stringify(raw)} is not a positive number. ` +
        `Set it to a millisecond budget (e.g. ${envName}=${fallback}) or unset it to use the default.`,
    );
  }
  const n = Number(trimmed);
  if (!Number.isFinite(n) || n <= 0) {
    throw new Error(`[perf-budgets] ${envName} must be > 0, got ${raw}`);
  }
  if (n < ABSOLUTE_MIN_MS || n > ABSOLUTE_MAX_MS) {
    throw new Error(
      `[perf-budgets] ${envName}=${n}ms is outside the allowed range ` +
        `[${ABSOLUTE_MIN_MS}, ${ABSOLUTE_MAX_MS}] ms.`,
    );
  }
  return n;
}

export function loadPerfBudgets(env: NodeJS.ProcessEnv = process.env): PerfBudgets {
  return {
    maxTtsMs: parseBudget("E2E_MAX_TTS_MS", env.E2E_MAX_TTS_MS, PERF_BUDGET_DEFAULTS.maxTtsMs),
    maxDiffLagMs: parseBudget(
      "E2E_MAX_DIFF_LAG_MS",
      env.E2E_MAX_DIFF_LAG_MS,
      PERF_BUDGET_DEFAULTS.maxDiffLagMs,
    ),
  };
}