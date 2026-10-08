# Hazards

| claim | node | anchor |
| --- | --- | --- |
| TWO RUNTIMES — mise pins both bun and node, locally and in CI; repo-owned invocations must carry --bun/bunx --bun or they run on node, while third-party node-shebang bins (agent-browser, vercel and its builders, oxlint/oxfmt and the TS configs they evaluate) run on node | / | ※ config-runtime |
| LEFTHOOK FOOTGUN — oxlint (exit 1, 'No files found to lint') and oxfmt 0.62+ (exit 2, 'Expected at least one target file') both fail the commit when every staged file is ignored; --no-error-on-unmatched-pattern is load-bearing on both hooks in lefthook.toml | / | ※ lefthook-unmatched |
| WASM OUTPUT — public/background is wasm-bindgen output, gitignored: deploy.yaml regenerates it with `bun run background:build` before `vercel build`, or restores it from a cache keyed on the crate sources and build script, and local dev runs the same command once for the background to render — never hand-edited or committed, ignored by both lint and fmt | / | ※ wasm-output |
| PROXY SHORT-CIRCUIT — a proxy handler aborts the chain by THROWING a NextResponse (caught in createProxy and returned as-is); a normally-returned response is merged into the shared response, not short-circuited | src | ※ proxy-short-circuit |
