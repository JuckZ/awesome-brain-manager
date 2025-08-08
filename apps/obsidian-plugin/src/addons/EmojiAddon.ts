import { AwesomeBrainAddon, AddonContext, CommandDefinition, EventListenerDefinition } from '@/types/addon';
import { EmojiPickerModal } from '@/ui/modal';
import { t } from 'i18next';
import { Editor, MarkdownFileInfo, MarkdownView, Menu } from 'obsidian';

/**
 * Emoji附加组件
 * 提供Emoji选择器和相关功能
 */
export class EmojiAddon implements AwesomeBrainAddon {
  name = 'emoji';
  version = '1.0.0';
  description = 'Emoji选择器和表情符号功能';
  enabled = true;

  private context: AddonContext | null = null;
  private emojiPickerModal: EmojiPickerModal | null = null;

  async onLoad(context: AddonContext) {
    this.context = context;
    console.log('Emoji Addon loaded');

    // 初始化Emoji选择器
    this.emojiPickerModal = new EmojiPickerModal(context.app);
  }

  async onUnload() {
    // 清理资源
    this.emojiPickerModal = null;
    console.log('Emoji Addon unloaded');
  }

  async onSettingsChange(settings: any) {
    // 响应设置变更
  }

  extendCommands(): CommandDefinition[] {
    return [
      {
        id: 'open-emoji-picker',
        name: t('command.open-emoji-picker'),
        icon: 'smile',
        checkCallback: (checking: boolean) => {
          const activeFile = this.context?.app.workspace.getActiveFile();
          if (activeFile) {
            if (!checking) {
              this.openEmojiPicker();
            }
            return true;
          }
          return false;
        }
      }
    ];
  }

  extendEventListeners(): EventListenerDefinition[] {
    return [
      {
        event: 'editor-menu',
        listener: (menu: Menu, editor: Editor, info: MarkdownView | MarkdownFileInfo) => {
          this.addEmojiMenuOption(menu, editor);
        }
      }
    ];
  }

  private addEmojiMenuOption(menu: Menu, editor: Editor) {
    menu.addItem(item => {
      item.setTitle(t('menu.openEmojiPicker'))
        .setIcon('smile')
        .onClick(() => {
          this.openEmojiPicker();
        });
    });
  }

  private openEmojiPicker() {
    if (!this.emojiPickerModal) {
      this.emojiPickerModal = new EmojiPickerModal(this.context!.app);
    }
    this.emojiPickerModal.open();
  }
} 