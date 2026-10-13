import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
  // base
  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    languageOptions: { globals: globals.node },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-require-imports': 'off',
      'no-console': 'off',
    },
  },

  // must be last!
  eslintConfigPrettier,

  { ignores: ['**/dist/**', '**/node_modules/**'] },

  {
    files: ['frontend/**/*.{ts,tsx,js,jsx}'],
    // React settings later
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',

      globals: {
        ...globals.browser,
      },
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
];
