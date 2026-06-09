import middleware, { contentSecurityPolicy } from '@/server/proxy';

export const config = {
  matcher: [
    {
      missing: [
        { key: 'next-router-prefetch', type: 'header' },
        { key: 'purpose', type: 'header', value: 'prefetch' },
      ],
      source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
    },
  ],
};

export default middleware([contentSecurityPolicy]);
