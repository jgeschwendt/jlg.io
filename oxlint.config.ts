import { defineConfig } from '@jlg/oxlint';

export default defineConfig({
  ignorePatterns: ['public/background', '.next', 'next-env.d.ts'],
  overrides: [
    {
      files: ['src/ui/IconSet.tsx'],
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
        // istanbul's FileCoverageData names its hit counters s, f and b
        'id-length': ['error', { checkGeneric: false, exceptions: ['b', 'f', 's'] }],
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
        // ITSELF (hk passes staged files explicitly): outside tsconfig's
        // include, a lone .cjs gets no project types and every `require` result
        // is error-typed. The whole-repo `bun run lint` never trips these.
        // (observed 2026-08-18 · a comment edit staged the file and the
        // pre-commit hook failed on 22 unsafe-call/member-access errors)
        'typescript/no-unsafe-call': 'off',
        'typescript/no-unsafe-member-access': 'off',
        'typescript/strict-boolean-expressions': 'off',
        // the preload's job is to publish `globalThis.__coverage__`
        'unicorn-js/no-global-object-property-assignment': 'off',
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
        // top-level `import type` when every specifier is a type; inline
        // `{ type Foo, bar }` when a value rides along (the base default,
        // prefer-top-level, forces a second import line for that case); here,
        // not top-level, because the base's TS override turns it off
        'import/consistent-type-specifier-style': [
          'error',
          'prefer-top-level-if-only-type-imports',
        ],
        'import/no-unassigned-import': ['warn', { allow: ['@/app/global.css'] }],
        // the package subpaths this app imports by design, as eslint.config.js allowed them
        'import-js/no-internal-modules': [
          'warn',
          {
            allow: [
              'motion/react',
              'next/font/google',
              'next/headers',
              'next/image',
              'next/link',
              'next/navigation',
              'next/server',
            ],
          },
        ],
        // as eslint.config.js scoped it: .js files keep the base's max of 10
        'max-statements': 'off',
      },
    },
    {
      files: ['**/*.tsx'],
      rules: {
        // options replace the base's whole object, so its checkGeneric goes too
        'id-length': ['error', { checkGeneric: false, exceptions: ['x', 'y'] }],
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
    // @jlg/eslint's func-style matrix (eslint-baseline.json): the base's
    // expression everywhere, declaration in JSX and Next's convention files,
    // and layout/page named exports (metadata, generateMetadata) as expressions
    {
      files: ['**/*.{jsx,tsx}'],
      rules: {
        'func-style': ['error', 'declaration'],
      },
    },
    {
      files: ['**/{instrumentation,middleware,robots,route}.{js,ts}'],
      rules: {
        'func-style': ['error', 'declaration'],
      },
    },
    {
      files: ['**/{layout,page}.{jsx,tsx}'],
      rules: {
        'func-style': ['error', 'declaration', { overrides: { namedExports: 'expression' } }],
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
      files: ['src/proxy.ts', '**/server/proxy/index.ts'],
      rules: {
        'import/no-default-export': 'off',
      },
    },
    {
      // a thrown NextResponse IS the proxy chain's short-circuit contract
      // (※ proxy-short-circuit) — scoped here, as inline directives are banned
      files: ['src/server/proxy/coverage-fault.ts'],
      rules: {
        'typescript/only-throw-error': 'off',
      },
    },
  ],
  rules: {
    'typescript/prefer-readonly-parameter-types': 'off',
    'unicorn-js/name-replacements': ['error', { allowList: { props: true } }],
    // named entry points (components/icons.ts) are the house import surface
    'unicorn-js/no-barrel-files': 'off',
  },
});
