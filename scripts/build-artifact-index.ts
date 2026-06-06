#!/usr/bin/env bun
/**
 * Walk Playwright's `test-results/` output and emit a single
 * `playwright-report/artifact-index.{json,html}` summarizing every
 * attached diagnostic (perf-summary.json, sse-seq-gap-timeline.json,
 * correlation-id-propagation.txt, traces, videos, HARs, screenshots).
 *
 * Generated on every CI run — including all-green runs — so regressions
 * can be diffed without opening the HTML report.
 */
import { readdirSync, statSync, mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { join, relative, extname } from "node:path";

const ROOT = process.argv[2] ?? "test-results";
const OUT_DIR = process.argv[3] ?? "playwright-report";

interface Entry {
  test: string;
  attempt: string;
  kind: string;
  path: string;
  bytes: number;
}

const KIND_BY_NAME: Record<string, string> = {
  "perf-summary.json": "perf-summary",
  "sse-seq-gap-timeline.json": "sse-timeline",
  "correlation-id-propagation.txt": "correlation-log",
};
const KIND_BY_EXT: Record<string, string> = {
  ".zip": "trace",
  ".webm": "video",
  ".har": "har",
  ".png": "screenshot",
};

function walk(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

function classify(file: string): { kind: string; test: string; attempt: string } | null {
  const base = file.split("/").pop()!;
  const kind = KIND_BY_NAME[base] ?? KIND_BY_EXT[extname(base).toLowerCase()];
  if (!kind) return null;
  const parts = relative(ROOT, file).split("/");
  const test = parts[0] ?? "unknown";
  const m = base.match(/attempt(\d+)/i);
  const attempt = m ? `attempt${m[1]}` : "attempt1";
  return { kind, test, attempt };
}

const files = walk(ROOT);
const entries: Entry[] = [];
for (const f of files) {
  const c = classify(f);
  if (!c) continue;
  entries.push({ ...c, path: relative(ROOT, f), bytes: statSync(f).size });
}

entries.sort((a, b) => a.test.localeCompare(b.test) || a.kind.localeCompare(b.kind));

const byTest: Record<string, Entry[]> = {};
for (const e of entries) (byTest[e.test] ??= []).push(e);

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(
  join(OUT_DIR, "artifact-index.json"),
  JSON.stringify({ generatedAt: new Date().toISOString(), root: ROOT, byTest }, null, 2),
);

const rows = Object.entries(byTest)
  .map(([test, items]) => {
    const lis = items
      .map(
        (i) =>
          `<li><code>${i.kind}</code> · ${i.attempt} · <a href="../${ROOT}/${i.path}">${i.path}</a> · ${i.bytes}B</li>`,
      )
      .join("");
    return `<section><h2>${test}</h2><ul>${lis}</ul></section>`;
  })
  .join("\n");

writeFileSync(
  join(OUT_DIR, "artifact-index.html"),
  `<!doctype html><meta charset="utf-8"><title>Playwright artifact index</title>
<style>body{font:14px system-ui;margin:2rem;max-width:960px}h1{margin:0 0 1rem}section{margin:1rem 0;padding:1rem;border:1px solid #ddd;border-radius:6px}code{background:#f3f3f3;padding:.1rem .35rem;border-radius:3px}</style>
<h1>Playwright artifact index</h1>
<p>Generated ${new Date().toISOString()} · ${entries.length} artifacts across ${Object.keys(byTest).length} tests.</p>
${rows || "<p>No artifacts found.</p>"}`,
);

// eslint-disable-next-line no-console
console.log(`[artifact-index] wrote ${entries.length} entries → ${OUT_DIR}/artifact-index.{json,html}`);