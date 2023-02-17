import { HoverPopover, ItemView, WorkspaceLeaf } from 'obsidian';
import { App as VueApp, createApp } from 'vue';
import type ObsidianManagerPlugin from 'main';
import Title from '../Title';
import t from '../../i18n';

export const CHAT_VIEW = 'chat-view';

export class ChartView extends ItemView {
    vueapp: VueApp;
    plugin: ObsidianManagerPlugin;
    hoverPopover: HoverPopover | null;

    constructor(leaf: WorkspaceLeaf, plugin: ObsidianManagerPlugin) {
        super(leaf);
        this.plugin = plugin;
    }

    getViewType() {
        return CHAT_VIEW;
    }

    getDisplayText(): string {
        return t.info.Chat;
    }

    getIcon(): string {
        return 'clock';
    }

    async onOpen(): Promise<void> {
        const container = this.containerEl.children[1];
        container.empty();
        container.createEl('div', {
            attr: {
                id: 'awesome-brain-manager-chat-view',
                style: 'color: yellow',
            },
        });
        this.vueapp = createApp(Title, { plugin: this.plugin });
        this.vueapp.mount('#awesome-brain-manager-chat-view');
    }

    async onClose() {
        this.vueapp.unmount();
    }
}
