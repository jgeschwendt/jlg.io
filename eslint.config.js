import { config as defineConfig } from '@jlg/eslint';

const config = defineConfig(
  {},
  {
    ignores: ['.next', 'next-env.d.ts', 'src/components/icons/Icons.tsx'],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
      reportUnusedInlineConfigs: 'error',
    },
    rules: {
      '@typescript-eslint/prefer-readonly-parameter-types': 'off',
      'import/no-internal-modules': [
        'warn',
        {
          allow: [
            'motion/react',
            'next/font/google',
            'next/headers',
            'next/image',
            'next/link',
            'next/server',
          ],
        },
      ],
      'import/no-unassigned-import': [
        'warn',
        {
          allow: ['@/app/global.css'],
        },
      ],
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
    files: ['**/server/proxy/index.ts', 'src/proxy.ts'],
    rules: {
      'import/no-default-export': 'off',
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      'max-statements': 'off',
    },
  },
  {
    files: ['src/app/resume/Resume.tsx'],
    rules: {
      'react/jsx-curly-brace-presence': 'off',
      'react/jsx-no-literals': 'off',
    },
  },
);

export default config;
