#!/usr/bin/env bun
import { existsSync } from 'node:fs';
import { appendFile, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import libCoverage from 'istanbul-lib-coverage';
import libReport from 'istanbul-lib-report';
import reports from 'istanbul-reports';

const CWD = process.cwd();
const NYC_OUTPUT = path.join(CWD, '.nyc_output');
const REPORT_DIR = path.join(CWD, 'coverage');

const entries = await readdir(NYC_OUTPUT).catch(() => {
  throw new Error(`No coverage input: ${NYC_OUTPUT} does not exist.`);
});
const files = entries.filter((entry) => entry.endsWith('.json')).toSorted();

if (files.length === 0) {
  throw new Error(`No coverage input: ${NYC_OUTPUT} contains no *.json files.`);
}

// Next hands the instrumenter a few modules that have no file on disk:
// `<component>.tsx/__nextjs-internal-proxy.mjs` shims for the Server/Client
// boundary, and `<name>.mdx.tsx` for compiled MDX. Their counters are real but
// the reporters cannot read a source for them, so drop anything whose recorded
// path does not resolve to an actual file in the repo. That also covers stray
// node_modules/.next entries if unstableExclude ever slips.
const isRealSource = (file: string): boolean =>
  existsSync(path.resolve(CWD, file)) && !file.includes('node_modules') && !file.includes('.next/');

const map = libCoverage.createCoverageMap({});
const dropped = new Set<string>();

for (const file of files) {
  const raw = await readFile(path.join(NYC_OUTPUT, file), 'utf8');
  const data = JSON.parse(raw) as libCoverage.CoverageMapData;

  for (const [key, entry] of Object.entries(data)) {
    if (isRealSource(entry.path ?? key)) {
      map.merge({ [key]: entry });
    } else {
      dropped.add(key);
    }
  }
}

const context = libReport.createContext({
  coverageMap: map,
  defaultSummarizer: 'nested',
  dir: REPORT_DIR,
  watermarks: {
    branches: [50, 80],
    functions: [50, 80],
    lines: [50, 80],
    statements: [50, 80],
  },
});

for (const name of ['html', 'lcovonly', 'text'] as const) {
  reports.create(name).execute(context);
}

console.log(
  `\nMerged ${files.length} coverage file(s) covering ${map.files().length} source file(s).`,
);

if (dropped.size > 0) {
  console.log(
    `Filtered ${dropped.size} synthetic module(s) with no source on disk (e.g. ${[...dropped][0]}).`,
  );
}
console.log(`HTML report: ${path.join(REPORT_DIR, 'index.html')}`);

// Enforced minimums, local and CI alike. A report is not evidence on its own:
// instrumentation that quietly stops reaching half the app still renders a
// perfectly well-formed report, just of less. Only a gate turns the number into
// a claim.
//
// 90 is the floor, not the mark: statements and lines both sit ~1.4–2 points
// above it in either mode, which is margin enough that a real regression trips
// the gate while normal per-run drift does not. Branches and functions are
// reported but not gated — branch coverage here is dominated by the CSP
// builder's preview/production ternaries, arms no local run can enter.
// (measured 2026-08-15 · `bun run coverage` 92.00 stmts / 91.48 lines,
// `bun run coverage:dev` 91.91 / 91.39, 12 tests)
const THRESHOLDS = { lines: 90, statements: 90 } as const;

const totals = map.getCoverageSummary();
const metrics = ['branches', 'functions', 'lines', 'statements'] as const;
const gates = metrics
  .filter((metric): metric is keyof typeof THRESHOLDS => metric in THRESHOLDS)
  .map((metric) => ({
    met: totals[metric].pct >= THRESHOLDS[metric],
    metric,
    minimum: THRESHOLDS[metric],
    pct: totals[metric].pct,
  }));

console.log(
  `\nthresholds: ${gates
    .map(
      ({ met, metric, minimum, pct }) =>
        `${metric} ≥${minimum} ${met ? '✓' : '✗'} ${pct.toFixed(2)}`,
    )
    .join(' · ')}`,
);

// GitHub's job summary, when there is one. The script stays CI-agnostic
// otherwise: no GITHUB_STEP_SUMMARY, no extra output.
const stepSummary = process.env['GITHUB_STEP_SUMMARY'];

if (stepSummary !== undefined && stepSummary.length > 0) {
  const row = (metric: (typeof metrics)[number]): string => {
    const { covered, pct, total } = totals[metric];
    const gate = gates.find((entry) => entry.metric === metric);

    return `| ${metric} | ${pct.toFixed(2)}% | ${covered}/${total} | ${
      gate ? `≥${gate.minimum} ${gate.met ? '✓' : '✗'}` : '—'
    } |`;
  };

  await appendFile(
    stepSummary,
    [
      '## Coverage',
      '',
      '| metric | covered | counts | threshold |',
      '| --- | ---: | ---: | --- |',
      ...metrics.map((metric) => row(metric)),
      '',
      `${map.files().length} source file(s) from ${files.length} raw coverage file(s).`,
      '',
    ].join('\n'),
  );
}

const failed = gates.filter(({ met }) => !met);

if (failed.length > 0) {
  console.error(
    `\nCoverage below threshold: ${failed
      .map(({ metric, minimum, pct }) => `${metric} ${pct.toFixed(2)} < ${minimum}`)
      .join(', ')}`,
  );
  process.exit(1);
}
