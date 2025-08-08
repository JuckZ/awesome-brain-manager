# 视图注册重复问题修复

## 问题描述
运行时出现错误：`Attempting to register an existing view type "pomodoro-history-view"`

## 问题原因
番茄钟历史视图被重复注册了：

1. **main.ts 第560行** - 主插件直接注册了 `POMODORO_HISTORY_VIEW`
2. **PomodoroAddon.extendViews()** - 通过addon系统也注册了同样的视图

## 修复方案

### 1. 移除主插件中的重复注册
```typescript
// 删除了这部分代码
this.registerView(POMODORO_HISTORY_VIEW, leaf => {
    if (!this.pomodoroHistoryView) {
        this.pomodoroHistoryView = new PomodoroHistoryView(leaf, this);
    }
    return this.pomodoroHistoryView;
});
```

### 2. 清理相关引用
- 移除了 `POMODORO_HISTORY_VIEW` 的导入
- 删除了 `pomodoroHistoryView` 属性
- 清理了所有对 `POMODORO_HISTORY_VIEW` 的直接引用

### 3. 职责转移
现在 `POMODORO_HISTORY_VIEW` 完全由 `PomodoroAddon` 管理：

```typescript
// PomodoroAddon.ts
extendViews(): ViewDefinition[] {
  return [
    {
      type: POMODORO_HISTORY_VIEW,
      name: '番茄钟历史',
      icon: 'clock',
      viewCreator: (leaf) => {
        return new PomodoroHistoryView(leaf, this.context!.plugin);
      }
    }
  ];
}
```

## 架构优势

### 1. 避免重复注册
- 每个视图只在一个地方注册
- 清晰的职责分工

### 2. 模块化管理
- 番茄钟相关的所有功能都在 `PomodoroAddon` 中
- 主插件只负责核心功能和addon协调

### 3. 生命周期一致
- 视图的创建、管理、销毁都由同一个addon负责
- 避免生命周期不一致的问题

## 测试验证

修复后应该能够：
1. 正常启动插件，不再出现重复注册错误
2. 通过 PomodoroAddon 的命令正常打开番茄钟历史视图
3. 插件卸载时正确清理所有资源

## 注意事项

- 如果需要在主插件中访问番茄钟视图，应该通过 AddonManager 获取 PomodoroAddon 实例
- 其他功能如果需要打开番茄钟历史，应该调用 PomodoroAddon 的方法而不是直接操作视图 