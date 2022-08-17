import 'modern-normalize/modern-normalize.css';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import type { AppProps } from 'next/app';

const cache = createCache({ key: 'c', stylisPlugins: [] });

const App = ({ Component, pageProps }: AppProps) => (
  <CacheProvider value={cache}>
    <Component {...pageProps} />
  </CacheProvider>
);

export default App;
