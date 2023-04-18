import { HoverPopover, ItemView, WorkspaceLeaf } from 'obsidian';
import { createApp } from 'vue';
import type { App as VueApp } from 'vue';
import PomodoroHistory from '../PomodoroHistory.vue';
import t from '../../i18n';
import type AwesomeBrainManagerPlugin from 'main';

export const POMODORO_HISTORY_VIEW = 'pomodoro-history-view';

export class PomodoroHistoryView extends ItemView {
    vueapp: VueApp;
    plugin: AwesomeBrainManagerPlugin;
    hoverPopover: HoverPopover | null;
    mounted: boolean;

    constructor(leaf: WorkspaceLeaf, plugin: AwesomeBrainManagerPlugin) {
        super(leaf);
        this.plugin = plugin;
        this.mounted = false;
    }

    getViewType() {
        return POMODORO_HISTORY_VIEW;
    }

    getDisplayText(): string {
        // TODO: Make this interactive: Either the active workspace or the local graph
        return t.info.Pomodoro;
    }

    getIcon(): string {
        return 'alarm-clock';
    }

    async onOpen(): Promise<void> {
        const container = this.containerEl.children[1];
        container.empty();
        container.createEl(
            'div',
            {
                cls: 'my-plugin-view',
                attr: {
                    id: 'awesome-brain-manager-pomodoro-history-view',
                },
            },
            el => {
                el.onNodeInserted(() => {
                    this.vueapp = createApp(PomodoroHistory);
                    this.vueapp.mount(el);
                    this.mounted = true;
                });
            },
        );
    }

    async onClose() {
        if (this.mounted) {
            this.vueapp.unmount();
        }
    }
}
