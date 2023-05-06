import { defineStore } from 'pinia';

import { reactive } from 'vue';
import type { SystemState } from '../types/types';

export const useSystemStore = defineStore('system', () => {
    const systemState: SystemState = reactive({
        language: 'en',
        theme: 'light',
        mouseCoords: {
            x: 0,
            y: 0,
        },
    });

    function updateLanguage(language) {
        systemState.language = language;
    }

    function updateTheme(theme) {
        systemState.theme = theme;
    }

    function updateMouseCoords(mouseCoords) {
        systemState.mouseCoords = mouseCoords;
    }

    return {
        systemState,
        updateLanguage,
        updateTheme,
        updateMouseCoords,
    };
});
