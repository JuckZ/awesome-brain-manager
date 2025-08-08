import type { AwesomeBrainAddon, AddonContext, SettingDefinition, CommandDefinition } from '@/types/addon';
import { toggleCursorEffects, toggleMouseClickEffects } from '@/render/CursorEffects';
import { toggleBlast, toggleShake } from '@/render/Blast';
import { t } from 'i18next';

/**
 * 视觉特效附加组件
 * 整合光标特效、打字特效、鼠标点击特效等功能
 */
export class VisualEffectsAddon implements AwesomeBrainAddon {
  name = 'visual-effects';
  version = '1.0.0';
  description = '提供各种视觉特效，包括光标特效、打字特效、鼠标点击特效等';
  enabled = true;

  private context: AddonContext | null = null;
  private clickEventHandler: ((e: MouseEvent) => void) | null = null;

  async onLoad(context: AddonContext) {
    this.context = context;
    console.log('Visual Effects Addon loaded');

    // 初始化特效
    this.initializeEffects();

    // 设置鼠标点击特效事件监听
    this.setupClickEffects();
  }

  async onUnload() {
    // 清理特效
    this.cleanupEffects();

    // 移除事件监听器
    if (this.clickEventHandler) {
      activeDocument.removeEventListener('click', this.clickEventHandler);
      this.clickEventHandler = null;
    }

    console.log('Visual Effects Addon unloaded');
  }

  async onSettingsChange(settings: any) {
    // 响应设置变更
    this.updateEffects(settings);
  }

  extendSettings(): SettingDefinition[] {
    return [
      {
        key: 'cursorEffect',
        name: t('setting.cursorEffect.name'),
        description: t('setting.cursorEffect.desc'),
        type: 'dropdown',
        defaultValue: 'none',
        options: [
          { label: t('info.effects.none'), value: 'none' },
          { label: t('info.effects.bubbleCursor'), value: 'bubbleCursor' },
          { label: t('info.effects.clockCursor'), value: 'clockCursor' },
          { label: t('info.effects.emojiCursor'), value: 'emojiCursor' },
          { label: t('info.effects.fairyDustCursor'), value: 'fairyDustCursor' },
          { label: t('info.effects.followingDotCursor'), value: 'followingDotCursor' },
          { label: t('info.effects.ghostCursor'), value: 'ghostCursor' },
          { label: t('info.effects.rainbowCursor'), value: 'rainbowCursor' },
          { label: t('info.effects.snowflakeCursor'), value: 'snowflakeCursor' },
          { label: t('info.effects.springyEmojiCursor'), value: 'springyEmojiCursor' },
          { label: t('info.effects.textFlag'), value: 'textFlag' },
          { label: t('info.effects.trailingCursor'), value: 'trailingCursor' }
        ],
        onChange: (value) => {
          this.setSetting('cursorEffect', value);
          toggleCursorEffects(value);
        }
      },
      {
        key: 'powerMode',
        name: t('setting.powerMode.name'),
        description: t('setting.powerMode.desc'),
        type: 'dropdown',
        defaultValue: '0',
        options: [
          { label: t('info.powerMode.0'), value: '0' },
          { label: t('info.powerMode.1'), value: '1' },
          { label: t('info.powerMode.2'), value: '2' },
          { label: t('info.powerMode.3'), value: '3' },
          { label: t('info.powerMode.4'), value: '4' }
        ],
        onChange: (value) => {
          this.setSetting('powerMode', value);
          toggleBlast(value);
        }
      },
      {
        key: 'shakeMode',
        name: t('setting.shakeMode.name'),
        description: t('setting.shakeMode.desc'),
        type: 'toggle',
        defaultValue: false,
        onChange: (value) => {
          this.setSetting('shakeMode', value);
          // 创建与原始设置兼容的对象
          const shakeEnabled = { value: value };
          toggleShake(shakeEnabled as any);
        }
      },
      {
        key: 'clickString',
        name: '鼠标点击特效文字',
        description: '点击时显示的文字，用逗号分隔',
        type: 'text',
        defaultValue: '',
        onChange: (value) => {
          this.setSetting('clickString', value);
          // 重新设置点击特效
          this.setupClickEffects();
        }
      }
    ];
  }

