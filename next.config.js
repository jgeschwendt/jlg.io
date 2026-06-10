/** @type {import('next').NextConfig} */
const config = {
  // Not cacheComponents: its build-time static shell can't carry the per-request
  // CSP nonce, so routes here must stay fully dynamic. useCache still enables
  // the `use cache` directive for caching parts within dynamic renders.
  experimental: {
    useCache: true,
    viewTransition: true,
  },
};

export default config;
