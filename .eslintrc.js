const path = require('path');

module.exports = {
  extends: [
    'airbnb-typescript',
    'prettier',
    'prettier/react',
    'prettier/@typescript-eslint',
  ],
  parserOptions: {
    project: path.join(__dirname, 'tsconfig.json'),
  },
  rules: {
    'max-classes-per-file': 'off',
    'no-console': ['error', { allow: ['warn', 'error'] }],
    'sort-imports': [
      'error',
      {
        ignoreCase: false,
        ignoreDeclarationSort: false,
        ignoreMemberSort: false,
        memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
        allowSeparatedGroups: true,
      },
    ],
    'import/prefer-default-export': 'off',
    'react/prop-types': 'off',
    '@typescript-eslint/explicit-member-accessibility': [
      'error',
      {
        accessibility: 'explicit',
        overrides: {
          constructors: 'no-public',
        },
      },
    ],
  },
  overrides: [
    {
      files: ['**/*.spec.ts', '**/*.spec.tsx'],
      env: { 'jest/globals': true },
      plugins: ['jest'],
      extends: ['plugin:jest/all'],
      rules: {
        'import/no-extraneous-dependencies': 'off',
        'jest/prefer-expect-assertions': [
          'error',
          { onlyFunctionsWithAsyncKeyword: true },
        ],
        'jest/no-hooks': [
          'error',
          {
            allow: ['beforeAll', 'afterEach'],
          },
        ],
      },
    },
  ],
};
