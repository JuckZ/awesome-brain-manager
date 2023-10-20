import { URL, fileURLToPath } from 'node:url';
import { resolve } from 'path';
import UnoCSS from 'unocss/vite';
import { type PluginOption, defineConfig, loadEnv } from 'vite';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { visualizer } from 'rollup-plugin-visualizer';
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
                        // include: ['path', 'fs', 'util'],
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
                    // // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
                    globals: {
                        // vue: 'Vue',
                        // obsidian: 'obsidian',
                        // moment: 'moment',
                        // util: 'util',
                        // fs: 'fs',
                        // path: 'path',
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
            UnoCSS(),
            // viteStaticCopy({
            //     targets: [
            //         {
            //             src: '.hotreload',
            //             dest: '',
            //         },
            //     ],
            // }),
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
            // visualizer({
            //     open: true, //注意这里要设置为true，否则无效
            //     gzipSize: true,
            //     brotliSize: true,
            // }) as PluginOption,
        ],
        optimizeDeps: {
            // include: [
            //     'moment',
            //     '@lezer/common',
            //     '@lezer/highlight',
            //     '@lezer/lr',
            //     'chart.js',
            //     'commander',
            //     'cursor-effects',
            //     'emoji-mart',
            //     '@emoji-mart/data',
            //     'lodash-es',
            //     'naive-ui',
            //     'ora',
            //     'party-js',
            //     'pinia',
            //     'rrule',
            //     'sql.js',
            //     'svelte',
            //     'twemoji',
            //     'vue',
            //     'vue3-radial-progress',
            //     ...builtins,
            // ],
        },
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
