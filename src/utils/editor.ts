import { App, Editor, MarkdownView } from 'obsidian';
import type {  EditorPosition } from 'obsidian';
import { createApp, ref } from 'vue';
import type { App as VueApp, Ref } from 'vue';
import type AwesomeBrainManagerPlugin from '../main';
import CustomViewContainer from '../ui/CustomViewContainer.vue';
import type { SettingModel } from 'model/settings';

export const elId = 'custom-view-container';
export const customEl = createEl('div', {
    attr: {
        id: elId,
    },
});

export type EditorState = { position: { top: number; bottom: number; left: number; right: number }; selection: string };

export const currentState: Ref<EditorState> = ref({
    position: {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
    },
    selection: '',
});

export function loadCustomViewContainer(plugin: AwesomeBrainManagerPlugin) {
    document.body.appendChild(customEl);
    const customViewVueApp = createApp(CustomViewContainer, {
        plugin,
        currentState,
    });
    customViewVueApp.mount(`#${elId}`);
}

export function unloadCustomViewContainer() {
    document.body.removeChild(customEl);
}

export function getEditorPositionFromIndex(content: string, index: number): EditorPosition {
    const substr = content.substr(0, index);

    let l = 0;
    let offset = -1;
    let r = -1;
    for (; (r = substr.indexOf('\n', r + 1)) !== -1; l++, offset = r);
    offset += 1;

    const ch = content.substr(offset, index - offset).length;

    return { line: l, ch: ch };
}

export function getModestate(app: App) {
    const activePane = app.workspace.getActiveViewOfType(MarkdownView);
    if (activePane) {
        const currentmode = activePane?.getMode();
        if (currentmode == 'preview') {
            return false;
        } else if (currentmode == 'source') {
            return true;
        } else return false;
    }
}

export function changeToolbarPopover(app: App, e: MouseEvent, toolbarEnable: SettingModel<boolean, boolean>) {
    if (!toolbarEnable.value) {
        return;
    }
    const editor = app.workspace.activeEditor?.editor;
    if (!editor) return;
    let selected = editor.getSelection();
    currentState.value.selection = selected;
    currentState.value.position = getCoords(editor);
}

export const getCoords = (editor: Editor): { left: number; top: number; right: number; bottom: number } => {
    const cursorPos = editor.getCursor();
    // @ts-ignore
    return editor.coordsAtPos(cursorPos);
};
