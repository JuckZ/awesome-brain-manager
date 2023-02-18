import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default {
    // svelte options
    extensions: ['.svelte'],
    compilerOptions: {},
    preprocess: vitePreprocess(),
    onwarn: (warning, handler) => handler(warning),
    // plugin options
    vitePlugin: {
        exclude: [],
        // experimental options
        experimental: {},
    },
};
