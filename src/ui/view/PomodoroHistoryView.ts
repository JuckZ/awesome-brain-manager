import { HoverPopover, ItemView, WorkspaceLeaf } from 'obsidian';
import { createApp } from 'vue';
import type { App as VueApp } from 'vue';
import type AwesomeBrainManagerPlugin from 'main';
import PomodoroHistory from '../PomodoroHistory.vue';
import t from '../../i18n';

export const POMODORO_HISTORY_VIEW = 'pomodoro-history-view';

export class PomodoroHistoryView extends ItemView {
    vueapp: VueApp;
    plugin: AwesomeBrainManagerPlugin;
    hoverPopover: HoverPopover | null;

    constructor(leaf: WorkspaceLeaf, plugin: AwesomeBrainManagerPlugin) {
        super(leaf);
        this.plugin = plugin;
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
                });
            },
        );
    }

    async onClose() {
        // Nothing to clean up.
        this.vueapp.unmount();
    }
}
