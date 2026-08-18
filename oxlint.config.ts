import { defineConfig } from '@jlg/oxlint';

export default defineConfig({
  ignorePatterns: [
    '**/*.d.ts',
    '.next',
    'next-env.d.ts',
    // The oxlint/oxfmt TS configs default-export a config object (oxfmt's spreads
    // the imported base), so they trip app-oriented base rules (no-default-export,
    // no-anonymous-default-export, no-rest-spread-properties). They are tooling
    // config, not app code — excluded from lint, as the former JSON configs were.
    'oxfmt.config.ts',
    'oxlint.config.ts',
    'public/background',
  ],
  options: { typeAware: true },
  plugins: ['eslint', 'import', 'nextjs', 'oxc', 'react', 'typescript', 'unicorn'],
  rules: {
    // func-style: the @jlg/eslint stack tuned func-style per Next file type
    // (declaration vs expression); the @jlg/oxlint base does NOT port that
    // (see its README "What was DROPPED"). This repo intentionally mixes
    // `function foo()` and `const foo = () =>`, so the base's blanket
    // func-style errors on every file. Disabled — matches the pre-migration
    // effective behavior. (2026-07-20)
    'func-style': 'off',
    // id-length: the authored eslint.config.js enabled id-length ONLY for
    // **/*.tsx (exceptions x,y). The base turns it on globally, which flags
    // conventional single-letter generic type params (T, K) in .ts files.
    // Off here; re-enabled for .tsx in the override below. (2026-07-20)
    'id-length': 'off',
    'max-statements': 'off',
    // one-var: implemented in oxlint 1.78, landing at error via the base's
    // style category with the upstream default ("always" — combine
    // declarations). The authored @jlg/eslint stack set ["error", "never"]
    // (the base's README lists it under DROPPED, pre-1.78); pin the original
    // option here until the base ports it. (2026-08-12)
    'one-var': ['error', 'never'],
    // no-duplicate-imports (core) treats a value import and a separate
    // type-only import from the same module as a duplicate, which conflicts
    // with the base's `import/consistent-type-specifier-style` (prefers a
    // top-level `import type`). The smarter `import/no-duplicates` is enabled
    // by the base and correctly permits separate type imports while still
    // catching genuine value duplicates, so the core rule is redundant here.
    // (2026-07-20)
    'no-duplicate-imports': 'off',
    // require-await conflicts with the base's type-aware
    // `typescript/promise-function-async`, which wants a promise-returning
    // function to BE async even when it never awaits (e.g. a `.then` callback
    // that forwards a promise). Keep the author's async style; disable the
    // core rule that fights it. (2026-07-20)
    'require-await': 'off',
    // no-deprecated: motion 12.42 marks `staggerChildren` deprecated
    // (Main.tsx uses it 3x). Migrating to `delayChildren: stagger(...)` is a
    // real animation change, not a lint mechanic — demoted to warn so the
    // signal stays visible without blocking lint. (2026-07-20)
    'typescript/no-deprecated': 'warn',
    // The authored eslint.config.js disabled prefer-readonly-parameter-types
    // for all ts/tsx; base ships it at warn. Off here to match. (2026-07-20)
    'typescript/prefer-readonly-parameter-types': 'off',
    // react/jsx-filename-extension: base flags JSX in .tsx files (wants .jsx),
    // nonsensical for a TS project — every component file trips it. (2026-07-20)
    'react/jsx-filename-extension': 'off',
  },
  overrides: [
    {
      files: ['src/components/icons/Icons.tsx'],
      rules: {
        'import/group-exports': 'off',
        'no-magic-numbers': 'off',
        'react/jsx-props-no-spreading': 'off',
        'react/no-multi-comp': 'off',
      },
    },
    {
      files: ['scripts/**/*.ts'],
      rules: {
        'import/no-nodejs-modules': 'off',
        'no-await-in-loop': 'off',
        'no-console': 'off',
        'no-magic-numbers': 'off',
        // JSON.parse returns `any`; naming the shape it is being read back into
        // is an assertion either way, and the repo has no schema validator to
        // make it a narrowing instead. (2026-08-15 · scripts/coverage-report.ts
        // reading `.nyc_output/*.json` as istanbul's CoverageMapData)
        'typescript/no-unsafe-type-assertion': 'off',
      },
    },
    {
      // scripts/coverage-exit.cjs is a runtime preload (`preload` in bunfig.toml),
      // loaded before any hook that could handle TypeScript or ESM exists — hence
      // CommonJS and `require`. It reads and writes `globalThis.__coverage__`, the
      // untyped global the SWC instrumenter emits, which is what the dangling
      // underscores and the type-aware `any` complaints are about. (2026-08-15)
      files: ['scripts/*.cjs'],
      rules: {
        'import/no-commonjs': 'off',
        'import/no-nodejs-modules': 'off',
        'import/unambiguous': 'off',
        'no-underscore-dangle': 'off',
        'typescript/no-require-imports': 'off',
        'typescript/no-unsafe-argument': 'off',
        'typescript/no-unsafe-assignment': 'off',
        // The remaining unsafe-* pair fires only when the file is linted BY
        // ITSELF (lefthook passes staged files explicitly): outside tsconfig's
        // include, a lone .cjs gets no project types and every `require` result
        // is error-typed. The whole-repo `bun run lint` never trips these.
        // (observed 2026-08-18 · a comment edit staged the file and the
        // pre-commit hook failed on 22 unsafe-call/member-access errors)
        'typescript/no-unsafe-call': 'off',
        'typescript/no-unsafe-member-access': 'off',
        'typescript/strict-boolean-expressions': 'off',
      },
    },
    {
      // The coverage endpoint is instrumentation plumbing in app clothing: it
      // reads `globalThis.__coverage__` (the instrumenter's untyped dangling-
      // underscore global, asserted into shape) and must body `null` — JSON has
      // no undefined, and the harness distinguishes "no counters" from an
      // empty map by it. Invisible to lint until 2026-08-16: a bare `coverage`
      // in .gitignore matched the route's own directory, and oxlint honors
      // .gitignore. (2026-08-16)
      files: ['src/app/api/coverage/route.ts'],
      rules: {
        'no-underscore-dangle': 'off',
        'typescript/no-unsafe-type-assertion': 'off',
        'unicorn/no-null': 'off',
      },
    },
    {
      files: ['**/*.ts', '**/*.tsx'],
      rules: {
        'import/no-unassigned-import': ['warn', { allow: ['@/app/global.css'] }],
      },
    },
    {
      files: ['**/*.tsx'],
      rules: {
        'id-length': ['error', { exceptions: ['x', 'y'] }],
        'react/forbid-component-props': [
          'error',
          {
            forbid: ['style', { allowedFor: ['Link'], propName: 'className' }],
          },
        ],
        'react/jsx-max-depth': ['error', { max: 7 }],
        'unicorn/filename-case': ['error', { case: 'pascalCase' }],
      },
    },
    {
      files: [
        '**/{layout,page,loading,not-found,error,global-error,template,default}.{jsx,tsx}',
        '**/mdx-components.{jsx,tsx}',
      ],
      rules: {
        'unicorn/filename-case': ['error', { case: 'kebabCase' }],
      },
    },
    {
      files: ['src/proxy.ts', '**/server/proxy/index.ts', '**/default.tsx'],
      rules: {
        'import/no-default-export': 'off',
      },
    },
    {
      files: ['src/app/resume/Resume.tsx'],
      rules: {
        'react/jsx-curly-brace-presence': 'off',
        'react/jsx-no-literals': 'off',
      },
    },
  ],
});
