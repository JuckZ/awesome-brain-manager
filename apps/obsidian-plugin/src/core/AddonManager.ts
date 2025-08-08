import type { App } from 'obsidian';
import type AwesomeBrainManagerPlugin from '@/main';
import type { AwesomeBrainAddon, AddonContext, SettingDefinition, CommandDefinition, ViewDefinition, ProcessorDefinition, EventListenerDefinition } from '@/types/addon';
import { SETTINGS } from '@/settings';

export class AddonManager {
  private addons: Map<string, AwesomeBrainAddon> = new Map();
  private enabledAddons: Set<string> = new Set();
  private context: AddonContext;

  constructor(
    private app: App,
    private plugin: AwesomeBrainManagerPlugin
  ) {
    this.context = {
      app: this.app,
      plugin: this.plugin,
      settings: this.createSettingsProxy(),
      utils: {
        file: {
          getCleanTitle: this.plugin.utils.getCleanTitle,
          getLocalRandom: this.plugin.utils.getLocalRandom
        },
        editor: {},
        notification: {},
        database: {},
        weather: {
          weatherDesc: this.plugin.utils.weatherDesc
        }
      }
    };
  }

  /**
   * 创建设置代理对象，将SettingModel转换为简单的键值对
   */
  private createSettingsProxy(): Record<string, any> {
    return {
      // 视觉特效设置
      get cursorEffect() { return SETTINGS.cursorEffect.value; },
      set cursorEffect(value: string) { SETTINGS.cursorEffect.rawValue.value = value; },

      get powerMode() { return SETTINGS.powerMode.value; },
      set powerMode(value: string) { SETTINGS.powerMode.rawValue.value = value; },

      get shakeMode() { return SETTINGS.shakeMode.value; },
      set shakeMode(value: boolean) { SETTINGS.shakeMode.rawValue.value = value; },

      get clickString() { return SETTINGS.clickString.value; },
      set clickString(value: string) { SETTINGS.clickString.rawValue.value = value; },

      // 工具栏设置
      get toolbar() { return SETTINGS.toolbar.value; },
      set toolbar(value: boolean) { SETTINGS.toolbar.rawValue.value = value; },

      // 内容处理器设置
      get enableTwemoji() { return SETTINGS.enableTwemoji.value; },
      set enableTwemoji(value: boolean) { SETTINGS.enableTwemoji.rawValue.value = value; },

      // 新增设置项（使用默认值）
      get enablePlantUML() { return true; },
      set enablePlantUML(value: boolean) { /* 可以扩展SETTINGS */ },

      get enableVueWidget() { return true; },
      set enableVueWidget(value: boolean) { /* 可以扩展SETTINGS */ },

      get enableReactWidget() { return true; },
      set enableReactWidget(value: boolean) { /* 可以扩展SETTINGS */ },

      get enableHotReload() { return false; },
      set enableHotReload(value: boolean) { /* 可以扩展SETTINGS */ },

      get hotReloadPlugins() { return 'awesome-brain-manager'; },
      set hotReloadPlugins(value: string) { /* 可以扩展SETTINGS */ }
    };
  }

  /**
   * 注册附加组件实例
   */
  register(addon: AwesomeBrainAddon) {
    if (this.addons.has(addon.name)) {
      console.warn(`Addon ${addon.name} already registered`);
      return;
    }

    this.addons.set(addon.name, addon);
    console.log(`Addon ${addon.name} registered`);
  }

  /**
   * 启用附加组件
   */
  async enable(name: string) {
    const addon = this.addons.get(name);
    if (!addon) {
      throw new Error(`Addon ${name} not found`);
    }

    if (this.enabledAddons.has(name)) {
      return; // 已启用
    }

    try {
      // 调用addon的onLoad方法
      await addon.onLoad?.(this.context);
      this.enabledAddons.add(name);

      // 扩展设置
      if (addon.extendSettings) {
        this.registerSettings(addon.extendSettings());
      }

      // 扩展命令
      if (addon.extendCommands) {
        this.registerCommands(addon.extendCommands());
      }

      // 扩展视图
      if (addon.extendViews) {
        this.registerViews(addon.extendViews());
      }

      // 扩展处理器
      if (addon.extendProcessors) {
        this.registerProcessors(addon.extendProcessors());
      }

      // 扩展事件监听器
      if (addon.extendEventListeners) {
        this.registerEventListeners(addon.extendEventListeners());
      }

      console.log(`Addon ${name} enabled`);
    } catch (error) {
      console.error(`Failed to enable Addon ${name}:`, error);
      throw error;
    }
  }

