import { App, type Command } from 'obsidian';

// TODO namespace?
export const eventTypes = {
    dbInited: 'db-inited',
    openBrowser: 'open-browser',
    calledFunction: 'called-function',
    previewCursor: 'preview-cursor',
};

export type GlobalChange = 'file-create' | 'file-remove' | 'file-rename';

export class AwesomeGlobalEvent extends Event {
    detail: {
        type: GlobalChange;
    };
}

export class Tag {
    color: string;
    bgColor: string;
    type: string;
    icon: string;
    font: string;
    constructor(colorVal: string, bgColorVal: string, typeVal: string, iconVal: string, fontVal: string) {
        this.type = typeVal;
        this.color = colorVal || `var(--tag-${typeVal}-color)`;
        this.bgColor = bgColorVal || `var(--tag-${typeVal}-bg)`;
        this.icon = iconVal || `var(--tag-${typeVal}-content)`;
        this.font = fontVal || 'var(--font-family-special-tag)';
    }
}

export type EditorState = {
    currentEle: Element;
    position: { top: number; bottom: number; left: number; right: number };
    selection: string;
};

export type SystemState = {
    language: string;
    theme: string;
    mouseCoords: {
        x: number;
        y: number;
    };
};
