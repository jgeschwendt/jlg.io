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
