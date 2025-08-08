import { AwesomeBrainAddon, AddonContext, SettingDefinition, ProcessorDefinition } from '@/types/addon';
import { MarkdownPreviewRenderer } from 'obsidian';
import { codeEmoji } from '@/render/Emoji';
import Process from '@/process/Process';
import { t } from 'i18next';

/**
 * 内容处理器附加组件
 * 整合PlantUML、Vue/React组件、Twemoji等内容处理功能
 */
export class ContentProcessorAddon implements AwesomeBrainAddon {
  name = 'content-processor';
  version = '1.0.0';
  description = '内容处理器，支持PlantUML图表、Vue/React组件渲染、Twemoji表情等';
  enabled = true;

  private context: AddonContext | null = null;
  private process: Process | null = null;

  async onLoad(context: AddonContext) {
    this.context = context;
    this.process = new Process(context.plugin);
    console.log('Content Processor Addon loaded');

    // 特殊处理Twemoji，因为它使用MarkdownPreviewRenderer
    this.registerTwemoji();
  }

  async onUnload() {
    // 清理处理器（Obsidian会自动清理已注册的处理器）
    console.log('Content Processor Addon unloaded');
  }

  async onSettingsChange(settings: any) {
    // 响应设置变更
    // 注意：处理器重新注册需要重启插件才能生效
    console.log('Content Processor settings changed:', settings);
  }

  private registerTwemoji() {
    if (this.getSetting('enableTwemoji', false) && this.process?.EmojiProcess) {
      MarkdownPreviewRenderer.registerPostProcessor(this.process.EmojiProcess);
    }
  }

  extendSettings(): SettingDefinition[] {
    return [
      {
        key: 'enableTwemoji',
        name: t('setting.enableTwemoji.name'),
        description: t('setting.enableTwemoji.desc'),
        type: 'toggle',
        defaultValue: false,
        onChange: (value) => {
          this.setSetting('enableTwemoji', value);
          this.registerTwemoji();
        }
      },
      {
        key: 'enablePlantUML',
        name: 'PlantUML图表',
        description: '启用PlantUML图表渲染',
        type: 'toggle',
        defaultValue: true,
        onChange: (value) => {
          this.setSetting('enablePlantUML', value);
        }
      },
      {
        key: 'enableVueWidget',
        name: 'Vue组件',
        description: '启用Vue组件渲染',
        type: 'toggle',
        defaultValue: true,
        onChange: (value) => {
          this.setSetting('enableVueWidget', value);
        }
      },
      {
        key: 'enableReactWidget',
        name: 'React组件',
        description: '启用React组件渲染',
        type: 'toggle',
        defaultValue: true,
        onChange: (value) => {
          this.setSetting('enableReactWidget', value);
        }
      }
    ];
  }

  extendProcessors(): ProcessorDefinition[] {
    const processors: ProcessorDefinition[] = [];

    // 代码Emoji处理器
    processors.push({
      type: 'markdown-post',
      processor: codeEmoji
    });

    // PlantUML处理器
    if (this.getSetting('enablePlantUML', true) && this.process?.UMLProcess) {
      processors.push({
        type: 'markdown-code-block',
        language: 'plantuml',
        processor: this.process.UMLProcess
      });
    }

    // Vue组件处理器
    if (this.getSetting('enableVueWidget', true) && this.process?.VueProcess) {
      processors.push({
        type: 'markdown-code-block',
        language: 'vue-widget',
        processor: this.process.VueProcess
      });
    }

    // React组件处理器
    if (this.getSetting('enableReactWidget', true) && this.process?.ReactProcess) {
      processors.push({
        type: 'markdown-code-block',
        language: 'react-widget',
        processor: this.process.ReactProcess
      });
    }

    return processors;
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