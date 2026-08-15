import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test } from '@playwright/test';

const NYC_OUTPUT = path.join(process.cwd(), '.nyc_output');

// A project-level teardown rather than `globalTeardown`: Playwright loads a
// `globalTeardown` module through a CommonJS `require` path that bun's loader
// rejects ("N errors building ..."), while the ordinary test loader works.
//
// Keep the `.catch(() => [])` fallback untyped. Both `() => [] as string[]` and
// `(): string[] => []` make bun's TS loader fail the whole file with an opaque
// `BuildMessage {}` / "3 errors building" AggregateError and no diagnostics.
test('the run produced coverage', async () => {
  const entries = await readdir(NYC_OUTPUT).catch(() => []);
  const files = entries.filter((entry) => entry.endsWith('.json'));

  // Individual tests tolerate a missing client or server map — plenty of routes
  // are one-sided — but a run that produced nothing at all means the SWC plugin
  // stopped running, and that has to be loud.
  expect(
    files.length,
    `${NYC_OUTPUT} contains no *.json files. Check experimental.swcPlugins in ` +
      'next.config.js and that /api/coverage is reachable.',
  ).toBeGreaterThan(0);

  console.log(`\n[coverage] wrote ${files.length} raw coverage file(s).`);
});
