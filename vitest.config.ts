import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'jsdom',
        coverage: {
            provider: 'v8',
        },
        include: ['src/__test__/**'],
        exclude: ['**/tests-examples', 'node_modules', 'src/tests'],
    },
    resolve: {
        alias: {
            '@': '/src',
        },
    },
});
