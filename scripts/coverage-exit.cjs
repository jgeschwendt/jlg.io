'use strict';

// Writes `globalThis.__coverage__` to `.nyc_output/coverage-build-<pid>.json`
// when the process it is preloaded into goes away.
//
// `generateStaticParams` and every statically rendered Server Component run
// during `next build`, inside its static-generation workers — not inside the
// server the e2e suite talks to. Their Istanbul counters live and die with
// those worker processes, so the only way to keep them is to write them out
// before each one leaves.
//
// Plain CommonJS on purpose: this is a runtime preload (`preload` in
// `bunfig.toml`, or node's `NODE_OPTIONS=--require`), loaded before any hook
// that could handle TypeScript or ESM exists.

const fs = require('node:fs');
const path = require('node:path');

const NYC_OUTPUT = path.join(process.cwd(), '.nyc_output');

// The preload itself cannot be conditional — `bunfig.toml` is static — so
// COVERAGE is what arms it. An ordinary `bun run build`/`bun run dev` loads an
// inert module.
if (process.env.COVERAGE === '1' && !globalThis.__coverageExitHookInstalled) {
  globalThis.__coverageExitHookInstalled = true;

  const flush = () => {
    const coverage = globalThis.__coverage__;

    // Most processes in a build (the coordinator, Turbopack's transform pools,
    // Playwright's own workers) never load an instrumented module.
    if (!coverage || Object.keys(coverage).length === 0) {
      return;
    }

    // Synchronous by necessity — an `exit` handler cannot await — and written
    // through a temp file so a process killed mid-write cannot leave the
    // reporter a truncated JSON document.
    const file = path.join(NYC_OUTPUT, `coverage-build-${process.pid}.json`);

    fs.mkdirSync(NYC_OUTPUT, { recursive: true });
    fs.writeFileSync(`${file}.tmp`, JSON.stringify(coverage), 'utf8');
    fs.renameSync(`${file}.tmp`, file);
  };

  process.on('exit', flush);

  // Next's static-generation workers (`jest-worker`'s `processChild`) are shut
  // down with a signal, and the default action for one is to terminate the
  // process without ever emitting `exit`. Handling them is what makes
  // build-time coverage land at all: without this, only the handful of workers
  // that happen to run out of work first get flushed.
  for (const signal of ['SIGHUP', 'SIGINT', 'SIGTERM']) {
    process.on(signal, () => {
      flush();
      process.exit(0);
    });
  }
}
