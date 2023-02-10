import type ObsidianManagerPlugin from 'main';
import { App, FuzzySuggestModal, Modal, Notice, Setting, SuggestModal, TAbstractFile } from 'obsidian';
import type { Pomodoro } from 'schemas/spaces';

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
    plugin: ObsidianManagerPlugin;

    constructor(app: App, plugin: ObsidianManagerPlugin, path: TAbstractFile | null) {
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

        contentEl.createEl('h2', { text: '完成：' + this.pomodoro.task });
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}
