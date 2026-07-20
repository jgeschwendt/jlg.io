/** @type {import('next').NextConfig} */
const config = {
  // Not cacheComponents: its build-time static shell can't carry the per-request
  // CSP nonce, so routes here must stay fully dynamic. useCache still enables
  // the `use cache` directive for caching parts within dynamic renders.
  experimental: {
    useCache: true,
    viewTransition: true,
  },
  typescript: {
    // TypeScript 7.0 is the native `typescript-go` port: its `typescript` package
    // has no `lib/typescript.js` and no classic compiler API (`createProgram` et
    // al.), so Next 16.2 cannot drive it for in-build type checking. Next reads
    // it as "missing" and — because `@typescript/native-preview` is installed (a
    // devDependency added solely for this) — takes its native-compiler branch,
    // skipping the build-time type check instead of crashing on an `npm install`.
    // `ignoreBuildErrors` is belt-and-suspenders for that skip. Type safety stays
    // enforced by the explicit `bunx tsc --noEmit` step in ci.yaml. tsc7 is clean,
    // so nothing real is suppressed. Revisit once Next drives the TS7 API. (2026-07-20)
    ignoreBuildErrors: true,
  },
};

export default config;
