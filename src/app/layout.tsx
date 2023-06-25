import '../styles/global.css';
import { Analytics } from '@vercel/analytics/react';
import { Lato } from 'next/font/google';
import { statement } from './statement';

const lato = Lato({
  subsets: ['latin'],
  weight: ['300'],
  variable: '--font-lato',
});

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
    <html className={lato.variable} lang="en-US">
      <body className="bg-[#1a1a1a] font-light text-white">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
