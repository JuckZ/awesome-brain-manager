import { App, TFile } from 'obsidian';
import type { Command } from 'obsidian';
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
        this.font = fontVal || `var(--font-family-special-tag)`;
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
