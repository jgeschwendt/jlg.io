// Instrumentation is opt-in: `COVERAGE=1` arms it for `bun run coverage`
// (`next build` + `next start`) and `bun run coverage:dev`, while a plain
// `bun run build`/`bun run dev` compiles the app with no Istanbul counters in
// it at all. The same flag opens `src/app/api/coverage/route.ts`.
const coverage = process.env.COVERAGE === '1';

// Istanbul instrumentation, applied by SWC so it survives Turbopack. Both the
// client bundles (`window.__coverage__`) and the server modules
// (`globalThis.__coverage__`) are instrumented.
/** @type {[string, Record<string, unknown>][]} */
const coverageSwcPlugins = [
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

/** @type {import('next').NextConfig} */
const config = {
  // No cache flags at all: nothing here uses the `use cache` directive, and
  // cacheComponents stays off because its build-time static shell can't carry
  // the per-request CSP nonce — routes must stay fully dynamic (see
  // src/AGENTS.md · CSP DYNAMIC).
  experimental: coverage ? { swcPlugins: coverageSwcPlugins } : {},
};

export default config;
