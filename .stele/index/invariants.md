# Invariants

| claim | node | anchor |
| --- | --- | --- |
| FORMAT POLICY — printWidth is deliberately absent (oxfmt default 100; the repo predates the base's former 80); singleQuote comes from the @jlg/oxfmt base via defineConfig | / | lm:format-policy |
| CSP DYNAMIC — every response carries a fresh per-request CSP nonce minted in the proxy; a build-time static shell cannot hold it, so cacheComponents stays OFF in next.config.js and these routes stay fully dynamic (no cache flag at all — nothing uses the `use cache` directive) | src | lm:csp-dynamic |
