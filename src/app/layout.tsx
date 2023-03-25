import { Lato } from '@next/font/google';
import { statement } from './statement';
import '../styles/global.css';

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
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className="bg-[#1a1a1a] font-light text-white">{children}</body>
    </html>
  );
}
