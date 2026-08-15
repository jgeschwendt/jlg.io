import { defineConfig, devices } from '@playwright/test';

// `localhost`, not `127.0.0.1`: Next 16's dev server rejects requests whose Host
// is not an allowed dev origin with a 403, which starves the page of its chunks.
const PORT = 3100;
const BASE_URL = `http://localhost:${String(PORT)}`;

// One config, two modes, switched by COVERAGE_MODE (see `e2e/helpers.ts`, which
// re-exports the flag for the specs):
//
// - `dev`  — `bun run coverage:dev`, the instrumented Turbopack dev server.
// - `prod` — `bun run coverage`, `next start` over the instrumented production
//   build that the script has already produced. Nothing here builds; a stale or
//   uninstrumented `.next` is the caller's problem.
const PROD = process.env['COVERAGE_MODE'] === 'prod';

export default defineConfig({
  forbidOnly: Boolean(process.env['CI']),
  fullyParallel: false,
  projects: [
    {
      name: 'chromium',
      teardown: 'coverage-guard',
      use: { ...devices['Desktop Chrome'] },
    },
    { name: 'coverage-guard', testMatch: /coverage-guard\.teardown\.ts/u },
  ],
  reporter: [['list']],
  retries: 0,
  testDir: './e2e',
  // Turbopack compiles routes lazily, so in dev the first visit to each route
  // pays a full server + client compile.
  timeout: 60_000,
  // `bypassCSP`: every instrumented module opens with
  // `new (function(){}).constructor("return this")()` — an obfuscated
  // `new Function` — and this site's `script-src` carries no `'unsafe-eval'`,
  // so an instrumented bundle dies with an `EvalError` before hydration and
  // `window.__coverage__` is never created. Disabling enforcement in the
  // browser keeps the app's real CSP on the wire (`e2e/routes.spec.ts` still
  // asserts the header, and that the nonce it carries is the one on the
  // rendered <script> tags — which is the mismatch enforcement would have
  // caught) instead of weakening the policy the server actually sends.
  // (verified 2026-08-15 · without it all six page tests fail on
  // `<html id="__next_error__">`, 0 client coverage files)
  use: { baseURL: BASE_URL, bypassCSP: true, trace: 'off' },
  webServer: {
    // Plain `next`, not the repo's `bun --bun next` convention: the coverage
    // flow follows the reference and lets the bin's shebang pick the runtime —
    // bun locally (node shim / bunfig preload), real node on CI (NODE_OPTIONS
    // preload). Forcing bun's runtime with instrumented modules loaded
    // segfaults at process exit on the Linux runner (SIGILL, bun 1.3.14).
    // (observed 2026-08-16 · coverage run 31955271334: build completes, route
    // table prints, then "panic: Segmentation fault" in the exit path)
    command: PROD ? `next start --port ${String(PORT)}` : `next dev --port ${String(PORT)}`,
    // Arms the SWC instrumentation (dev) and opens `/api/coverage` (both).
    env: { COVERAGE: '1' },
    // Never reuse: a server left running in the other mode would silently
    // answer the whole suite, and the report would describe the wrong build.
    reuseExistingServer: false,
    stdout: 'pipe',
    timeout: 300_000,
    url: BASE_URL,
  },
  // Server coverage is process-global shared state, and parallel workers would
  // also trigger a dev-server compile storm.
  workers: 1,
});
