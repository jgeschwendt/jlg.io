import { Html, Head, Main, NextScript } from 'next/document';

const Lato = {
  Light: '/fonts/Lato/Lato-Light.woff2',
};

const fontFace = `
@font-face {
  font-family: 'Lato';
  src: url('${Lato.Light}') format('woff2');
}
`;

export default function Document() {
  return (
    <Html>
      <Head />
      <link
        as="font"
        crossOrigin=""
        href={Lato.Light}
        rel="preload"
        type="font/woff2"
      />
      <style
        type="text/css"
        dangerouslySetInnerHTML={{
          __html: fontFace.replace(/\n/g, '').replace(/\s+/g, '').trim(),
        }}
      />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
