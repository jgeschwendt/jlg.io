import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { log } from '@/logger';

const createMiddleware =
  (
    middleware: readonly ((
      request: NextRequest,
      response: NextResponse,
    ) => Response | PromiseLike<Response>)[],
  ) =>
  async (request: Readonly<NextRequest>): Promise<Response> => {
    const modifiedResponse = new NextResponse();

    try {
      const tasks = middleware.map(async (handler) => handler(request, modifiedResponse));

      await Promise.all(tasks);
    } catch (error) {
      if (error instanceof NextResponse) {
        return error;
      }

      log.error(ReasonPhrases.INTERNAL_SERVER_ERROR, { cause: error });

      return new NextResponse(ReasonPhrases.INTERNAL_SERVER_ERROR, {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
      });
    }

    const response = NextResponse.next({ request });

    for (const [key, value] of modifiedResponse.headers.entries()) {
      response.headers.set(key, value);
    }

    return response;
  };

export default createMiddleware;
export * from './content-security-policy';
