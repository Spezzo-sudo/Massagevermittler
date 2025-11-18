export default [
  {
    ignores: ['node_modules', '.next']
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: ['next/core-web-vitals'],
    rules: {
      'react/jsx-indent': ['error', 2],
      'react/jsx-indent-props': ['error', 2],
      'indent': ['error', 2, { SwitchCase: 1 }],
      'quotes': ['error', 'single'],
      'semi': ['error', 'always']
    }
  }
];
