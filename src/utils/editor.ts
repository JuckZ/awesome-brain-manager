import type { App, Editor } from 'obsidian';
import { createApp } from 'vue';
import type AwesomeBrainManagerPlugin from '../main';
import CustomViewContainer from '../ui/CustomViewContainer.vue';
import type { SettingModel } from 'model/settings';
import pinia, { useEditorStore } from '@/stores';

export const elId = 'custom-view-container';
export const customEl = createEl('div', {
    attr: {
        id: elId,
    },
});

export function loadCustomViewContainer(plugin: AwesomeBrainManagerPlugin) {
    document.body.appendChild(customEl);
    const customViewVueApp = createApp(CustomViewContainer, {
        plugin,
    });
	customViewVueApp.use(pinia)
    customViewVueApp.mount(`#${elId}`);
}

export function unloadCustomViewContainer() {
    document.body.removeChild(customEl);
}

export function changeToolbarPopover(app: App, e: MouseEvent, toolbarEnable: SettingModel<boolean, boolean>) {
    if (!toolbarEnable.value) {
        return;
    }
    const editor = app.workspace.activeEditor?.editor;
    if (!editor) return;
	console.log('232323');
	useEditorStore().updatePosition(getCoords(editor))
	useEditorStore().updateSelection(editor.getSelection())
}

export const getCoords = (editor: Editor): { left: number; top: number; right: number; bottom: number } => {
    const cursorPos = editor.getCursor();
    // @ts-ignore
    return editor.coordsAtPos(cursorPos);
};
