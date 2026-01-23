import { FlatCompat } from '@eslint/eslintrc'
import typescriptEslint from '@typescript-eslint/eslint-plugin'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript', 'prettier'),
  {
    plugins: {
      '@typescript-eslint': typescriptEslint,
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      // Import sorting rules
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            // React and Next.js imports
            ['^react', '^next'],
            // External packages
            ['^@?\\w'],
            // Internal aliases (@/)
            ['^@/'],
            // Relative imports
            ['^\\.'],
            // Type imports
            ['^.*\\u0000$'],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',

      // TypeScript strict rules
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
    },
  },
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
      'coverage/**',
      '_bmad/**',
      '_bmad-output/**',
      'docs/**',
      '.windsurf/**',
      '.github/**',
      '.vscode/**',
    ],
  },
]

export default eslintConfig
