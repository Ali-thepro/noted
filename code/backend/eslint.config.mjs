import js from '@eslint/js'
import globals from 'globals'
import stylisticJs from '@stylistic/eslint-plugin-js'

const platform = process.platform === 'win32' ? 'windows' : 'unix'

export default [
  {
    files: ['**/*.{js,mjs}'],
    languageOptions: {
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
      ecmaVersion: 'latest',
    },
    plugins: {
      '@stylistic/js': stylisticJs
    },
    rules: {
      '@stylistic/js/indent': ['error', 2],
      '@stylistic/js/linebreak-style': ['error', platform],
      '@stylistic/js/quotes': ['error', 'single'],
      '@stylistic/js/semi': ['error', 'never'],
      'no-unused-vars': 'error',
      'no-undef': 'off',
      'eqeqeq': 'error',
      'no-trailing-spaces': 'error',
      'object-curly-spacing': ['error', 'always'],
      'arrow-spacing': ['error', { 'before': true, 'after': true }],
      'no-console': 'off',
      'eol-last': ['error', 'always'],
      ...js.configs.recommended.rules,
    },
  },
]
