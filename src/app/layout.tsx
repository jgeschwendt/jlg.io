import '@/app/global.css';
import { Analytics } from '@vercel/analytics/react';
import { GeistSans } from 'geist/font/sans';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import type { JSX } from 'react';

export const generateMetadata = async (): Promise<Metadata> => {
  const readonlyHeaders = await headers();
  return {
    metadataBase: new URL(
      [
        readonlyHeaders.get('x-forwarded-proto'),
        readonlyHeaders.get('x-forwarded-host'),
      ].join('://'),
    ),
  };
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="en-US">
      <body
        className={`${GeistSans.variable} bg-[#1a1a1a] font-[family-name:var(--font-geist-sans)] font-extralight text-white`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
