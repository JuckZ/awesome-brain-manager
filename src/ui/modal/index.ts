import { App, FuzzySuggestModal, Modal, Notice, SuggestModal, TAbstractFile } from 'obsidian';
import { Picker } from 'emoji-mart';
import data from '@emoji-mart/data';
import type { Pomodoro } from '../../schemas/spaces';
import t from '../../i18n';
import type AwesomeBrainManagerPlugin from 'main';

interface Book {
    title: string;
    author: string;
}

interface ImageOrigin {
    title: string;
    origin: string;
}

const ALL_IMAGE_ORIGIN = [
    { title: 'pixabay', origin: 'pixabay' },
    { title: 'pexels', origin: 'pexels' },
    { title: 'dummyimage', origin: 'dummyimage' },
    // { title: 'deepai', origin: 'deepai' },
    // { title: 'random', origin: 'random' },
    // { title: 'localmatch', origin: 'localmatch' },
    // { title: 'templater', origin: 'templater' },
    // { title: 'input', origin: 'input' },
];

const ALL_BOOKS = [
    {
        title: 'How to Take Smart Notes',
        author: 'Sönke Ahrens',
    },
    {
        title: 'Thinking, Fast and Slow',
        author: 'Daniel Kahneman',
    },
    {
        title: 'Deep Work',
        author: 'Cal Newport',
    },
];

export class ImageOriginModal extends FuzzySuggestModal<ImageOrigin> {
    selectedPath: TAbstractFile | null;
    plugin: AwesomeBrainManagerPlugin;

    constructor(app: App, plugin: AwesomeBrainManagerPlugin, path: TAbstractFile | null) {
        super(app);
        this.plugin = plugin;
        this.selectedPath = path;
    }

    getItems(): ImageOrigin[] {
        return ALL_IMAGE_ORIGIN;
    }

    getItemText(imageOrigin: ImageOrigin): string {
        return imageOrigin.title;
    }

    onChooseItem(imageOrigin: ImageOrigin, evt: MouseEvent | KeyboardEvent) {
        new Notice(`Selected ${imageOrigin.origin}`);
        this.plugin.setRandomBanner(this.selectedPath, imageOrigin.origin);
    }
}

export class BookSuggestModal extends SuggestModal<Book> {
    // Returns all available suggestions.
    getSuggestions(query: string): Book[] {
        return ALL_BOOKS.filter(book => book.title.toLowerCase().includes(query.toLowerCase()));
    }

    // Renders each suggestion item.
    renderSuggestion(book: Book, el: HTMLElement) {
        el.createEl('div', { text: book.title });
        el.createEl('small', { text: book.author });
    }

    // Perform action on the selected suggestion.
    onChooseSuggestion(book: Book, evt: MouseEvent | KeyboardEvent) {
        new Notice(`Selected ${book.title}`);
    }
}
export class PomodoroReminderModal extends Modal {
    pomodoro: Pomodoro;

    constructor(app: App, pomodoro: Pomodoro) {
        super(app);
        this.pomodoro = pomodoro;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.createEl('h2', { text: t.info.done });
        contentEl.createEl('div', {
            text: `✅ ${this.pomodoro.task}`,
        });
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}

export class EmojiPickerModal extends Modal {
    constructor(app: App) {
        super(app);
    }

    onSelect = (emoji: any) => {
        const editor = this.app.workspace.activeEditor?.editor;
        // BUG 光标问题
        editor?.replaceRange(emoji.native, editor.getCursor());
        this.close();
    };

    async onOpen() {
        const { contentEl } = this;
        const pickerOptions = { onEmojiSelect: this.onSelect, data, skin: 1, set: 'native', theme: 'light' };
        const picker: any = new Picker(pickerOptions);
        // for style
        this.modalEl.id = 'emoji-modal';
        contentEl.appendChild(picker);
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}
