import { App, FuzzySuggestModal, Modal, Notice, Setting, SuggestModal, TAbstractFile } from 'obsidian';
import { App as VueApp, createApp } from 'vue';
import ChatView from '../ChatView.vue';
import t from '../../i18n';

export class ChatModal extends Modal {
    vueapp: VueApp;
    constructor(app: App) {
        super(app);
    }

    onOpen() {
        const { contentEl } = this;

        contentEl.createEl('div', {
            attr: {
                id: 'awesome-brain-manager-chat-modal',
                style: 'color: green',
            },
        });

        this.vueapp = createApp(ChatView, {});
        this.vueapp.mount('#awesome-brain-manager-chat-modal');
    }

    async onClose() {
        this.vueapp.unmount();
        const { contentEl } = this;
        contentEl.empty();
    }
}
