import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { test as base, expect } from '@playwright/test';
import type { CoverageMapData } from 'istanbul-lib-coverage';

export const NYC_OUTPUT = path.join(process.cwd(), '.nyc_output');

declare global {
  interface Window {
    __coverage__?: CoverageMapData;
  }
}

const isNonEmpty = (map: unknown): map is CoverageMapData =>
  typeof map === 'object' && map !== null && Object.keys(map).length > 0;

const writeCoverage = async (map: CoverageMapData, kind: string) => {
  await mkdir(NYC_OUTPUT, { recursive: true });
  await writeFile(
    path.join(NYC_OUTPUT, `coverage-${kind}-${randomUUID()}.json`),
    JSON.stringify(map),
    'utf8',
  );
};

/**
 * Collects Istanbul coverage after every test, from both halves of the app:
 *
 * - **client** — `window.__coverage__`, populated by the instrumented browser
 *   bundles. Legitimately absent on routes that ship no Client Components, so a
 *   miss is recorded as an annotation rather than a failure.
 * - **server** — `globalThis.__coverage__` inside the server process the suite
 *   is driving (`next dev` or `next start`), read through the COVERAGE-gated
 *   `/api/coverage` route handler. This is cumulative across the whole run (one
 *   process, one global); Istanbul's merge is idempotent for repeated identical
 *   maps, so re-reading it per test is safe.
 *
 * A third source never passes through here: `scripts/coverage-exit.cjs` dumps
 * `coverage-build-<pid>.json` straight to `.nyc_output` from the short-lived
 * processes that render pages ahead of any request. The report merges all three.
 *
 * The "instrumentation is dead" alarm lives in the global teardown, which fails
 * the run if the whole suite produced no coverage files at all.
 */
export const test = base.extend<{ collectCoverage: void }>({
  collectCoverage: [
    async ({ page, request }, use, testInfo) => {
      await use();

      const client = page.isClosed()
        ? undefined
        : await page.evaluate(() => window.__coverage__).catch(() => undefined);

      if (isNonEmpty(client)) {
        await writeCoverage(client, 'client');
        testInfo.annotations.push({
          description: `${Object.keys(client).length} file(s)`,
          type: 'coverage:client',
        });
      } else {
        testInfo.annotations.push({
          description: 'window.__coverage__ empty (server-only route?)',
          type: 'coverage:client-missing',
        });
      }

      const response = await request.get('/api/coverage');

      if (!response.ok()) {
        throw new Error(
          `Coverage collection failed for "${testInfo.title}": GET /api/coverage returned ${response.status()}.`,
        );
      }

      const server: unknown = await response.json();

      if (isNonEmpty(server)) {
        await writeCoverage(server, 'server');
        testInfo.annotations.push({
          description: `${Object.keys(server).length} file(s)`,
          type: 'coverage:server',
        });
      } else {
        testInfo.annotations.push({
          description: 'globalThis.__coverage__ empty',
          type: 'coverage:server-missing',
        });
      }
    },
    { auto: true },
  ],
});

export { expect };
