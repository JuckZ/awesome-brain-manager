import type { App, Command, WorkspaceLeaf } from 'obsidian';
import type AwesomeBrainManagerPlugin from '@/main';

/**
 * 插件附加组件接口定义
 */
export interface AwesomeBrainAddon {
  /** 附加组件名称 */
  name: string;

  /** 附加组件版本 */
  version?: string;

  /** 附加组件描述 */
  description?: string;

  /** 是否默认启用 */
  enabled?: boolean;

  /** 依赖的其他附加组件 */
  dependencies?: string[];

  /** 生命周期钩子 - 附加组件加载时调用 */
  onLoad?: (context: AddonContext) => Promise<void> | void;

  /** 生命周期钩子 - 附加组件卸载时调用 */
  onUnload?: () => Promise<void> | void;

  /** 设置变更时调用 */
  onSettingsChange?: (settings: any) => Promise<void> | void;

  /** 扩展设置项 */
  extendSettings?: () => SettingDefinition[];

  /** 扩展命令 */
  extendCommands?: () => CommandDefinition[];

  /** 扩展视图 */
  extendViews?: () => ViewDefinition[];

  /** 扩展处理器 */
  extendProcessors?: () => ProcessorDefinition[];

  /** 扩展事件监听器 */
  extendEventListeners?: () => EventListenerDefinition[];

  /** 附加组件配置 */
  config?: AddonConfig;
}

/**
 * 附加组件上下文
 */
export interface AddonContext {
  /** Obsidian App 实例 */
  app: App;

  /** 主插件实例 */
  plugin: AwesomeBrainManagerPlugin;

  /** 设置对象 */
  settings: any;

  /** 工具集合 */
  utils: UtilityCollection;
}

/**
 * 设置定义
 */
export interface SettingDefinition {
  /** 设置键 */
  key: string;

  /** 设置名称 */
  name: string;

  /** 设置描述 */
  description?: string;

  /** 设置类型 */
  type: 'toggle' | 'text' | 'number' | 'dropdown' | 'slider';

  /** 默认值 */
  defaultValue: any;

  /** 选项（用于dropdown） */
  options?: { label: string; value: any }[];

  /** 最小值（用于number/slider） */
  min?: number;

  /** 最大值（用于number/slider） */
  max?: number;

  /** 步长（用于slider） */
  step?: number;

  /** 变更回调 */
  onChange?: (value: any) => void;
}

/**
 * 命令定义
 */
export interface CommandDefinition {
  /** 命令ID */
  id: string;

  /** 命令名称 */
  name: string;

  /** 命令图标 */
  icon?: string;

  /** 热键 */
  hotkeys?: { modifiers: string[]; key: string }[];

  /** 命令回调 */
  callback?: () => void;

  /** 编辑器命令回调 */
  editorCallback?: (editor: any, view: any) => void;

  /** 检查回调 */
  checkCallback?: (checking: boolean) => boolean;
}

/**
 * 视图定义
 */
export interface ViewDefinition {
  /** 视图类型 */
  type: string;

  /** 视图名称 */
  name: string;

  /** 视图图标 */
  icon?: string;

  /** 视图构造函数 */
  viewCreator: (leaf: WorkspaceLeaf) => any;
}

/**
 * 处理器定义
 */
export interface ProcessorDefinition {
  /** 处理器类型 */
  type: 'markdown-post' | 'markdown-code-block';

  /** 代码块语言（用于代码块处理器） */
  language?: string;

  /** 处理器函数 */
  processor: any;
}

/**
 * 事件监听器定义
 */
export interface EventListenerDefinition {
  /** 事件名称 */
  event: string;

  /** 监听器函数 */
  listener: (...args: any[]) => void;

  /** 是否只监听一次 */
  once?: boolean;
}

/**
 * 附加组件配置
 */
export interface AddonConfig {
  /** 配置版本 */
  version?: string;

  /** 自定义配置项 */
  [key: string]: any;
}

/**
 * 工具集合接口
 */
export interface UtilityCollection {
  /** 文件工具 */
  file: any;

  /** 编辑器工具 */
  editor: any;

  /** 通知工具 */
  notification: any;

  /** 数据库工具 */
  database: any;

  /** 其他工具 */
  [key: string]: any;
}

/**
 * 附加组件配置状态
 */
export interface AddonState {
  /** 附加组件名称 */
  name: string;

  /** 是否启用 */
  enabled: boolean;

  /** 配置数据 */
  config: Record<string, any>;

  /** 最后更新时间 */
  lastUpdated: number;
} 