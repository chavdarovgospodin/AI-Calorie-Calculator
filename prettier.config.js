// prettier.config.js (root)
export default {
  // Basic formatting
  semi: true,
  singleQuote: true,
  quoteProps: 'as-needed',
  tabWidth: 2,
  useTabs: false,

  // Line length
  printWidth: 100,

  // Trailing commas
  trailingComma: 'es5',

  // Brackets
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'avoid',

  // Line endings (auto handles different OS)
  endOfLine: 'auto',

  // JSX specific
  jsxSingleQuote: true,

  // Override for specific file types
  overrides: [
    {
      files: '*.json',
      options: {
        printWidth: 120,
        tabWidth: 2,
      },
    },
    {
      files: '*.md',
      options: {
        printWidth: 80,
        proseWrap: 'always',
      },
    },
    {
      files: ['apps/mobile/**/*.{ts,tsx}'],
      options: {
        // React Native specific settings
        printWidth: 90,
        singleQuote: true,
        jsxSingleQuote: true,
      },
    },
  ],
};
