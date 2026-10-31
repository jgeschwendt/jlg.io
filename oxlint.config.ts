import { defineConfig } from '@jlg/oxlint';

export default defineConfig({
  ignorePatterns: ['**/*.d.ts', '.next', 'next-env.d.ts', 'public/background'],
  overrides: [
    {
      files: ['src/components/icons/icons.tsx'],
      rules: {
        'import/group-exports': 'off',
        // an inline <svg role="img"> is the accessible-image pattern; the rule's <img> has no inline SVG form to replace it with. (2026-10-30)
        'jsx-a11y/prefer-tag-over-role': 'off',
        'no-magic-numbers': 'off',
        'react/jsx-props-no-spreading': 'off',
        'react/no-multi-comp': 'off',
      },
    },
    {
      files: ['src/app/home/main.tsx'],
      rules: {
        'no-magic-numbers': 'off',
      },
    },
    {
      files: ['src/app/home/background.tsx'],
      rules: {
        'typescript/no-unsafe-type-assertion': 'off',
      },
    },
    {
      // the logger IS the app's console sink; every other module calls it
      // instead of console. (2026-10-30)
      files: ['src/lib/log.ts'],
      rules: {
        'no-console': 'off',
      },
    },
    {
      // React does not imply a browser in the base; this app's components
      // render in one. (2026-10-30)
      env: { browser: true },
      files: ['src/**/*.tsx'],
    },
    {
      files: ['scripts/**/*.ts'],
      rules: {
        // istanbul's FileCoverageData names its hit counters s, f and b
        'id-length': ['off', { checkGeneric: false, exceptions: ['b', 'f', 's'] }],
        'import/no-nodejs-modules': 'off',
        'no-await-in-loop': 'off',
        'no-console': 'off',
        'no-magic-numbers': 'off',
        'typescript/no-unsafe-type-assertion': 'off',
        'typescript-js/naming-convention': 'off',
      },
    },
    {
      files: ['scripts/*.cjs'],
      rules: {
        'import/no-commonjs': 'off',
        'import/no-nodejs-modules': 'off',
        'import/unambiguous': 'off',
        'no-console': 'off',
        'no-underscore-dangle': 'off',
        'typescript/no-require-imports': 'off',
        'typescript/no-unsafe-argument': 'off',
        'typescript/no-unsafe-assignment': 'off',
        'typescript/no-unsafe-call': 'off',
        'typescript/no-unsafe-member-access': 'off',
        'typescript/strict-boolean-expressions': 'off',
        'unicorn-js/no-global-object-property-assignment': 'off',
      },
    },
    {
      // `__coverage__` is the instrumenter's global, not a name this repo picks, and oxfmt strips the quotes that would exempt it. (2026-10-30)
      files: ['src/app/api/coverage/route.ts'],
      rules: {
        'no-underscore-dangle': 'off',
        'typescript/no-unsafe-type-assertion': 'off',
        'typescript-js/naming-convention': 'off',
        'unicorn/no-null': 'off',
      },
    },
    {
      files: ['**/*.ts', '**/*.tsx'],
      rules: {
        'import/no-unassigned-import': ['warn', { allow: ['@/app/global.css'] }],
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
        'max-statements': ['error', Number('20')],
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
      },
    },
    {
      // the proxy module src/proxy.ts re-exports as its default (the base already exempts proxy.ts itself)
      files: ['**/server/proxy/index.ts'],
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
  plugins: ['jsx-a11y'],
  rules: {
    'typescript/prefer-readonly-parameter-types': 'off',
  },
});
