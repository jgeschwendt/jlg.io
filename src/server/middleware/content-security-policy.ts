import type { NextRequest, NextResponse } from 'next/server';

/**
 * @see https://vercel.com/docs/workflow-collaboration/vercel-toolbar/managing-toolbar#using-a-content-security-policy
 */
export const contentSecurityPolicy = function contentSecurityPolicy(
  request: NextRequest,
  response: NextResponse,
): NextResponse {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const preview = process.env['VERCEL_ENV'] === 'preview';
  const production = process.env.NODE_ENV !== 'development';

  const policy = [
    "default-src 'none';",
    "base-uri 'self';",
    `connect-src ${preview ? 'https://vercel.live wss://ws-us3.pusher.com' : "'self'"};`,
    `font-src ${preview ? ' https://vercel.live https://assets.vercel.com' : "'self'"};`,
    "form-action 'self';",
    `frame-src ${preview ? 'https://vercel.live;' : "'none';"}`,
    `img-src ${preview ? 'https://vercel.live https://vercel.com blob: data:' : 'blob: data:;'}`,
    `script-src ${
      production
        ? `script-src 'nonce-${nonce}' ${preview ? 'https://vercel.live' : 'strict-dynamic'}`
        : `script-src 'nonce-${nonce}' 'strict-dynamic' 'unsafe-eval';`
    };`,
    `style-src ${
      preview ? "https://vercel.live 'unsafe-inline'" : "'unsafe-inline';"
    }`,
    'upgrade-insecure-requests;',
  ].join(' ');

  request.headers.set('x-nonce', nonce);

  response.headers.set('content-security-policy', policy);

  return response;
};
