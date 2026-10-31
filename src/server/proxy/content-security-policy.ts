import type { NextRequest, NextResponse } from 'next/server';

/**
@see https://vercel.com/docs/vercel-toolbar/managing-toolbar#using-a-content-security-policy
*/
export const contentSecurityPolicy = (
  request: NextRequest,
  response: NextResponse,
): NextResponse => {
  // ※ csp-dynamic
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const policy = {
    'base-uri': "'self'",
    'connect-src': "'self'",
    'default-src': "'none'",
    'font-src': "'self'",
    'form-action': "'self'",
    'frame-src': "'none'",
    'img-src': "'self' blob: data:",
    // wasm-unsafe-eval: WebAssembly.instantiate() for the Bevy background WebAssembly module.
    'script-src': `'wasm-unsafe-eval' 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    'style-src': "'self' 'unsafe-inline'",
    'upgrade-insecure-requests': '',
  };

  // A preview widens the policy to the Vercel toolbar's origins; its script-src trades
  // 'strict-dynamic' for the host allowance, which 'strict-dynamic' would ignore.
  if (process.env['VERCEL_ENV'] === 'preview') {
    policy['connect-src'] += ' https://vercel.live wss://ws-us3.pusher.com';
    policy['font-src'] += ' https://assets.vercel.com https://vercel.live';
    policy['frame-src'] = 'https://vercel.live';
    policy['img-src'] = "'self' https://vercel.com https://vercel.live blob: data:";
    policy['script-src'] = `'wasm-unsafe-eval' 'self' 'nonce-${nonce}' https://vercel.live`;
    policy['style-src'] = "'self' https://vercel.live 'unsafe-inline'";
  }

  // coverage skip -- `next dev` only: a build bakes NODE_ENV in as "production"
  if (process.env.NODE_ENV === 'development') {
    policy['script-src'] =
      `'wasm-unsafe-eval' 'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-eval'`;
  }

  request.headers.set('x-nonce', nonce);
  response.headers.set(
    'content-security-policy',
    Object.entries(policy)
      .map((directive) => directive.join(' ').trimEnd())
      .join('; '),
  );

  return response;
};
