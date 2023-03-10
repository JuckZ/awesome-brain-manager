import { URL, fileURLToPath } from 'node:url';
import { resolve } from 'path';
import { defineConfig, loadEnv } from 'vite';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import builtins from 'builtin-modules';

import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import wasm from 'vite-plugin-wasm';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import topLevelAwait from 'vite-plugin-top-level-await';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import { ModuleFormat } from 'rollup';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
    // Load env file based on `mode` in the current working directory.
    // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
    const env = loadEnv(mode, process.cwd(), 'VITE_');
    const prod = process.argv[3] !== '-w';
    const dir = process.env.OUTDIR ? process.env.OUTDIR : env['VITE_OUTDIR'] ? env['VITE_OUTDIR'] : 'dest';

    return {
        build: {
            copyPublicDir: false,
            outDir: dir,
            lib: {
                entry: [resolve(__dirname, 'src/main.ts')],
                name: 'AwesomeBrainManager',
                // the proper extensions will be added
                fileName: (format: ModuleFormat, entryName: string) => {
                    if (format === 'umd') {
                        return 'main.js';
                    } else {
                        return entryName;
                    }
                },
                formats: ['umd'],
            },
            minify: prod ? true : false,
            sourcemap: prod ? false : true,
            rollupOptions: {
                plugins: [
                    nodeResolve({
                        // browser: true
                    }),
                    nodePolyfills({
                        sourceMap: true,
                    }),
                ],
                output: {
                    exports: 'named',
                    assetFileNames: assetInfo => {
                        if (assetInfo.name == 'style.css') {
                            return 'styles.css';
                        }
                        return assetInfo.name || '';
                    },
                    // // ??? UMD ??????????????????????????????????????????????????????????????????
                    globals: {
                        // vue: 'Vue',
                    },
                },
                external: [
                    'obsidian',
                    'electron',
                    'moment',
                    '@codemirror/autocomplete',
                    '@codemirror/collab',
                    '@codemirror/commands',
                    '@codemirror/language',
                    '@codemirror/lint',
                    '@codemirror/search',
                    '@codemirror/state',
                    '@codemirror/view',
                    '@lezer/common',
                    '@lezer/highlight',
                    '@lezer/lr',
                    ...builtins,
                ],
            },
        },
        define: {
            'process.env.NODE_ENV': '"production"',
        },
        plugins: [
            viteStaticCopy({
                targets: [
                    {
                        src: '.hotreload',
                        dest: '',
                    },
                ],
            }),
            svelte({
                configFile: 'svelte.config.js',
            }),
            wasm(),
            topLevelAwait(),
            vue({
                template: {
                    compilerOptions: {
                        isCustomElement: tag => ['webview'].includes(tag),
                    },
                },
            }),
            vueJsx(),
        ],
        optimizeDeps: {},
        resolve: {
            alias: [
                {
                    find: '@',
                    replacement: fileURLToPath(new URL('./src', import.meta.url)),
                },
            ],
        },
        logLevel: 'info',
    };
});
