import type { NextRequest, NextResponse } from 'next/server';

export const contentSecurityPolicy = function contentSecurityPolicy(
  request: NextRequest,
  response: NextResponse,
): NextResponse {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');

  const policy = [
    "default-src 'self';",
    process.env.NODE_ENV === 'development'
      ? `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-eval';`
      : `script-src 'self' 'nonce-${nonce}' 'strict-dynamic';`,
    `style-src 'self' 'unsafe-inline';`,
    "img-src 'self' blob: data:;",
    "font-src 'self';",
    "object-src 'none';",
    "base-uri 'self';",
    "form-action 'self';",
    "frame-ancestors 'none';",
    'upgrade-insecure-requests;',
  ].join(' ');

  request.headers.set('x-nonce', nonce);

  response.headers.set('content-security-policy', policy);

  return response;
};
