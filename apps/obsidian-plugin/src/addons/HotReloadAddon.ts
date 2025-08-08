import { AwesomeBrainAddon, AddonContext, SettingDefinition } from '@/types/addon';
import { Notice } from 'obsidian';

/**
 * 热重载附加组件
 * 监控插件文件变化并自动重载
 */
export class HotReloadAddon implements AwesomeBrainAddon {
  name = 'hot-reload';
  version = '1.0.0';
  description = '开发者工具：监控插件文件变化并自动重载';
  enabled = true;

  private context: AddonContext | null = null;

  async onLoad(context: AddonContext) {
    this.context = context;
    console.log('Hot Reload Addon loaded');

    // 初始化热重载功能
    this.initializeHotReload();
  }

  async onUnload() {
    console.log('Hot Reload Addon unloaded');
  }

  async onSettingsChange(settings: any) {
    // 响应设置变更
  }

  extendSettings(): SettingDefinition[] {
    return [
      {
        key: 'enableHotReload',
        name: '启用热重载',
        description: '开发模式下自动重载插件（仅在开发环境下启用）',
        type: 'toggle',
        defaultValue: false,
        onChange: (value) => {
          this.setSetting('enableHotReload', value);
        }
      },
      {
        key: 'hotReloadPlugins',
        name: '热重载插件列表',
        description: '需要热重载的插件名称，用逗号分隔',
        type: 'text',
        defaultValue: 'awesome-brain-manager',
        onChange: (value) => {
          this.setSetting('hotReloadPlugins', value);
        }
      }
    ];
  }

  private initializeHotReload() {
    if (!this.context) return;

    // 注册文件变化监听器
    this.context.plugin.vaultRawFunction = this.handleFileChange.bind(this);
  }

  private async handleFileChange(path: string) {
    if (!this.getSetting('enableHotReload', false)) return;

    const paths = path.split('/');
    const reloadPluginList = this.getSetting('hotReloadPlugins', 'awesome-brain-manager')
      .split(',')
      .map((name: string) => name.trim());

    if (path.startsWith(this.context!.app.plugins.getPluginFolder()) && paths.length >= 4) {
      const plugin = paths[2];
      const file = paths[paths.length - 1];

      // 跳过数据库文件
      if (file.endsWith('.mdb')) return;

      if (reloadPluginList.includes(plugin)) {
        await this.reloadPlugin(plugin);
      }
    }
  }

  private async reloadPlugin(pluginName: string) {
    if (!this.context) return;

    const plugins = this.context.app.plugins;

    // 不重载已禁用的插件
    if (!plugins.enabledPlugins.has(pluginName)) return;

    try {
      await plugins.disablePlugin(pluginName);

      setTimeout(async () => {
        try {
          await plugins.enablePlugin(pluginName);
          new Notice(`Plugin "${pluginName}" has been reloaded`);
        } catch (error) {
          new Notice(`Failed to reload "${pluginName}"`);
          console.error(error);
        }
      }, 100);
    } catch (error) {
      new Notice(`Failed to disable "${pluginName}" for reload`);
      console.error(error);
    }
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