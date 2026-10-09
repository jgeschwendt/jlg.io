import { defineConfig } from '@jlg/oxlint';
import type { OxlintConfig } from 'oxlint';

/**
 * `@next/eslint-plugin-next`'s core-web-vitals severities (16.2.9): these 13 at
 * warn, the other 8 at error. oxlint files every nextjs rule under correctness,
 * which the base sets to error.
 */
const nextCoreWebVitals: OxlintConfig['rules'] = Object.fromEntries(
  [
    'google-font-display',
    'google-font-preconnect',
    'next-script-for-ga',
    'no-async-client-component',
    'no-before-interactive-script-outside-document',
    'no-css-tags',
    'no-head-element',
    'no-img-element',
    'no-page-custom-font',
    'no-styled-jsx-in-document',
    'no-title-in-document-head',
    'no-typos',
    'no-unwanted-polyfillio',
  ].map((rule) => [`nextjs/${rule}`, 'warn'] as const),
);

/**
 * The jsx-a11y set eslint-config-next applied through `next/core-web-vitals`
 * (12.0.7 → 14.2.14, 2021-12 → 2025-01), all at warn. Enabling the plugin puts
 * its other rules (all correctness but anchor-ambiguous-text) under the base's
 * categories, so each is named off.
 */
const jsxA11y: OxlintConfig['rules'] = {
  ...Object.fromEntries(
    [
      'anchor-ambiguous-text',
      'anchor-has-content',
      'anchor-is-valid',
      'aria-activedescendant-has-tabindex',
      'aria-role',
      'autocomplete-valid',
      'click-events-have-key-events',
      'control-has-associated-label',
      'heading-has-content',
      'html-has-lang',
      'iframe-has-title',
      'img-redundant-alt',
      'interactive-supports-focus',
      'label-has-associated-control',
      'lang',
      'media-has-caption',
      'mouse-events-have-key-events',
      'no-access-key',
      'no-aria-hidden-on-focusable',
      'no-autofocus',
      'no-distracting-elements',
      'no-interactive-element-to-noninteractive-role',
      'no-noninteractive-element-interactions',
      'no-noninteractive-element-to-interactive-role',
      'no-noninteractive-tabindex',
      'no-redundant-roles',
      'no-static-element-interactions',
      'prefer-tag-over-role',
      'scope',
      'tabindex-no-positive',
    ].map((rule) => [`jsx-a11y/${rule}`, 'off'] as const),
  ),
  'jsx-a11y/alt-text': ['warn', { elements: ['img'], img: ['Image'] }],
  'jsx-a11y/aria-props': 'warn',
  'jsx-a11y/aria-proptypes': 'warn',
  'jsx-a11y/aria-unsupported-elements': 'warn',
  'jsx-a11y/role-has-required-aria-props': 'warn',
  'jsx-a11y/role-supports-aria-props': 'warn',
};

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
  // reportUnusedDisableDirectives: eslint.config.js's 'error', on every surface
  // (editor included); a bare `--report-unused-disable-directives` on the CLI
  // overrides it down to warn (verified 2026-10-09 · probe, oxlint 1.87)
  options: { reportUnusedDisableDirectives: 'error', typeAware: true },
  plugins: ['eslint', 'import', 'jsx-a11y', 'nextjs', 'oxc', 'react', 'typescript', 'unicorn'],
  rules: {
    ...jsxA11y,
    ...nextCoreWebVitals,
    // top-level `import type` when every specifier is a type; inline
    // `{ type Foo, bar }` when a value rides along (the base default,
    // prefer-top-level, forces a second import line for that case)
    'import/consistent-type-specifier-style': ['error', 'prefer-top-level-if-only-type-imports'],
    'no-async-await': 'off',
    // require-await conflicts with the base's type-aware
    // `typescript/promise-function-async`, which wants a promise-returning
    // function to BE async even when it never awaits (e.g. a `.then` callback
    // that forwards a promise). Keep the author's async style; disable the
    // core rule that fights it. (2026-07-20)
    'require-await': 'off',
    // jlg.io's 2025 flat config (ab6970c^:eslint.config.js): natural key order,
    // and `props` is not an abbreviation worth expanding
    'sort-keys': ['error', 'asc', { natural: true }],
    'unicorn-js/prevent-abbreviations': ['error', { allowList: { props: true } }],
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
        // as eslint.config.js scoped it: .js files keep the base's max of 10
        'max-statements': 'off',
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
        'import/no-unassigned-import': ['warn', { allow: ['@/app/global.css'] }],
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
});
