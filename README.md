# Awesome Brain Manager

<p align="center">
  <img width="300px" src="/public/logo.png">
</p>

<p align="center">
  <!-- Open in Dev Containers -->
  <a href="https://vscode.dev/redirect?url=vscode://ms-vscode-remote.remote-containers/cloneInVolume?url=https://github.com/JuckZ/awesome-brain-manager/tree/develop">
    <img src="https://img.shields.io/static/v1?label=Dev%20Containers&message=Open&color=blue">
  </a>

  <a href="https://github.com/changesets/changesets">
    <img src="https://img.shields.io/badge/versioning-changesets-blue.svg">
  </a>
  <a href="https://npmcharts.com/compare/awesome-brain-manager?minimal=true">
    <img src="https://img.shields.io/npm/dm/awesome-brain-manager.svg">
  </a>
  <a href="https://codecov.io/gh/JuckZ/awesome-brain-manager" >
    <img src="https://codecov.io/gh/JuckZ/awesome-brain-manager/branch/master/graph/badge.svg?token=D6DI2HRC5Q"/>
  </a>
  <br>
</p>

<p align="center">
  <a href="https://www.npmjs.org/package/awesome-brain-manager">
    <img src="https://img.shields.io/npm/v/awesome-brain-manager/latest.svg">
  </a>
  <a href="https://www.npmjs.org/package/awesome-brain-manager">
    <img src="https://img.shields.io/npm/v/awesome-brain-manager/next.svg">
  </a>
  <a href="https://www.npmjs.org/package/awesome-brain-manager">
    <img src="https://img.shields.io/npm/v/awesome-brain-manager/beta.svg">
  </a>
</p>

<p align="center">Awesome Brain Manager - An Obsidian plugin</p>

<details open>
  <summary><h2>📝 Documentation </h2></summary>

  To check out docs, visit [English Doc](https://abm.ihave.cool) or [中文文档](https://abm.ihave.cool/zh)

</details>

<details open>
<!-- 🔄 -->
  <summary><h2>📅 Changelog </h2></summary>
  
  Detailed changes for each release are documented in the [CHANGELOG](https://github.com/JuckZ/awesome-brain-manager/blob/master/CHANGELOG.md).

</details>

<details open>
<!-- 👥 -->
  <summary><h2> 🤝 Contribution </h2></summary>

  Please make sure to read the Contributing Guide before making a pull request.

</details>

<details open>
<!-- 📜 -->
  <summary><h2> ⚖️ License </h2></summary>

  [MIT](https://github.com/JuckZ/awesome-brain-manager/blob/master/LICENSE)

  Copyright (c) 2022-present Juck

</details>

<details open>
<!-- 🙏 -->
  <summary><h2> 💖 Thanks </h2></summary>

  This project owes a debt of gratitude to [obsidian-rollover-daily-todos](https://github.com/lumoe/obsidian-rollover-daily-todos), [obsidian-admotion](https://github.com/valentine195/obsidian-admonition), [obsidian-reminder](https://github.com/uphy/obsidian-reminder), [makemd](https://github.com/Make-md/makemd), [Blue-topaz-example](https://github.com/PKM-er/Blue-topaz-example) and some other projects for their invaluable contributions, especially project Blue-topaz-example、obsidian-reminder、makemd bring me lots of inspiratio. I have utilized and customized some of their code in this project, and I strongly recommend these projects for their impressive.

</details>

# Awesome Brain Manager Monorepo

一个解决 Obsidian 中常见问题的插件，现在使用 monorepo 结构进行管理。

## 技术栈

- **构建工具**：Turborepo
- **包管理器**：pnpm
- **UI 框架**：Vue 3
- **构建系统**：Vite
- **文档工具**：VitePress

## 项目结构

```
awesome-brain-manager/
├── apps/                   # 应用程序
│   └── obsidian-plugin/    # Obsidian 插件应用
│
├── packages/               # 可共享的包
│   ├── ui/                 # UI 组件库
│   ├── utils/              # 实用工具库
│   ├── theme/              # 主题相关
│   ├── docs/               # 文档
│   └── tsconfig/           # 共享 TypeScript 配置
│
└── turbo.json              # Turborepo 配置
```

## 开发指南

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
# 开发所有工作区
pnpm dev

# 开发特定工作区
pnpm dev --filter=awesome-brain-manager
pnpm dev --filter=@repo/ui
```

### 构建项目

```bash
# 构建所有工作区
pnpm build

# 构建特定工作区
pnpm build --filter=awesome-brain-manager
```

### 测试

```bash
# 测试所有工作区
pnpm test

# 测试特定工作区
pnpm test --filter=@repo/utils
```

### 文档开发

```bash
# 启动文档开发服务器
pnpm docs:dev
```

## 添加新的依赖

```bash
# 添加依赖到根目录
pnpm add -w [package]

# 添加依赖到特定工作区
pnpm add [package] --filter=awesome-brain-manager
```

## 添加内部依赖

在 `package.json` 中使用 `workspace:*` 语法添加工作区依赖：

```json
{
  "dependencies": {
    "@repo/ui": "workspace:*"
  }
}
```

## 发布流程（Changesets）

```bash
# 1) 新功能/修复提交前，创建 changeset
pnpm changeset

# 2) 合并到 master 后，CI 会自动创建/更新版本 PR
#    （由 .github/workflows/release.yml 驱动）

# 3) 版本 PR 合并后，CI 自动执行发布
#    - 运行 pnpm changeset:version
#    - 发布 npm 包（pnpm changeset:publish）
```

发布前如果需要本地预演版本文件更新：

```bash
pnpm changeset:version
```

## 常见问题

### 1. 如何创建新的包或应用？

可以使用以下命令创建新的工作区：

```bash
pnpm turbo gen workspace
```

然后按照提示进行设置。

### 2. 如何确保依赖关系正确？

在 `turbo.json` 中设置任务的依赖关系，例如：

```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"]
    }
  }
}
```

这确保了在构建当前包之前，其依赖的所有包都已经完成构建。
