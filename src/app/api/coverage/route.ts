import type { CoverageMapData } from 'istanbul-lib-coverage';
import { connection } from 'next/server';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';

// The SWC coverage plugin instruments server modules too. Their counters land on
// the server process global, so the only way to read them from Playwright is to
// ask the server itself. This works the same under `next dev` and `next start`.
//
// `connection()` (rather than `export const dynamic = "force-dynamic"`) is what
// forces this handler to run per request instead of being prerendered at build
// time — the same request-time opt-in `src/app/page.tsx` already uses.
//
// Gated on COVERAGE, not NODE_ENV: the whole point of the production flow is a
// `next build` where NODE_ENV is `production` and the endpoint still has to
// answer. Without the flag the route is a 404 in every environment — and a
// build made without it has no counters to report anyway.
export async function GET(): Promise<Response> {
  await connection();

  if (process.env['COVERAGE'] !== '1') {
    return new Response(ReasonPhrases.NOT_FOUND, { status: StatusCodes.NOT_FOUND });
  }

  const coverage = (globalThis as { __coverage__?: CoverageMapData }).__coverage__;

  return Response.json(coverage ?? null, {
    headers: { 'cache-control': 'no-store' },
  });
}
