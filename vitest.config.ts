/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        setupFiles: ['./tests/setup.ts'],
        globals: true,
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html', 'lcov'],
            include: [
                'components/ui/Button.tsx',
                'hooks/utils/useDebounce.ts',
                'lib/utils.ts',
                'app/api/health/route.ts'
            ],
            exclude: [
                'node_modules/',
                'tests/',
                '**/*.d.ts',
                '.next/',
                'infrastructure/',
                'dist/',
            ],
            thresholds: {
                branches: 80,
                functions: 80,
                lines: 80,
                statements: 80,
            },
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './'),
            '@/components': path.resolve(__dirname, './components'),
            '@/hooks': path.resolve(__dirname, './hooks'),
            '@/lib': path.resolve(__dirname, './lib'),
            '@/types': path.resolve(__dirname, './types'),
            '@/stores': path.resolve(__dirname, './stores'),
        },
    },
})