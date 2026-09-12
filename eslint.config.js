import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn',
      'no-console': 'off', // for services logs
    },
  },
  eslintConfigPrettier, // always last!!
  { ignores: ['**/dist/**', '**/node_modules/**'] },
);
