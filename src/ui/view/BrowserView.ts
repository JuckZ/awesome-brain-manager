import { HoverPopover, ItemView, WorkspaceLeaf } from 'obsidian';
import { createApp } from 'vue';
import type { Ref, App as VueApp } from 'vue';
import BrowserViewComp from '@/ui/BrowserView.vue';
import t from '@/i18n';
import type AwesomeBrainManagerPlugin from 'main';

export const BROWSER_VIEW = 'browser-view';

export class BrowserView extends ItemView {
    vueapp: VueApp;
    plugin: AwesomeBrainManagerPlugin;
    url: Ref<string>;
    hoverPopover: HoverPopover | null;

    constructor(leaf: WorkspaceLeaf, plugin: AwesomeBrainManagerPlugin, url: Ref<string>) {
        super(leaf);
        this.plugin = plugin;
        this.url = url;
    }

    getViewType() {
        return BROWSER_VIEW;
    }

    getDisplayText(): string {
        return t.info.Browser;
    }

    getIcon(): string {
        return 'clock';
    }

    async onOpen(): Promise<void> {
        const container = this.containerEl.children[1];
        container.empty();
        container.createEl('div', {
            attr: {
                id: 'awesome-brain-manager-browser-view',
                style: 'height: 100%; width: 100%',
            },
        });
        this.vueapp = createApp(BrowserViewComp, { plugin: this.plugin, url: this.url });
        this.vueapp.mount('#awesome-brain-manager-browser-view');
    }

    async onClose() {
        this.vueapp.unmount();
    }
}
