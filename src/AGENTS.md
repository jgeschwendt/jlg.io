# src

```stele
kind: container
purpose: Next App Router UI (app/ pages, components/) plus the Edge middleware chain under server/proxy. Rendering is fully dynamic — see the CSP invariant.
invariants:
  - claim: CSP DYNAMIC — every response carries a fresh per-request CSP nonce minted in the proxy; a build-time static shell cannot hold it, so cacheComponents stays OFF in next.config.js and these routes stay fully dynamic (no cache flag at all — nothing uses the `use cache` directive)
    anchor: lm:csp-dynamic
hazards:
  - claim: PROXY SHORT-CIRCUIT — a middleware handler aborts the chain by THROWING a NextResponse (caught in createMiddleware and returned as-is); a normally-returned response is merged into the shared response, not short-circuited
    anchor: lm:proxy-short-circuit
```

<!-- stele:begin router -->
<!-- stele:end -->
