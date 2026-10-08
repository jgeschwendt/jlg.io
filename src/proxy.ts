import proxy, { contentSecurityPolicy, coverageFault } from '@/server/proxy';

export const config = {
  matcher: [
    {
      missing: [
        { key: 'next-router-prefetch', type: 'header' },
        { key: 'purpose', type: 'header', value: 'prefetch' },
      ],
      source: '/((?!_next/image|_next/static|favicon.ico).*)',
    },
  ],
};

// The fault handler exists to cover the chain's failure paths; a build without
// COVERAGE=1 never adds it, so no request header can reach it in production.
export default proxy(
  process.env['COVERAGE'] === '1'
    ? [contentSecurityPolicy, coverageFault]
    : [contentSecurityPolicy],
);
