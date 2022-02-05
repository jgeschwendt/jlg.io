import { Html, Head, Main, NextScript } from 'next/document';

const Lato = {
  Light: 'fonts/Lato/Lato-Light.woff2',
};

const fontFace = `
@font-face {
  font-family: 'Lato';
  src: url('${Lato.Light}') format('woff2');
}
`
  .replace(/\n/g, '')
  .trim();

export default function Document() {
  return (
    <Html>
      <Head>
        <link as="font" href={Lato.Light} rel="preload" type="font/woff2" />
        <style type="text/css" dangerouslySetInnerHTML={{ __html: fontFace }} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
