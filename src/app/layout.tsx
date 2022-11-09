import { Lato } from '@next/font/google';
import '../styles/global.css';

const lato = Lato({ subsets: ['latin'], weight: ['300'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html className={lato.className} lang="en-US">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className="bg-[#1a1a1a] text-white">{children}</body>
    </html>
  );
}
