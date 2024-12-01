module.exports = {
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:react/recommended',
      'next/core-web-vitals', // This includes react-hooks as well
      'prettier'
    ],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint', 'react'], // Removed 'react-hooks' plugin
    rules: {
      'react/react-in-jsx-scope': 'off', // JSX no longer requires React import
      // Add any other custom rules here
    },
    settings: {
      react: {
        version: 'detect', // Automatically detect the React version
      },
    },
  };
  