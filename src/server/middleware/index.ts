import { type NextRequest, NextResponse } from 'next/server';
import { serializeError } from 'serialize-error';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { logger } from '@/logger/logger';

const createMiddleware = function createMiddleware(
  middleware: ((
    request: NextRequest,
    response: NextResponse,
  ) => Response | PromiseLike<Response>)[],
) {
  // eslint-disable-next-line max-statements
  return async (request: NextRequest): Promise<Response> => {
    const modifiedResponse = new NextResponse();

    try {
      const tasks = [];

      for (const handler of middleware) {
        tasks.push(handler(request, modifiedResponse));
      }

      await Promise.all(tasks);
    } catch (error) {
      if (error instanceof NextResponse) {
        return error;
        /* c8 ignore start */
      }

      logger.error(serializeError(error), import.meta.url);

      return new NextResponse(ReasonPhrases.INTERNAL_SERVER_ERROR, {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
      });
      /* c8 ignore stop */
    }

    const response = NextResponse.next({ request });

    for (const [key, value] of modifiedResponse.headers.entries()) {
      response.headers.set(key, value);
    }

    return response;
  };
};

export default createMiddleware;
export * from './content-security-policy';
