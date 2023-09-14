module.exports = {
    env: {
        es6: true,
        node: true,
        browser: true,
    },
    extends: [
        'plugin:vue/base',
        'eslint:recommended',
        'plugin:import/recommended',
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
        activeDocument: 'readonly',
    },
    parser: 'vue-eslint-parser',
    parserOptions: {
        parser: '@typescript-eslint/parser',
        // TODO 在工作区中，指定此目录会导致无法正常工作
        // tsconfigRootDir: './',
        // project: './tsconfig.json',
        ecmaVersion: 6,
        sourceType: 'module',
        ecmaFeatures: {
            modules: true,
        },
    },
    plugins: ['@typescript-eslint', 'import'],
    rules: {
        // TODO
        'import/no-unresolved': ['error', { ignore: ['^virtual:'] }],
        'vue/multi-word-component-names': 1,
        'vue/no-v-model-argument': 'off',
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
                alwaysTryTypes: true,
                project: ['tsconfig.json', 'other-packages/*/tsconfig.json'],
            },
        },
    },
};
