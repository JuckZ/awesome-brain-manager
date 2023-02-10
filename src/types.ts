import { App, Command, TFile } from 'obsidian';
import type { ReadOnlyReference } from 'model/ref';

export class ExtApp extends App {
    internalPlugins: any;
    plugins: {
        getPluginFolder(): string;
        getPlugin(id: string): {
            settings: any;
        };
    };
    commands: {
        commands: { [id: string]: Command };
        editorCommands: { [id: string]: Command };
        findCommand(id: string): Command;
        executeCommandById(id: string): void;
        listCommands(): Command[];
    };
    customCss: {
        getSnippetPath(file: string): string;
        readSnippets(): void;
        setCssEnabledStatus(snippet: string, enabled: boolean): void;
    };
}

export interface PasteFunction {
    (this: HTMLElement, ev: ClipboardEvent): void;
}

export class ExtTFile extends TFile {
    override basename!: string;
}

export class OneDay {
    file!: TFile;
    oldContent = '';

    constructor(protected fileVal: TFile, protected oldContentVal: string) {
        this.file = fileVal;
        this.oldContent = oldContentVal;
    }
}

export class UndoHistoryInstance {
    previousDay!: OneDay;
    today!: OneDay;

    constructor(protected previousDayVal: OneDay, protected todayVal: OneDay) {
        this.previousDay = previousDayVal;
        this.today = todayVal;
    }
}

export class Tag {
    color = 'var(--white)';
    bgColor = 'var(--stag1-bg)';
    type: string;
    icon: {
        name: string;
    };
    font: {
        fontFamily: 'var(--font-family-special-tag)';
        size: 'calc(var(--font-size-tag) - 0.3em)';
    };
    constructor(colorVal: string, bgColorVal: string, typeVal: string, iconVal, fontVal) {
        this.color = colorVal;
        this.bgColor = bgColorVal;
        this.type = typeVal;
        this.icon = iconVal;
        this.font = fontVal;
    }
}

export class EditDetector {
    private lastModified?: Date;

    constructor(private editDetectionSec: ReadOnlyReference<number>) {}

    fileChanged() {
        this.lastModified = new Date();
    }

    isEditing(): boolean {
        if (this.editDetectionSec.value <= 0) {
            return false;
        }
        if (this.lastModified == null) {
            return false;
        }
        const elapsedSec = (new Date().getTime() - this.lastModified.getTime()) / 1000;
        return elapsedSec < this.editDetectionSec.value;
    }
}
