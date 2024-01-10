import '../styles/global.css';
import { Analytics } from '@vercel/analytics/react';
import { GeistSans } from 'geist/font/sans';
import { statement } from './statement';

export const generateMetadata = () => ({
  description: statement(),
  title: 'Joshua L Geschwendt—Web Engineer',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html className={GeistSans.className} lang="en-US">
      <body className="bg-[#1a1a1a] font-[200] text-white">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
