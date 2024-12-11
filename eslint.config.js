import globals from 'globals';
import javascript from '@eslint/js';
import prettier from 'eslint-config-prettier';
import imports from 'eslint-plugin-import';
import react from 'eslint-plugin-react';
import typescript from 'typescript-eslint';
import unicorn from 'eslint-plugin-unicorn';
//_ import next from '@next/eslint-plugin-next';

const jsxMaxDepth = 5;

// https://eslint.org/docs/latest/rules/no-magic-numbers#options
const magicNumbers = {
  detectObjects: true,
  enforceConst: true,
  ignore: [-1, 0, 1, 2],
  ignoreArrayIndexes: false,
  ignoreClassFieldInitialValues: false,
  ignoreDefaultValues: false,
};

// https://typescript-eslint.io/rules/no-magic-numbers/#options
const magicNumbersTypescript = {
  ignoreEnums: false,
  ignoreNumericLiteralTypes: false,
  ignoreReadonlyClassProperties: false,
  ignoreTypeIndexes: false,
  ...magicNumbers,
};

/** @type {import('eslint').Linter.Config[]} */
const config = typescript.config([
  {
    ignores: ['.next', 'next-env.d.ts', '.secrets', 'out'],
  },
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    linterOptions: {
      noInlineConfig: false,
      reportUnusedDisableDirectives: 'error',
    },
  },
  {
    extends: [
      imports.flatConfigs.recommended,
      javascript.configs.all,
      unicorn.configs['flat/all'],
    ],
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    // https://typescript-eslint.io/troubleshooting/typed-linting/performance#eslint-plugin-import
    rules: {
      'capitalized-comments': [
        'error',
        'always',
        {
          block: {
            ignoreInlineComments: true,
            ignorePattern: ['c8'].join('|'),
          },
          line: {
            ignorePattern: ['prettier-ignore'].join('|'),
          },
        },
      ],
      'id-length': [
        'error',
        {
          exceptions: ['a', 'b', 'm', 'x', 'y', 'z'],
        },
      ],
      'import/no-unresolved': 'off',
      'max-lines-per-function': 'off',
      'no-magic-numbers': ['error', magicNumbers],
      'no-ternary': 'off',
      'no-undefined': 'off',
      'one-var': ['error', 'never'],
      'sort-imports': 'off',
      'sort-keys': ['error', 'asc', { natural: true }],
      'unicorn/prevent-abbreviations': [
        'error',
        {
          allowList: { props: true },
        },
      ],
    },
  },
  {
    extends: [typescript.configs.all],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: typescript.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      '@typescript-eslint': typescript.plugin,
    },
    rules: {
      '@typescript-eslint/naming-convention': 'off',
      '@typescript-eslint/no-magic-numbers': ['error', magicNumbersTypescript],
      '@typescript-eslint/prefer-readonly-parameter-types': [
        'off',
        {
          ignoreInferredTypes: true,
        },
      ],
    },
  },
  {
    extends: [react.configs.flat.all],
    files: ['**/*.{jsx,tsx}'],
    languageOptions: react.configs.flat.all.languageOptions,
    plugins: { react: react.configs.flat.all.plugins.react },
    rules: {
      // Align with `react/function-component-definition`
      'func-style': ['error', 'declaration'],

      'react/forbid-component-props': [
        'error',
        {
          forbid: [{ allowedFor: ['Link'], propName: 'className' }],
        },
      ],

      'react/jsx-curly-brace-presence': [
        'error',
        { children: 'always', propElementValues: 'never', props: 'never' },
      ],

      // Drop `.js`, add `.tsx`
      'react/jsx-filename-extension': [
        'error',
        {
          extensions: ['.jsx', '.tsx'],
        },
      ],

      'react/jsx-max-depth': ['error', { max: jsxMaxDepth }],

      // Re-enable on a per-project basis
      'react/jsx-props-no-spreading': 'off',

      // Modern automatic JSX transform
      'react/react-in-jsx-scope': 'off',

      // Match JSX Component Name
      'unicorn/filename-case': ['error', { case: 'pascalCase' }],
    },
    settings: {
      react: { version: 'detect' },
    },
  },
  {
    files: ['**/*.jsx'],
    rules: {
      'no-magic-numbers': ['error', { ...magicNumbers, detectObjects: false }],
    },
  },
  {
    files: ['**/*.tsx'],
    rules: {
      '@typescript-eslint/no-magic-numbers': [
        'error',
        { ...magicNumbersTypescript, detectObjects: false },
      ],
    },
  },
  // https://nextjs.org/docs/app/api-reference/file-conventions
  {
    files: ['**/{layout,page}.{jsx,tsx}'],
    languageOptions: react.configs.flat.all.languageOptions,
    plugins: { react: react.configs.flat.all.plugins.react },
    rules: {
      // Match react rule
      'func-style': [
        'error',
        'declaration',
        {
          overrides: { namedExports: 'expression' },
        },
      ],

      'react/jsx-filename-extension': [
        'error',
        {
          extensions: ['.jsx', '.tsx'],
        },
      ],
      'react/jsx-props-no-spreading': 'off',
      'react/react-in-jsx-scope': 'off',

      'unicorn/filename-case': ['error', { case: 'kebabCase' }],
    },
  },
  {
    rules: prettier.rules,
  },
]);

export default config;
