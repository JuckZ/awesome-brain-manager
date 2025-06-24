# Awesome Brain Manager Obsidian 主题

这是一个为 Obsidian 设计的主题，旨在解决大多数用户在使用 Obsidian 时遇到的常见问题。

## 特点

- 多种颜色方案（Awesome、Nord、Atom、macOS）
- 笔记本风格背景选项
- 无干扰标题模式
- 完全自定义的引用块和标注样式
- 优化的标签样式
- 支持全宽度模式
- 自定义复选框样式

## 安装

1. 在 Obsidian 中，打开设置 > 外观 > 主题
2. 点击"管理"按钮
3. 搜索"Awesome Brain Manager"并安装

## 开发

### 前提条件

- Node.js 16+
- pnpm

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm dev
```

这将启动一个监视进程，当你修改SCSS文件时会自动重新编译主题。开发模式会生成sourcemap，方便调试样式。

### 构建

```bash
pnpm build
```

这将编译主题并将其复制到指定的输出目录。构建过程会生成压缩的CSS文件和对应的sourcemap文件，便于在浏览器中调试。

## 配置

主题可以通过 Obsidian 的 Style Settings 插件进行配置。主要设置包括：

1. 颜色方案选择
2. 无干扰标题模式
3. 插件样式选项
4. 背景图像设置

## 技术说明

- 使用 SCSS 进行样式编写
- 使用 sass-embedded 编译 SCSS 文件
- 遵循 Obsidian 主题规范
- 支持sourcemap，便于开发调试
- 使用@use语法替代旧的@import语法，符合Sass未来发展方向

## 贡献

欢迎贡献！请随时提交问题或拉取请求。 