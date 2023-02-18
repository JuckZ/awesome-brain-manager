import { App, EditorPosition, MarkdownView } from 'obsidian';
import { App as VueApp, createApp } from 'vue';
import AwesomeBrainManagerPlugin from '../main';
import ChatViewContainer from '../ui/ChatViewContainer.vue';

export const elId = 'chat-pop-over';
export const chatEl = createEl('div', {
    attr: {
        id: elId,
        style: 'position: fixed;',
    },
});

export function loadChatEl() {
    // chatEl.style.visibility = 'hidden';
    // visible
    document.body.appendChild(chatEl);
    const chatViewVueApp = createApp(ChatViewContainer);
    chatViewVueApp.mount(`#${elId}`);
}

export function unloadChatEl() {
    document.body.removeChild(chatEl);
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

export function changeChatPopover(app: App, e: MouseEvent) {
    const editor = app.workspace.activeEditor?.editor;
    if (!editor?.somethingSelected()) {
        chatEl.toggleVisibility(false);
        return;
    }
    chatEl.toggleVisibility(true);
    const cursor = getCoords(editor);
    chatEl.style.top = `${cursor.top}px`;
    chatEl.style.left = `${cursor.left}px`;
}

export const getCoords = (editor: any) => {
    const cursorFrom = editor.getCursor('head');

    let coords;
    if (editor.cursorCoords) coords = editor.cursorCoords(true, 'window');
    else if (editor.coordsAtPos) {
        const offset = editor.posToOffset(cursorFrom);
        coords = editor.cm.coordsAtPos?.(offset) ?? editor.coordsAtPos(offset);
    } else return;

    return coords;
};
