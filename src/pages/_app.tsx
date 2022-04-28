import 'modern-normalize/modern-normalize.css';
import { Global } from '@emotion/react';
import type { AppProps } from 'next/app';
import Head from 'next/head';

const Lato = { Light: '/fonts/Lato/Lato-Light.woff2' };

const App = ({ Component, pageProps }: AppProps) => (
  <>
    <Head>
      <link
        as="font"
        crossOrigin=""
        href={Lato.Light}
        rel="preload"
        type="font/woff2"
      />
    </Head>
    <Global
      styles={{
        '@font-face': {
          fontDisplay: 'block',
          fontFamily: 'Lato',
          src: `url('${Lato.Light}') format('woff2')`,
        },
        'body': {
          fontFamily: 'Lato, sans-serif',
        },
      }}
    />
    <Component {...pageProps} />
  </>
);

export default App;
