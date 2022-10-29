import '../styles/global.css';
import { lato } from '../styles/fonts';
import { statement } from './statement';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html className={`h-full ${lato._400.className}`} lang="en-US">
      <head>
        <title>Joshua L Geschwendt&mdash;Web Engineer</title>
        <meta name="description" content={statement()} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className="flex h-full items-center justify-center bg-zinc-900 text-white">
        {children}
      </body>
    </html>
  );
}
