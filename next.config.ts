import type { NextConfig } from 'next';

// COVERAGE=1 arms Istanbul for `bun run coverage`; a plain build carries no counters
const isCoverage = process.env['COVERAGE'] === '1';

// applied by SWC so it survives Turbopack; client bundles and server modules alike
const coverageSwcPlugins: [string, Record<string, unknown>][] = [
  [
    'swc-plugin-coverage-instrument',
    {
      unstableExclude: [
        '**/node_modules/**',
        // Must stay un-instrumented. `next/font/google` calls have to survive
        // as bare module-scope `const` assignments for Next's font loader to
        // recognize them; this plugin runs first and rewrites them into
        // sequence expressions. (verified 2026-08-15 · removing this line fails
        // `coverage:build` with "Ecmascript file had an error" at
        // `const atkinson = atkinsonHyperlegibleNext({`)
        '**/src/app/resume/Sheet.tsx',
      ],
    },
  ],
];

// no cache flags: a build-time static shell cannot carry the per-request CSP nonce (src/AGENTS.md · CSP DYNAMIC)
const config: NextConfig = {
  experimental: isCoverage ? { swcPlugins: coverageSwcPlugins } : {},
};

export default config;
