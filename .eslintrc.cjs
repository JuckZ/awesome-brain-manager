module.exports = {
    env: {
        es6: true,
        node: true,
        browser: true,
    },
    extends: [
        'plugin:vue/base',
        'eslint:recommended',
        'plugin:vue/vue3-recommended',
        'plugin:vue/essential',
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended',
        'eslint-config-prettier',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:import/typescript',
    ],
    globals: {
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly',
    },
    parser: 'vue-eslint-parser',
    parserOptions: {
        parser: '@typescript-eslint/parser',
        ecmaVersion: 6,
        sourceType: 'module',
        ecmaFeatures: {
            modules: true,
        },
    },
    plugins: ['@typescript-eslint', 'import'],
    rules: {
        // TODO
        // 'import/no-unresolve': 'error',
        'linebreak-style': ['error', 'unix'],
        quotes: ['error', 'single', { avoidEscape: true }],
        '@typescript-eslint/no-unused-vars': 0, // Configured in tsconfig instead.
        'no-unused-vars': 0, // Configured in tsconfig instead.
        'prettier/prettier': [
            'error',
            {
                trailingComma: 'all',
                printWidth: 120,
                tabWidth: 4,
                useTabs: false,
                singleQuote: true,
                bracketSpacing: true,
            },
        ],
        semi: ['error', 'always'],
        'import/order': 'error',
        'sort-imports': [
            'error',
            {
                ignoreDeclarationSort: true,
            },
        ],
    },
    settings: {
        'import/parsers': {
            '@typescript-eslint/parser': ['.ts', '.tsx'],
        },
        'import/resolver': {
            typescript: {
                alwaysTryTypes: true, // always try to resolve types under `<root>@types` directory even it doesn't contain any source code, like `@types/unist`

                // Choose from one of the "project" configs below or omit to use <root>/tsconfig.json by default

                // Multiple tsconfigs (Useful for monorepos)
                // use an array of glob patterns
                project: ['packages/*/tsconfig.json', 'other-packages/*/tsconfig.json'],
            },
        },
    },
};