  /**
   * 禁用附加组件
   */
  async disable(name: string) {
    const addon = this.addons.get(name);
    if (!addon || !this.enabledAddons.has(name)) {
      return;
    }

    try {
      await addon.onUnload?.();
      this.enabledAddons.delete(name);
      console.log(`Addon ${name} disabled`);
    } catch (error) {
      console.error(`Failed to disable Addon ${name}:`, error);
      throw error;
    }
  }

  /**
   * 切换附加组件状态
   */
  async toggle(name: string) {
    if (this.enabledAddons.has(name)) {
      await this.disable(name);
    } else {
      await this.enable(name);
    }
  }

  /**
   * 获取所有已注册的附加组件
   */
  getRegisteredAddons(): AwesomeBrainAddon[] {
    return Array.from(this.addons.values());
  }

  /**
   * 获取已启用的附加组件
   */
  getEnabledAddons(): AwesomeBrainAddon[] {
    return Array.from(this.enabledAddons)
      .map(name => this.addons.get(name))
      .filter(Boolean) as AwesomeBrainAddon[];
  }

  /**
   * 检查附加组件是否启用
   */
  isEnabled(name: string): boolean {
    return this.enabledAddons.has(name);
  }

  /**
   * 初始化所有已注册的附加组件
   * 根据addon的enabled属性决定是否启用
   */
  async initializeAll() {
    const promises = Array.from(this.addons.entries())
      .filter(([name, addon]) => addon.enabled !== false)
      .map(([name, addon]) => this.enable(name));

    await Promise.allSettled(promises);
  }

  /**
   * 卸载所有附加组件
   */
  async unloadAll() {
    const promises = Array.from(this.enabledAddons)
      .map(name => this.disable(name));

    await Promise.allSettled(promises);
  }

  /**
   * 通知设置变更
   */
  async notifySettingsChange(settings: any) {
    const promises = this.getEnabledAddons()
      .filter(addon => addon.onSettingsChange)
      .map(addon => addon.onSettingsChange!(settings));

    await Promise.allSettled(promises);
  }

  /**
   * 注册设置到主插件
   */
  private registerSettings(settings: SettingDefinition[]) {
    // TODO: 集成到主插件的设置系统
    // 可以通过插件的设置API来动态添加设置项
    console.log('Registering settings:', settings);
  }

  /**
   * 注册命令到主插件
   */
  private registerCommands(commands: CommandDefinition[]) {
    commands.forEach(command => {
      this.plugin.addCommand({
        id: command.id,
        name: command.name,
        icon: command.icon,
        callback: command.callback,
        editorCallback: command.editorCallback,
        checkCallback: command.checkCallback,
        hotkeys: command.hotkeys as any
      });
    });
    console.log(`Registered ${commands.length} commands`);
  }

  /**
   * 注册视图到主插件
   */
  private registerViews(views: ViewDefinition[]) {
    views.forEach(view => {
      this.plugin.registerView(view.type, view.viewCreator);
    });
    console.log(`Registered ${views.length} views`);
  }

  /**
   * 注册处理器到主插件
   */
  private registerProcessors(processors: ProcessorDefinition[]) {
    processors.forEach(processor => {
      if (processor.type === 'markdown-post') {
        this.plugin.registerMarkdownPostProcessor(processor.processor);
      } else if (processor.type === 'markdown-code-block' && processor.language) {
        this.plugin.registerMarkdownCodeBlockProcessor(processor.language, processor.processor);
      }
    });
    console.log(`Registered ${processors.length} processors`);
  }

  /**
   * 注册事件监听器到主插件
   */
  private registerEventListeners(listeners: EventListenerDefinition[]) {
    listeners.forEach(listener => {
      // 这里可以根据需要实现事件监听器注册
      // 目前大部分事件监听器由各个addon自己管理
    });
    console.log(`Registered ${listeners.length} event listeners`);
  }
} 