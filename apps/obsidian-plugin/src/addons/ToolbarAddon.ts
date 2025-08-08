import { AwesomeBrainAddon, AddonContext, SettingDefinition, EventListenerDefinition } from '@/types/addon';
import { EditorUtil } from '@/utils/editor';
import { t } from 'i18next';

/**
 * 工具栏附加组件
 * 提供选择文本时的浮动工具栏功能
 */
export class ToolbarAddon implements AwesomeBrainAddon {
  name = 'toolbar';
  version = '1.0.0';
  description = '浮动工具栏，在选择文本时显示快捷操作按钮';
  enabled = true;

  private context: AddonContext | null = null;
  private selectionChangeHandler: ((e: Event) => void) | null = null;

  async onLoad(context: AddonContext) {
    this.context = context;
    console.log('Toolbar Addon loaded');

    // 设置工具栏事件监听
    this.setupToolbarEvents();
  }

  async onUnload() {
    // 清理事件监听器
    this.cleanupToolbarEvents();
    console.log('Toolbar Addon unloaded');
  }

  async onSettingsChange(settings: any) {
    // 响应设置变更
    if (this.getSetting('toolbar', false)) {
      this.setupToolbarEvents();
    } else {
      this.cleanupToolbarEvents();
    }
  }

  extendSettings(): SettingDefinition[] {
    return [
      {
        key: 'toolbar',
        name: t('setting.toolbar.name'),
        description: t('setting.toolbar.desc'),
        type: 'toggle',
        defaultValue: false,
        onChange: (value) => {
          this.setSetting('toolbar', value);
          if (value) {
            this.setupToolbarEvents();
          } else {
            this.cleanupToolbarEvents();
          }
        }
      }
    ];
  }

  extendEventListeners(): EventListenerDefinition[] {
    return [
      {
        event: 'selectionchange',
        listener: this.handleSelectionChange.bind(this)
      }
    ];
  }

  private setupToolbarEvents() {
    if (!this.getSetting('toolbar', false)) return;

    // 移除旧的事件监听器
    this.cleanupToolbarEvents();

    // 创建新的事件处理器
    this.selectionChangeHandler = (e: Event) => {
      if (!this.context) return;
      EditorUtil.changeToolbarPopover(e as MouseEvent, {
        value: this.getSetting('toolbar', false)
      } as any);
    };

    // 添加事件监听器
    activeDocument.addEventListener('selectionchange', this.selectionChangeHandler);
  }

  private cleanupToolbarEvents() {
    if (this.selectionChangeHandler) {
      activeDocument.removeEventListener('selectionchange', this.selectionChangeHandler);
      this.selectionChangeHandler = null;
    }
  }

  private handleSelectionChange(e: Event) {
    if (!this.context || !this.getSetting('toolbar', false)) return;

    EditorUtil.changeToolbarPopover(e as MouseEvent, {
      value: this.getSetting('toolbar', false)
    } as any);
  }

  private getSetting(key: string, defaultValue: any): any {
    if (!this.context?.settings) return defaultValue;

    const globalSettings = this.context.settings;
    return globalSettings[key] !== undefined ? globalSettings[key] : defaultValue;
  }

  private setSetting(key: string, value: any) {
    if (!this.context?.settings || !this.context?.plugin.pluginDataIO) return;

    this.context.settings[key] = value;
    this.context.plugin.pluginDataIO.save();
  }
} 