  extendCommands(): CommandDefinition[] {
    return [
      {
        id: 'toggle-cursor-effects',
        name: '切换光标特效',
        icon: 'wand',
        callback: () => {
          // 切换光标特效
          this.toggleCursorEffect();
        }
      },
      {
        id: 'toggle-power-mode',
        name: '切换打字特效',
        icon: 'zap',
        callback: () => {
          // 切换打字特效
          this.togglePowerMode();
        }
      },
      {
        id: 'reset-all-effects',
        name: '重置所有特效',
        icon: 'refresh-cw',
        callback: () => {
          this.resetAllEffects();
        }
      }
    ];
  }

  private initializeEffects() {
    if (!this.context) return;

    // 从设置中读取当前配置并应用
    // 初始化光标特效
    const cursorEffect = this.getSetting('cursorEffect', 'none');
    toggleCursorEffects(cursorEffect);

    // 初始化打字特效
    const powerMode = this.getSetting('powerMode', '0');
    toggleBlast(powerMode);

    // 初始化震动特效
    const shakeMode = this.getSetting('shakeMode', false);
    const shakeEnabled = { value: shakeMode };
    toggleShake(shakeEnabled as any);
  }

  private setupClickEffects() {
    // 移除旧的事件监听器
    if (this.clickEventHandler) {
      activeDocument.removeEventListener('click', this.clickEventHandler);
    }

    // 创建新的事件处理器
    this.clickEventHandler = (e: MouseEvent) => {
      const clickString = this.getSetting('clickString', '');
      if (clickString) {
        // 创建与原始函数兼容的对象
        const textObj = { value: clickString };
        toggleMouseClickEffects(e, textObj as any);
      }
    };

    // 添加新的事件监听器
    activeDocument.addEventListener('click', this.clickEventHandler);
  }

  private cleanupEffects() {
    // 清理所有特效
    toggleCursorEffects('none');
    toggleBlast('0');
    const shakeDisabled = { value: false };
    toggleShake(shakeDisabled as any);
  }

  private updateEffects(settings: any) {
    // 根据新设置更新特效
    this.initializeEffects();
    this.setupClickEffects();
  }

  private toggleCursorEffect() {
    const currentEffect = this.getSetting('cursorEffect', 'none');
    const effects = ['none', 'fairyDustCursor', 'ghostCursor', 'rainbowCursor'];
    const currentIndex = effects.indexOf(currentEffect);
    const nextIndex = (currentIndex + 1) % effects.length;
    const nextEffect = effects[nextIndex];

    this.setSetting('cursorEffect', nextEffect);
    toggleCursorEffects(nextEffect);
  }

  private togglePowerMode() {
    const currentMode = this.getSetting('powerMode', '0');
    const modes = ['0', '1', '2', '3', '4'];
    const currentIndex = modes.indexOf(currentMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    const nextMode = modes[nextIndex];

    this.setSetting('powerMode', nextMode);
    toggleBlast(nextMode);
  }

  private resetAllEffects() {
    this.setSetting('cursorEffect', 'none');
    this.setSetting('powerMode', '0');
    this.setSetting('shakeMode', false);
    this.setSetting('clickString', '');

    this.cleanupEffects();
  }

  private getSetting(key: string, defaultValue: any): any {
    if (!this.context?.settings) return defaultValue;

    // 从全局设置中获取值
    const globalSettings = this.context.settings;
    return globalSettings[key] !== undefined ? globalSettings[key] : defaultValue;
  }

  private setSetting(key: string, value: any) {
    if (!this.context?.settings || !this.context?.plugin.pluginDataIO) return;

    // 保存到全局设置
    this.context.settings[key] = value;

    // 保存数据
    this.context.plugin.pluginDataIO.save();
  }
} 