module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  globals: {
    AMap: 'readonly',
    THREE: 'readonly',
  },
  extends: ['airbnb-base', 'eslint:recommended', 'plugin:vue/essential'],
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: 'babel-eslint',
    sourceType: 'module',
  },
  plugins: ['vue'],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-unused-vars': ['off', { vars: 'all', args: 'none' }],
    semi: ['error', 'always'],
    'comma-dangle': ['off'],
    'space-before-function-paren': ['off'],
    indent: ['off'],
    'node/no-deprecated-api': ['off'],
    'import/no-unresolved': ['off'],
    'no-param-reassign': ['off'],
    'implicit-arrow-linebreak': ['off'],
    'import/prefer-default-export': ['off'],
    'no-underscore-dangle': ['off'],
    'vue/custom-event-name-casing': ['off'],
    'no-unused-expressions': ['off'],
    'operator-linebreak': ['off'],
    'no-prototype-builtins': ['off'],
    'consistent-return': ['off'],
    'object-curly-newline': ['off'],
    'no-restricted-globals': ['off'],
    'no-restricted-properties': ['off'],
    'prefer-destructuring': ['off'],
    'no-bitwise': ['off'],
    'import/no-dynamic-require': ['off'],
    'global-require': ['off'],
    'import/no-extraneous-dependencies': ['off'],
    'no-nested-ternary': ['off'],
    'linebreak-style': ['off'],
    'max-len': ['off'],
    'wrap-iife': ['off'],
  },
};
