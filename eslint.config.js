// eslint.config.js (root)
import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import prettier from 'eslint-plugin-prettier';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  // Base JS config
  js.configs.recommended,

  // Global ignores
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.expo/**',
      '**/coverage/**',
      '**/.next/**',
      '**/android/**',
      '**/ios/**',
      '**/*.config.js',
      '**/*.config.mjs',
      'babel.config.js',
      'metro.config.js',
    ],
  },

  // TypeScript files configuration
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
        // Важно за typed linting
        project: true,
        tsconfigRootDir: process.cwd(),
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      prettier,
      import: importPlugin,
    },
    rules: {
      // TypeScript specific rules - relaxed for development
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-misused-promises': 'off',

      // ПРАЗНИ РЕДОВЕ ПРАВИЛА - това е правилото което търсиш!
      'no-multiple-empty-lines': [
        'error',
        {
          max: 1, // Максимум 1 празен ред между кода
          maxEOF: 0, // Няма празни редове в края на файла
          maxBOF: 0, // Няма празни редове в началото на файла
        },
      ],

      // Премахва празни редове в началото и края на блокове
      'padded-blocks': ['error', 'never'],

      // Контролира празни редове около коментари
      'lines-around-comment': [
        'error',
        {
          beforeBlockComment: false,
          afterBlockComment: false,
          beforeLineComment: false,
          afterLineComment: false,
          allowBlockStart: true,
          allowBlockEnd: true,
        },
      ],

      // По-строги правила за празни редове
      'padding-line-between-statements': [
        'error',
        // НЯМА празен ред преди return (освен ако не е необходимо)
        { blankLine: 'never', prev: '*', next: 'return' },
        // Празен ред след import statements
        { blankLine: 'always', prev: 'import', next: '*' },
        { blankLine: 'any', prev: 'import', next: 'import' },
        // Празен ред преди export statements
        { blankLine: 'always', prev: '*', next: 'export' },
        // НЯМА празни редове в началото на функции
        { blankLine: 'never', prev: ['const', 'let', 'var'], next: '*' },
        // НЯМА празни редове след opening brace на функция
        { blankLine: 'never', prev: 'block-like', next: '*' },
      ],

      // Prettier integration
      'prettier/prettier': [
        'error',
        {
          endOfLine: 'auto',
          semi: true,
          singleQuote: true,
          tabWidth: 2,
          trailingComma: 'es5',
        },
      ],
    },
  },

  // React/React Native specific configuration
  {
    files: ['**/mobile/**/*.tsx', '**/mobile/**/*.ts', '**/*.tsx'],
    plugins: {
      react,
      'react-hooks': reactHooks,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      // React specific rules
      'react/react-in-jsx-scope': 'off', // React 17+ doesn't need React import
      'react/prop-types': 'off', // Using TypeScript for prop validation
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Same empty lines rules for React files
      'no-multiple-empty-lines': [
        'error',
        {
          max: 1,
          maxEOF: 0,
          maxBOF: 0,
        },
      ],
    },
  },

  // Backend specific configuration
  {
    files: ['**/backend/**/*.ts'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        // Указваме специфичен tsconfig за backend
        project: './apps/backend/tsconfig.json',
        tsconfigRootDir: process.cwd(),
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      import: importPlugin,
    },
    rules: {
      // NestJS/Backend специфични правила (облекчени за развитие)

      // Изисква explicit return типове за функции (само warning)
      '@typescript-eslint/explicit-function-return-type': 'off', // Прекалено строго за развитие

      // Предпочита interface пред type за обекти
      '@typescript-eslint/consistent-type-definitions': ['warn', 'interface'],

      // Access modifiers - само за production код
      '@typescript-eslint/explicit-member-accessibility': 'off', // Прекалено строго

      // Забранява console.log в production код (използвай Logger)
      'no-console': [
        'warn',
        {
          allow: ['warn', 'error', 'info'], // Позволяваме повече за development
        },
      ],

      // Return await в try/catch блокове
      '@typescript-eslint/return-await': ['warn', 'in-try-catch'],

      // Error handling (облекчени - правилата които изискват type info могат да бъдат проблемни)
      '@typescript-eslint/no-floating-promises': 'off', // Изключваме временно
      '@typescript-eslint/promise-function-async': 'off', // Изключваме временно

      // Забранява празни catch блокове
      'no-empty': [
        'error',
        {
          allowEmptyCatch: false,
        },
      ],

      // Naming conventions за NestJS (облекчени)
      '@typescript-eslint/naming-convention': [
        'warn', // warning вместо error
        // Classes в PascalCase
        {
          selector: 'class',
          format: ['PascalCase'],
        },
        // Methods в camelCase
        {
          selector: 'method',
          format: ['camelCase'],
        },
        // Enums в PascalCase
        {
          selector: 'enum',
          format: ['PascalCase'],
        },
      ],

      // Imports организация (синхронизирано с VSCode)
      'import/order': [
        'error',
        {
          groups: [
            'builtin', // Node.js built-ins (fs, path, etc.)
            'external', // npm packages (react, lodash, etc.)
            'internal', // Internal modules (../../utils)
            'parent', // Parent directories (../components)
            'sibling', // Same directory (./Button)
            'index', // Index files (./index)
            'type', // Type imports
          ],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
          pathGroups: [
            {
              pattern: '@/**',
              group: 'internal',
              position: 'before',
            },
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
        },
      ],

      // Забранява unused imports
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],

      // Премахва duplicate imports
      'import/no-duplicates': 'error',

      // TypeScript specific import rules
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'separate-type-imports',
        },
      ],
    },
  },
];
