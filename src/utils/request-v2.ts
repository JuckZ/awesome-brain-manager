let request, test;

if (import.meta.env.VITE_APP_MODE === 'vitest') {
    import('obsidian').then(module => {
        request = module.request;
    });
} else {
    test = () => '123';
}

export { request, test };
