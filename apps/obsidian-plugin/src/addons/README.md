# Awesome Brain Manager 附加组件系统

## 📖 概述

参考 VitePress 的插件架构设计，Awesome Brain Manager 采用了模块化的附加组件系统。每个功能模块都可以作为独立的附加组件运行，支持选择性启用/禁用和个性化配置。

## 🏗️ 架构设计

### 核心组件

1. **AddonManager** - 附加组件管理器，负责组件的生命周期管理
2. **AwesomeBrainAddon** - 附加组件接口定义
3. **AddonRegistry** - 附加组件注册中心
4. **AddonContext** - 附加组件上下文，提供访问主插件功能的接口

### 设计原则

- **单一职责**: 每个附加组件专注于一个特定功能领域
- **松耦合**: 附加组件之间相互独立，可以单独启用/禁用
- **可扩展**: 易于添加新的附加组件
- **配置化**: 每个附加组件都有独立的配置选项

## 📦 已有附加组件

### 1. 视觉特效附加组件 (VisualEffectsAddon)

**功能**: 提供各种视觉特效
- 光标特效 (12种不同效果)
- 打字特效 (爆炸、粒子等)
- 鼠标点击特效
- 震动效果

**配置选项**:
```typescript
{
  cursorEffect: 'none' | 'bubbleCursor' | 'fairyDustCursor' | ...,
  powerMode: '0' | '1' | '2' | '3' | '4',
  shakeMode: boolean,
  clickString: string
}
```

### 2. 番茄钟附加组件 (PomodoroAddon)

**功能**: 时间管理工具
- 番茄钟计时器
- 任务管理
- 历史记录
- 提醒通知

**配置选项**:
```typescript
{
  expectedTime: number,
  systemNoticeEnable: boolean,
  ntfyServerHost: string,
  ntfyToken: string,
  noticeAudio: string
}
```

## 🔧 开发新的附加组件

### 1. 创建附加组件类

```typescript
import type { AwesomeBrainAddon, AddonContext } from '@/types/addon';

export class MyCustomAddon implements AwesomeBrainAddon {
    name = 'my-custom-addon';
    version = '1.0.0';
    description = '我的自定义附加组件';
    enabled = true;

    async onLoad(context: AddonContext) {
        // 附加组件加载逻辑
        console.log('My Custom Addon loaded');
    }

    async onUnload() {
        // 附加组件卸载逻辑
        console.log('My Custom Addon unloaded');
    }

    extendSettings() {
        return [
            {
                key: 'myOption',
                name: '我的选项',
                type: 'toggle',
                defaultValue: true
            }
        ];
    }

    extendCommands() {
        return [
            {
                id: 'my-command',
                name: '我的命令',
                callback: () => {
                    // 命令逻辑
                }
            }
        ];
    }
}
```

### 2. 注册附加组件

```typescript
// 在 addons/index.ts 中注册
import { MyCustomAddon } from './MyCustomAddon';

AddonRegistry.register(new MyCustomAddon());
```

### 3. 生命周期钩子

- **onLoad(context)**: 附加组件加载时调用
- **onUnload()**: 附加组件卸载时调用
- **onSettingsChange(settings)**: 设置变更时调用

### 4. 扩展点

- **extendSettings()**: 扩展设置选项
- **extendCommands()**: 扩展命令
- **extendViews()**: 扩展视图
- **extendProcessors()**: 扩展处理器
- **extendEventListeners()**: 扩展事件监听器

## 🚀 使用方法

### 在主插件中集成

```typescript
import { AddonManager } from '@/core/AddonManager';
import { AddonRegistry } from '@/addons';

export default class AwesomeBrainManagerPlugin extends Plugin {
    private addonManager: AddonManager;

    async onload() {
        // 初始化附加组件管理器
        this.addonManager = new AddonManager(this.app, this);
        
        // 注册所有附加组件
        AddonRegistry.getAllAddons().forEach(addon => {
            this.addonManager.register(addon);
        });
        
        // 初始化已启用的附加组件
        await this.addonManager.initializeAll();
    }

    async onunload() {
        // 卸载所有附加组件
        await this.addonManager.unloadAll();
    }
}
```

### 动态启用/禁用附加组件

```typescript
// 启用附加组件
await this.addonManager.enable('visual-effects');

// 禁用附加组件
await this.addonManager.disable('visual-effects');

// 切换附加组件状态
await this.addonManager.toggle('visual-effects');

// 检查附加组件状态
const isEnabled = this.addonManager.isEnabled('visual-effects');
```

## ⚙️ 配置管理

### 附加组件配置结构

```typescript
interface AddonConfig {
    enabled: boolean;
    config: Record<string, any>;
    lastUpdated: number;
}
```

### 配置文件示例

```json
{
  "addons": {
    "visual-effects": {
      "enabled": true,
      "config": {
        "cursorEffect": "fairyDustCursor",
        "powerMode": "2"
      },
      "lastUpdated": 1703123456789
    },
    "pomodoro": {
      "enabled": false,
      "config": {
        "expectedTime": 30
      },
      "lastUpdated": 1703123456789
    }
  }
}
```

## 🎯 最佳实践

### 1. 命名规范
- 附加组件名称使用 kebab-case
- 类名使用 PascalCase + Addon 后缀
- 配置键使用 camelCase

### 2. 错误处理
- 在生命周期钩子中使用 try-catch
- 提供有意义的错误信息
- 优雅降级，不影响其他附加组件

### 3. 性能考虑
- 避免在 onLoad 中执行重操作
- 使用防抖/节流优化频繁调用
- 及时清理资源

### 4. 依赖管理
- 明确声明附加组件依赖
- 检查依赖附加组件是否可用
- 提供降级方案

## 🔮 未来规划

### 待开发的附加组件

1. **内容处理附加组件 (ContentProcessingAddon)**
   - Emoji 渲染
   - PlantUML 图表
   - Vue/React 组件
   - Markdown 扩展

2. **编辑器增强附加组件 (EditorEnhancementAddon)**
   - Emmet 支持
   - 自定义工具栏
   - 悬浮预览
   - 快捷操作

3. **数据集成附加组件 (DataIntegrationAddon)**
   - 天气 API
   - 数据库管理
   - 文件处理
   - 外部服务集成

4. **通知附加组件 (NotificationAddon)**
   - Ntfy 通知
   - 系统通知
   - 音频提醒
   - 邮件通知

5. **UI界面附加组件 (UIAddon)**
   - 浏览器视图
   - 图表组件
   - 模态框
   - 自定义面板

### 扩展方向

- 支持附加组件热重载
- 附加组件市场和分发机制
- 附加组件依赖解析
- 附加组件配置导入/导出
- 附加组件性能监控

## 📚 参考资料

- [VitePress 插件系统](https://vitepress.dev/guide/custom-theme)
- [Obsidian 插件开发文档](https://docs.obsidian.md/Plugins/Getting+started/Build+a+plugin)
- [Vue 3 组合式 API](https://vuejs.org/guide/extras/composition-api-faq.html) 