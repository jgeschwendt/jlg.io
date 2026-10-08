import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { StatusCodes } from 'http-status-codes';

/**
 * Drives `createProxy`'s failure paths, which no production handler reaches:
 * `x-coverage-fault: response` short-circuits the chain with a thrown
 * NextResponse, `x-coverage-fault: error` throws anything else. Joins the chain
 * only in COVERAGE=1 builds (see `src/proxy.ts`), so on a deployment the header
 * is inert — which the remote e2e run asserts.
 */
export const coverageFault = (request: NextRequest, response: NextResponse): NextResponse => {
  const fault = request.headers.get('x-coverage-fault');

  if (fault === 'response') {
    // oxlint-disable-next-line typescript/only-throw-error -- a thrown NextResponse IS the chain's short-circuit contract (※ proxy-short-circuit)
    throw new NextResponse('short-circuit', { status: StatusCodes.IM_A_TEAPOT });
  }

  if (fault === 'error') {
    throw new Error('coverage fault');
  }

  return response;
};
