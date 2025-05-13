module.exports = {
  // Specify the Prettier parser to be used for different file types
  parser: 'typescript',

  // Tailwind CSS plugin to sort class names
  plugins: ['prettier-plugin-tailwindcss'],

  // Prettier configuration settings
  semi: true, // Include semicolons at the end of statements
  singleQuote: true, // Use single quotes instead of double quotes
  printWidth: 80, // Maximum line length
  tabWidth: 2, // Number of spaces per tab
  useTabs: false, // Indent lines with spaces instead of tabs
  trailingComma: 'es5', // Print trailing commas wherever possible in multi-line comma-separated syntactic structures. Valid options: 'es5' (default), 'none', 'all'
  bracketSpacing: true, // Print spaces between brackets in object literals
  arrowParens: 'always', // Include parentheses around a sole arrow function parameter for consistency
  endOfLine: 'lf', // Enforce line endings to be Linux/Mac (LF)

  // Configure overrides for specific file types
  overrides: [
    {
      files: '*.ts',
      options: {
        parser: 'typescript', // Use TypeScript parser for .ts files
      },
    },
    {
      files: '*.tsx',
      options: {
        parser: 'typescript', // Use TypeScript parser for .tsx files
      },
    },
    {
      files: '*.js',
      options: {
        parser: 'babel', // Use Babel parser for .js files
      },
    },
    {
      files: '*.jsx',
      options: {
        parser: 'babel', // Use Babel parser for .jsx files
      },
    },
    {
      files: '*.json',
      options: {
        parser: 'json', // Use JSON parser for .json files
      },
    },
  ],
};
