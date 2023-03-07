import type { Editor } from 'obsidian';
import { type App, createApp } from 'vue';
import type AwesomeBrainManagerPlugin from '../main';
import AppVue from '../ui/App.vue';
import { buildTagRules } from '../render/Tag';
import type { SettingModel } from 'model/settings';
import { type ExtApp, Tag } from '@/types/types';
import pinia, { useEditorStore } from '@/stores';

export const appContainerId = 'app-container';
export class EditorUtils {
    plugin: AwesomeBrainManagerPlugin;
    app: ExtApp;
    ele: HTMLDivElement;
    loaded = false;
    appViewVueApp: App;
    oldSelection: string;
    currentSelection: string;

    init(plugin: AwesomeBrainManagerPlugin) {
        this.plugin = plugin;
        this.app = plugin.app;
        this.ele = document.body.createEl('div', {
            attr: {
                id: appContainerId,
            },
        });
        this.appViewVueApp = createApp(AppVue);
        this.appViewVueApp.use(pinia);
        this.appViewVueApp.mount(`#${appContainerId}`);
    }

    static getCurrentSelection(editor: Editor) {
        const cursorPos = editor.getCursor();
        let content = editor.getSelection();
        if (!content) {
            if (cursorPos) {
                content = editor.getLine(cursorPos.line);
            }
        }
        return content;
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
        this.currentSelection = editor.getSelection();
        if (this.oldSelection === this.currentSelection) {
            return;
        }
        if (activeNode) {
            this.oldSelection = editor.getSelection();
            useEditorStore().updateCurrentEle(activeNode);
            useEditorStore().updatePosition(position);
            useEditorStore().updateSelection(editor.getSelection());
        }
    }

    getCoords(editor: Editor): { left: number; top: number; right: number; bottom: number } {
        const cursorPos = editor.getCursor();
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
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
