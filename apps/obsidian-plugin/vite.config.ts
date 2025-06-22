import { URL, fileURLToPath } from 'node:url';
import { resolve } from 'path';
import UnoCSS from 'unocss/vite';
import { defineConfig, loadEnv, normalizePath } from 'vite';
import { nodeResolve } from '@rollup/plugin-node-resolve';
// import { visualizer } from 'rollup-plugin-visualizer';
import builtins from 'builtin-modules';
import nodePolyfills from 'rollup-plugin-polyfill-node';

import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { ModuleFormat } from 'rollup';
import path from 'node:path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    // Load env file based on `mode` in the current working directory.
    // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
    const env = loadEnv(mode, process.cwd(), 'VITE_');
    const prod = process.argv[3] !== '-w';
    const dir = process.env.OUTDIR ? process.env.OUTDIR : env['VITE_OUTDIR'] ? env['VITE_OUTDIR'] : 'dist';

    return {
        build: {
            copyPublicDir: false,
            outDir: dir,
            lib: {
                entry: [resolve(__dirname, 'src/main.ts')],
                name: 'AwesomeBrainManager',
                // the proper extensions will be added
                fileName: (format: ModuleFormat, entryName: string) => {
                    if (format === 'cjs') {
                        return 'main.js';
                    } else {
                        return entryName;
                    }
                },
                formats: ['cjs'],
            },
            minify: prod,
            sourcemap: !prod,
            rollupOptions: {
                plugins: [
                    nodeResolve({
                        // browser: true
                    }),
                    // 如果需要Node.js polyfill，可以这样配置
                    nodePolyfills({
                        include: ['path', 'fs', 'util'], // 明确指定需要的模块
                        sourceMap: true,
                    }),
                ],
                output: {
                    exports: 'named',
                    // 强制生成单个文件
                    inlineDynamicImports: true,
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
            viteStaticCopy({
                targets: [
                    {
                        src: '.hotreload',
                        dest: normalizePath(path.resolve(dir)),
                    },
                    {
                        src: 'manifest.json',
                        rename: 'manifest.json',
                        dest: normalizePath(path.resolve(dir)),
                    },
                ],
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
