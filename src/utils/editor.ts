import type { Editor } from 'obsidian';
import type AwesomeBrainManagerPlugin from '../main';
import type { SettingModel } from 'model/settings';
import { customViewVueApp, useEditorStore } from '@/stores';
import { buildTagRules } from '../render/Tag';
import { Tag, type ExtApp } from '@/types/types';

export const elId = 'custom-view-container';

export class EditorUtils {
    plugin: AwesomeBrainManagerPlugin;
    app: ExtApp;
    ele: HTMLDivElement;
    loaded: boolean = false;

    constructor() {}

    init(plugin: AwesomeBrainManagerPlugin) {
        this.plugin = plugin;
        this.app = plugin.app;
    }

    loadCustomViewContainer() {
        this.ele = document.body.createEl('div', {
            attr: {
                id: elId,
            },
        });
        customViewVueApp.mount(`#${elId}`);
        this.loaded = true;
    }

    unloadCustomViewContainer() {
        if (this.ele) {
            document.body.removeChild(this.ele);
        }
        this.loaded = false;
    }

    changeToolbarPopover(e: MouseEvent, toolbarEnable: SettingModel<boolean, boolean>) {
        if (!toolbarEnable.value) {
            return;
        }
        if (!this.loaded) {
            editorUtil.loadCustomViewContainer();
        }
        const editor = this.app.workspace.activeEditor?.editor;
        if (!editor) return;
        useEditorStore().updatePosition(this.getCoords(editor));
        useEditorStore().updateSelection(editor.getSelection());
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

export const editorUtil = new EditorUtils();
