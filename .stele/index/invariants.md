# Invariants

| claim | node | anchor |
| --- | --- | --- |
| ALIAS CONSUMPTION — @jlg/* names in package.json/configs are npm aliases to npm:@jgeschwendt/* on GitHub Packages (interim scope; the npmjs @jlg org is the end state); .npmrc + NODE_AUTH_TOKEN are required even for public reads (anonymous 401) | / | lm:alias-consumption |
| FORMAT POLICY — printWidth is deliberately absent (oxfmt default 100; the repo predates the base's former 80); singleQuote comes from the @jlg/oxfmt base via defineConfig | / | lm:format-policy |
| CSP DYNAMIC — every response carries a fresh per-request CSP nonce minted in the proxy; a build-time static shell cannot hold it, so cacheComponents stays OFF in next.config.js and these routes stay fully dynamic (useCache still allows `use cache` within a dynamic render) | src | lm:csp-dynamic |
