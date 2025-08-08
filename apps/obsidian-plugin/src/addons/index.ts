import { VisualEffectsAddon } from './VisualEffectsAddon';
import { PomodoroAddon } from './PomodoroAddon';
import { ContentProcessorAddon } from './ContentProcessorAddon';
import { ToolbarAddon } from './ToolbarAddon';
import { HotReloadAddon } from './HotReloadAddon';
import { EmojiAddon } from './EmojiAddon';
import type { AwesomeBrainAddon } from '@/types/addon';

/**
 * 附加组件注册中心
 * 负责管理可用的附加组件类型，不预创建实例
 */
export class AddonRegistry {
  private static addonClasses: (new () => AwesomeBrainAddon)[] = [
    VisualEffectsAddon,
    PomodoroAddon,
    ContentProcessorAddon,
    ToolbarAddon,
    HotReloadAddon,
    EmojiAddon
  ];

  /**
   * 注册新的附加组件类
   */
  static registerAddonClass(addonClass: new () => AwesomeBrainAddon) {
    if (!this.addonClasses.includes(addonClass)) {
      this.addonClasses.push(addonClass);
    }
  }

  /**
   * 获取所有可用的附加组件类
   */
  static getAddonClasses(): (new () => AwesomeBrainAddon)[] {
    return [...this.addonClasses];
  }

  /**
   * 创建所有附加组件实例
   */
  static createAllAddons(): AwesomeBrainAddon[] {
    return this.addonClasses.map(AddonClass => new AddonClass());
  }

  /**
   * 根据名称创建特定附加组件实例
   */
  static createAddon(name: string): AwesomeBrainAddon | undefined {
    const AddonClass = this.addonClasses.find(cls => {
      const instance = new cls();
      const result = instance.name === name;
      return result;
    });
    return AddonClass ? new AddonClass() : undefined;
  }

  /**
   * 获取附加组件的分类信息
   */
  static getAddonCategories(): Record<string, string[]> {
    const instances = this.createAllAddons();
    return {
      'visual': instances.filter(a => a.name.includes('visual') || a.name.includes('effect')).map(a => a.name),
      'productivity': instances.filter(a => a.name.includes('pomodoro') || a.name.includes('task')).map(a => a.name),
      'content': instances.filter(a => a.name.includes('content') || a.name.includes('markdown')).map(a => a.name),
      'integration': instances.filter(a => a.name.includes('api') || a.name.includes('weather')).map(a => a.name),
      'other': instances.filter(a =>
        !a.name.includes('visual') &&
        !a.name.includes('effect') &&
        !a.name.includes('pomodoro') &&
        !a.name.includes('task') &&
        !a.name.includes('content') &&
        !a.name.includes('markdown') &&
        !a.name.includes('api') &&
        !a.name.includes('weather')
      ).map(a => a.name)
    };
  }
}

// 导出所有附加组件类，方便外部使用
export {
  VisualEffectsAddon,
  PomodoroAddon,
  ContentProcessorAddon,
  ToolbarAddon,
  HotReloadAddon,
  EmojiAddon
};

// 导出默认配置
export const DEFAULT_ADDON_CONFIG = {
  'visual-effects': {
    enabled: true,
    config: {
      cursorEffect: 'none',
      powerMode: '0',
      shakeMode: false,
      clickString: ''
    }
  },
  'pomodoro': {
    enabled: true,
    config: {
      expectedTime: 25,
      systemNoticeEnable: true,
      ntfyServerHost: '',
      ntfyToken: '',
      noticeAudio: ''
    }
  }
}; 