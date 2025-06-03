import '@/app/global.css';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import type { JSX, PropsWithChildren } from 'react';

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
}: PropsWithChildren): JSX.Element {
  return (
    <html
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      lang="en-US"
    >
      <body className="bg-[oklch(.1_0_0)] font-extralight text-white">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
