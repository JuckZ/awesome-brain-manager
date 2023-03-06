import { defineStore } from 'pinia';

import { reactive, ref } from 'vue';
import type { EditorState } from '../types/types';

export const useEditorStore = defineStore('editor', () => {
    const totalTask = ref(0);

    const editorState: EditorState = reactive({
        currentEle: null as unknown as Element,
        position: {
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
        },
        selection: '',
    });

    function increment() {
        totalTask.value++;
    }
    function updatePosition(position) {
        editorState.position = position;
    }

    function updateSelection(selection) {
        editorState.selection = selection;
    }

    function updateCurrentEle(ele: Element) {
        editorState.currentEle = ele;
    }
    return {
        editorState,
        totalTime: 0,
        totalTask,
        increment,
        updatePosition,
        updateSelection,
        updateCurrentEle,
    };
});
