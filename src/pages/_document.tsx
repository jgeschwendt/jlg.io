import { Html, Head, Main, NextScript } from 'next/document';

const Lato = { Light: '/fonts/Lato/Lato-Light.woff2' };

const Document = () => (
  <Html>
    <link
      as="font"
      crossOrigin=""
      href={Lato.Light}
      rel="preload"
      type="font/woff2"
    />
    <Head />
    <style
      dangerouslySetInnerHTML={{
        __html: `
            @font-face {
              font-display: block;
              font-family: 'Lato';
              src: url('${Lato.Light}') format('woff2');
            }`
          .replace(/\n/g, '')
          .replace(/\s+/g, '')
          .trim(),
      }}
      type="text/css"
    />
    <body>
      <Main />
      <NextScript />
    </body>
  </Html>
);

export default Document;
