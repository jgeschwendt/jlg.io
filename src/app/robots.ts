import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        allow: ['/$'],
        disallow: ['/'],
        userAgent: '*',
      },
    ],
    //_ sitemap: 'https://acme.com/sitemap.xml',
  };
}
