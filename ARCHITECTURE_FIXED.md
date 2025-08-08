# 修正后的Addon架构设计

## 问题分析与解决方案

### 原有问题
1. **重复的register逻辑**: AddonRegistry和AddonManager都有register方法，职责不清
2. **生命周期混乱**: 实例创建时机不当，重复初始化
3. **类型不匹配**: utils接口定义与实际使用不符
4. **功能注册不完整**: 扩展功能没有真正注册到主插件

### 修正方案

## 新架构设计

### 1. AddonRegistry - 类型注册表
```typescript
class AddonRegistry {
  // 存储Addon类，不是实例
  private static addonClasses: (new () => AwesomeBrainAddon)[]
  
  // 注册新的Addon类型
  static registerAddonClass(addonClass: new () => AwesomeBrainAddon)
  
  // 按需创建实例
  static createAllAddons(): AwesomeBrainAddon[]
  static createAddon(name: string): AwesomeBrainAddon | undefined
}
```

**职责**:
- 管理可用的Addon类型
- 按需创建Addon实例
- 支持动态注册新的Addon类型

### 2. AddonManager - 实例管理器
```typescript
class AddonManager {
  private addons: Map<string, AwesomeBrainAddon>
  private enabledAddons: Set<string>
  
  // 注册Addon实例
  register(addon: AwesomeBrainAddon)
  
  // 生命周期管理
  async enable(name: string)
  async disable(name: string)
  async initializeAll()
}
```

**职责**:
- 管理Addon实例的生命周期
- 处理启用/禁用逻辑
- 将Addon功能注册到主插件

### 3. 清晰的生命周期

```typescript
// 1. 插件启动时
const addons = AddonRegistry.createAllAddons(); // 创建实例
addons.forEach(addon => manager.register(addon)); // 注册到管理器
await manager.initializeAll(); // 根据enabled属性启用

// 2. 运行时
await manager.enable('visual-effects'); // 动态启用
await manager.disable('pomodoro'); // 动态禁用

// 3. 插件卸载时
await manager.unloadAll(); // 卸载所有
```

## 架构优势

### 1. 职责清晰
- **AddonRegistry**: 类型管理，实例创建
- **AddonManager**: 生命周期管理，功能注册
- **Main Plugin**: 核心功能，协调管理

### 2. 避免重复
- 不再有重复的register逻辑
- 实例只在需要时创建
- 避免重复初始化

### 3. 类型安全
- 修复了utils接口类型问题
- 完善了命令和视图注册类型

### 4. 扩展性好
- 支持动态注册新Addon类型
- 支持运行时启用/禁用
- 功能真正注册到主插件

## 使用示例

### 注册新Addon类型
```typescript
// 动态注册新的Addon类型
AddonRegistry.registerAddonClass(MyCustomAddon);
```

### 运行时管理
```typescript
// 启用特定Addon
await addonManager.enable('my-custom-addon');

// 检查状态
const isEnabled = addonManager.isEnabled('visual-effects');

// 获取已启用的Addon
const enabledAddons = addonManager.getEnabledAddons();
```

### Addon开发
```typescript
export class MyAddon implements AwesomeBrainAddon {
  name = 'my-addon';
  version = '1.0.0';
  enabled = true;

  async onLoad(context: AddonContext) {
    // 初始化逻辑
  }

  extendCommands(): CommandDefinition[] {
    return [
      {
        id: 'my-command',
        name: 'My Command',
        callback: () => { /* 逻辑 */ }
      }
    ];
  }
}
```

## 总结

修正后的架构解决了原有的设计问题，提供了：
- 清晰的职责分工
- 正确的生命周期管理
- 完整的功能注册
- 良好的扩展性和类型安全 