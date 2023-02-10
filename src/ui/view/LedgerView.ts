import { HoverPopover, ItemView, WorkspaceLeaf } from 'obsidian';
import { App as VueApp, createApp } from 'vue';
import { selectDB } from 'utils/db/db';
import type { Ledger } from 'schemas/spaces';
import type ObsidianManagerPlugin from 'main';
import { eventTypes } from 'types/types';
import type { DBRows } from 'types/mdb';
import PomodoroHistory from '../PomodoroHistory.vue';

export const Ledger_HISTORY_VIEW = 'Ledger-history-view';

export class LedgerHistoryView extends ItemView {
    vueapp: VueApp;
    plugin: ObsidianManagerPlugin;
    hoverPopover: HoverPopover | null;

    constructor(leaf: WorkspaceLeaf, plugin: ObsidianManagerPlugin) {
        super(leaf);
        this.plugin = plugin;
    }

    getViewType() {
        return Ledger_HISTORY_VIEW;
    }

    getDisplayText(): string {
        // TODO: Make this interactive: Either the active workspace or the local graph
        return 'Ledger History View';
    }

    getIcon(): string {
        return 'clock';
    }

    async onOpen(): Promise<void> {
        const container = this.containerEl.children[1];
        container.empty();
        container.createEl('div', {
            cls: 'my-plugin-view',
            attr: {
                id: 'awesome-brain-manager-Ledger-history-view',
            },
        });
        this.vueapp = createApp(PomodoroHistory, { age: 'juck', getData: this.getData.bind(this) });
        this.vueapp.mount('#awesome-brain-manager-Ledger-history-view');
    }

    async getData(): Promise<DBRows> {
        return (await selectDB(this.plugin.spaceDB, 'Ledger')?.rows) || [];
    }

    async setContent() {
        const container = this.containerEl.children[1];
        container.empty();
    }

    async onClose() {
        // Nothing to clean up.
        this.vueapp.unmount();
    }
}
