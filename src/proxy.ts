import proxy, { contentSecurityPolicy } from '@/server/proxy';

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

export default proxy([contentSecurityPolicy]);
