# 视觉特效修复说明

## 问题描述
在重构为addon架构后，窗口抖动特效、鼠标特效、按键特效全部失效。

## 问题原因
1. **VisualEffectsAddon中特效函数被注释** - 在重构过程中，`toggleShake`等函数调用被注释掉
2. **设置获取/保存逻辑缺失** - `getSetting`和`setSetting`方法没有正确实现
3. **鼠标点击特效重复注册** - main.ts和VisualEffectsAddon都注册了点击事件监听器
4. **设置数据类型不匹配** - AddonManager传递的是`PluginDataIO`对象，而addon期望的是简单的键值对

## 修复内容

### 1. 修复VisualEffectsAddon.ts
- ✅ 取消注释所有特效函数调用
- ✅ 实现正确的设置获取/保存逻辑
- ✅ 添加鼠标点击特效事件监听器管理
- ✅ 修复类型兼容性问题

### 2. 修复AddonManager.ts
- ✅ 添加设置代理对象，将`SettingModel`转换为简单键值对
- ✅ 创建`createSettingsProxy()`方法处理设置数据转换

### 3. 清理main.ts
- ✅ 移除重复的鼠标点击特效事件监听器
- ✅ 移除不再需要的`toggleMouseClickEffects`导入

## 修复后的功能

### 光标特效
- 支持12种不同的光标特效
- 可通过设置面板或命令切换
- 特效层级正确，在侧边栏和弹窗中可见

### 打字特效
- 支持5种不同的打字特效模式
- 粒子效果和动画正常工作
- 可通过设置或命令控制

### 窗口抖动特效
- 编辑器震动效果恢复正常
- 可通过设置开关控制
- 震动强度和时间正确

### 鼠标点击特效
- 点击时显示自定义文字
- 支持多个文字随机显示（逗号分隔）
- 动画效果和颜色正常

## 测试验证
1. 打开Obsidian插件设置
2. 在"视觉特效"部分调整各项设置
3. 验证特效是否正常工作：
   - 光标特效：移动鼠标查看效果
   - 打字特效：在编辑器中输入文字
   - 窗口抖动：输入时观察编辑器震动
   - 点击特效：点击编辑器区域查看文字动画

## 技术细节

### 设置数据流
```
SETTINGS (SettingModel) 
  ↓ createSettingsProxy()
AddonContext.settings (简单对象)
  ↓ getSetting/setSetting
VisualEffectsAddon (特效控制)
```

### 事件管理
- 每个addon独立管理自己的事件监听器
- 在`onLoad`时添加，在`onUnload`时清理
- 避免重复注册和内存泄漏

### 类型兼容
- 使用`as any`处理历史API的类型不匹配
- 创建兼容对象适配原有函数签名
- 保持向后兼容性 