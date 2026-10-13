# Plan

The site and its harness. `AGENTS.md` carries the map, invariants and hazards,
`README.md` the contract; this file is what is open.

## Hazards

- In a shift sandbox, bun cannot write its default tempdir: `bun install` and
  `bun remove` need `BUN_TMPDIR=$TMPDIR BUN_INSTALL_CACHE_DIR=$TMPDIR/bun-cache`.
- `hk install` writes `.git/hooks`, which a shift sandbox refuses; the owner
  installs per clone.
- The `blog` worktree holds the uncommitted `/writing` scaffold (17 paths:
  `src/app/writing/`, `src/content/`, MDX wiring, sitemap) on a branch whose
  tip predates the harness. Never clean or remove it.

## Next

1. Prune the `ci-cache`, `proxy-coverage` and `resume-rewrite` checkouts once
   each branch is confirmed squash-landed; none carries uncommitted work.
2. Land `/writing`: rebase the `blog` worktree's scaffold onto `main` under the
   100 % coverage gate. Its monetization needs owner actions first (GitHub
   Sponsors or a tip link, an Amazon Associates tag; AdSense rejected).
3. Install the hooks: `hk install --mise --force`, once — every checkout shares
   the bare repo's hooks dir. Not before 1 and 2, nor while grove's pool slots
   (`~/.grove/roots/jgeschwendt/jlg.io/pool/`) sit at a pre-hk commit: the hook
   runs `mise x -- hk`, which fails every commit in a checkout whose
   `mise.toml` lacks the hk pin.
   Until then the lefthook shim prints "Can't find lefthook in PATH" and passes
   every commit unchecked.
4. Bump bun from 1.4.0 to 1.4.3 in `mise.toml` after a green coverage run on
   the new runtime (breath filed 2026-10-13).
