import { Global } from '@emotion/react';
import Head from 'next/head';

const Lato = {
  thin: [200, '/fonts/Lato/Lato-Thin.woff2'],
  light: [300, '/fonts/Lato/Lato-Light.woff2'],
  regular: [400, '/fonts/Lato/Lato-Regular.woff2'],
  medium: [500, '/fonts/Lato/Lato-Medium.woff2'],
  bold: [600, '/fonts/Lato/Lato-Bold.woff2'],
} as const;

const FontLato = ({
  fontDisplay,
  weights,
}: {
  fontDisplay?: string;
  weights: (keyof typeof Lato)[];
}) => (
  <>
    <Head>
      {weights.map((weight) => (
        <link
          as="font"
          crossOrigin=""
          href={Lato[weight][1]}
          key={`font-lato-${weight}`}
          rel="preload"
          type="font/woff2"
        />
      ))}
    </Head>
    <Global
      styles={{
        ...weights.map((weight) => ({
          '@font-face': {
            fontDisplay: fontDisplay ?? 'swap',
            fontFamily: 'Lato',
            fontWeight: Lato[weight][0],
            src: `url('${Lato[weight][1]}') format('woff2')`,
          },
        })),
        body: {
          fontFamily: 'Lato, sans-serif',
        },
      }}
    />
  </>
);

export const Font = ({
  lato,
  ...props
}: {
  fontDisplay?: 'block' | 'swap';
  lato?: (keyof typeof Lato)[];
}) => <>{lato && <FontLato weights={lato} {...props} />}</>;
