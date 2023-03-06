import type { Editor } from 'obsidian';
import { createApp, type App } from 'vue';
import type AwesomeBrainManagerPlugin from '../main';
import type { SettingModel } from 'model/settings';
import CustomViewContainer from '../ui/CustomViewContainer.vue';
import { buildTagRules } from '../render/Tag';
import { Tag, type ExtApp } from '@/types/types';
import pinia, { useEditorStore } from '@/stores';

export const elId = 'custom-view-container';
export class EditorUtils {
    plugin: AwesomeBrainManagerPlugin;
    app: ExtApp;
    ele: HTMLDivElement;
    loaded: boolean = false;
    customViewVueApp: App;
    oldSelection: string;
    currentSelection: string;

    constructor() {}

    init(plugin: AwesomeBrainManagerPlugin) {
        this.plugin = plugin;
        this.app = plugin.app;
        this.ele = document.body.createEl('div', {
            attr: {
                id: elId,
            },
        });
        this.customViewVueApp = createApp(CustomViewContainer);
        this.customViewVueApp.use(pinia);
        this.customViewVueApp.mount(`#${elId}`);
    }

    unload() {
        if (this.ele) {
            document.body.removeChild(this.ele);
        }
    }

    changeToolbarPopover(e: MouseEvent, toolbarEnable: SettingModel<boolean, boolean>) {
        if (!toolbarEnable.value) {
            return;
        }

        const editor = this.app.workspace.activeEditor?.editor;
        if (!editor) return;
        const position = this.getCoords(editor);
        const activeNode = document.elementFromPoint(position.left, position.top);
        this.currentSelection = editor.getSelection()
        if (this.oldSelection === this.currentSelection) {
            return
        }
        if (activeNode) {
            this.oldSelection = editor.getSelection()
            useEditorStore().updateCurrentEle(activeNode);
            useEditorStore().updatePosition(position);
            useEditorStore().updateSelection(editor.getSelection());
        }
    }

    getCoords(editor: Editor): { left: number; top: number; right: number; bottom: number } {
        const cursorPos = editor.getCursor();
        // @ts-ignore
        return editor.coordsAtPos(cursorPos);
    }

    addTags = (tags: Tag[] = []) => {
        if (tags.length === 0) {
            return;
        }
        tags.forEach(tag => {
            const rules = buildTagRules(new Tag(tag[0], tag[1], tag[2], tag[3], tag[4]));
            rules.forEach(rule => this.plugin.style.sheet?.insertRule(rule, this.plugin.style.sheet.cssRules.length));
        });
        this.plugin.updateSnippet();
    };
}

export const EditorUtil = new EditorUtils();
