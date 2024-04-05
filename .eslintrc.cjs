/** @type import('eslint').Linter.Config */
module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
  },
  extends: 'xo',
  overrides: [
    {
      env: {
        node: true,
      },
      files: ['.eslintrc.{js,cjs}'],
      parserOptions: {
        sourceType: 'script',
      },
    },
    {
      env: {
        browser: true,
        es2024: true,
      },
      extends: [
        'xo-typescript/space',
        'plugin:solid/typescript',
        'plugin:tailwindcss/recommended',
        'prettier',
      ],
      files: ['*.ts', '*.tsx'],
      rules: {
        '@typescript-eslint/ban-types': [
          'error',
          {
            types: {
              null: false,
            },
          },
        ],
      },
    },
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {},
};
