import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import type { CoverageMapData } from 'istanbul-lib-coverage';
import { connection } from 'next/server';

/** Server counters live on the server's global, so the harness asks it — dev or start alike. */
export async function GET(): Promise<Response> {
  // per request, never prerendered at build time
  await connection();

  // COVERAGE, not NODE_ENV: the coverage run is a production build
  if (process.env['COVERAGE'] !== '1') {
    return new Response(ReasonPhrases.NOT_FOUND, { status: StatusCodes.NOT_FOUND });
  }

  // set by the `scripts/coverage-shared.cjs` preload; without it, a loud 500
  const coverage = (globalThis as typeof globalThis & { __coverage__: CoverageMapData })
    .__coverage__;

  return Response.json(coverage, { headers: { 'cache-control': 'no-store' } });
}
