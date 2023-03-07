import { defineStore } from 'pinia';

import { reactive } from 'vue';
import type { SystemState } from '../types/types';

export const useSystemStore = defineStore('system', () => {
    const systemState: SystemState = reactive({
        language: 'en',
        theme: 'light',
    });

    function updateLanguage(language) {
        systemState.language = language;
    }

    function updateTheme(theme) {
        systemState.theme = theme;
    }

    return {
        systemState,
        updateLanguage,
        updateTheme,
    };
});
