// apps/mobile/.eslintrc.js
module.exports = {
  extends: [
    'expo',
    '@react-native-community',
    '@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
    // НЕ използваме project за mobile
  },
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'react-native'],
  rules: {
    // React Native специфични правила
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react-native/no-unused-styles': 'warn',
    'react-native/split-platform-components': 'error',
    'react-native/no-inline-styles': 'warn',
    'react-native/no-color-literals': 'warn',

    // TypeScript правила (облекчени)
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        ignoreRestSiblings: true,
        args: 'after-used',
        caughtErrors: 'none', // Игнорира неизползвани error параметри в catch
      },
    ],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',

    // Общи правила
    'no-console': 'warn',
    'prefer-const': 'error',
    'no-var': 'error',

    // Празни редове
    'no-multiple-empty-lines': [
      'error',
      {
        max: 1,
        maxEOF: 0,
        maxBOF: 0,
      },
    ],
  },
  ignorePatterns: [
    'node_modules/',
    '.expo/',
    'web-build/',
    'babel.config.js',
    'metro.config.js',
  ],
};
