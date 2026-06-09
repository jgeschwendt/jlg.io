import { config as defineConfig } from '@jlg/eslint';
import next from '@next/eslint-plugin-next';

const config = defineConfig(
  {},
  next.configs['core-web-vitals'],
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
            'next/navigation',
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
    files: ['src/proxy.ts', '**/server/proxy/index.ts', '**/default.tsx'],
    rules: {
      'import/no-default-export': 'off',
    },
  },
  {
    // react-three-fiber intrinsics + GLSL shader code don't fit the base rules
    files: ['src/components/WaterBackground.tsx'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-magic-numbers': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      'func-style': 'off',
      'id-length': 'off',
      'import/no-namespace': 'off',
      'no-inline-comments': 'off',
      'react/forbid-component-props': 'off',
      'react/no-multi-comp': 'off',
      'react/no-unknown-property': 'off',
      'sort-keys': 'off',
      'unicorn/no-null': 'off',
      'unicorn/prevent-abbreviations': 'off',
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
