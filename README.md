# Awesome Brain Manager 插件

<p align="center">
  <img width="300px" src="https://avatars.githubusercontent.com/u/65011256?s=280&v=4">
</p>

<p align="center">
  <a href="https://github.com/semantic-release/semantic-release">
    <img src="https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg">
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

<p align="center">Awesome Brain Manager Plugin - An Obsidian plugin library</p>

<details open>
  <summary><h2>0. TLDR </h2></summary>

It's not too long now. Just finish reading.🤣

[English Doc](./README_en.md)

[中文文档](#)

</details>

<details open>
  <summary><h2>🤔 1. 为什么选择 Awesome Brain Manager </h2></summary>
  
- 🎨 会加入越来越多的精心设计，你的 obsidian 会与众不同
- ✨ 会加入越来越多的功能；在未来，仅一个插件，也能够满足大部分需求
- 🔐 支持 obsidian 的核心价值观，没有隐私安全问题
- ✈️ 将持续优化性能
- 💪 基于Jest的覆盖率测试(将来)
- 😁 欢迎[加入](https://github.com/JuckZ#-%E5%A6%82%E4%BD%95%E8%81%94%E7%B3%BB%E6%88%91)，共同开发

</details>

<details open>
  <summary><h3> 💻 1.1 功能预览 </h3></summary>

<a href="https://www.bilibili.com/video/BV12R4y1q7De/?spm_id_from=333.999.0.0">
  <img src="https://raw.githubusercontent.com/JuckZ/awesome-brain-manager/master/public/recording/preview/特效展示.png" alt="鼠标、按键特效展示" width="49%">
</a>
<a href="https://w11ww.bilibili.com/video/BV1284y1H74R/?spm_id_from=333.999.0.0">
  <img src="https://raw.githubusercontent.com/JuckZ/awesome-brain-manager/master/public/recording/preview/番茄钟示例.png" alt="番茄钟功能展示" width="49%">
</a>
<a href="https://www.bilibili.com/video/BV1SM411Y7L9/?spm_id_from=333.999.0.0">
  <img src="https://raw.githubusercontent.com/JuckZ/awesome-brain-manager/master/public/recording/preview/切换banner.png" alt="文档智能配图功能展示" width="49%">
</a>
<a href="ttps://www.bilibili.com/video/BV1ne4y1P7qf/?spm_id_from=333.999.0.0">
  <img src="https://raw.githubusercontent.com/JuckZ/awesome-brain-manager/master/public/recording/preview/文档方向.png" alt="文档方向切换功能展示" width="49%">
</a>

</details>

<details open>
  <summary><h3> ✨ 1.2 功能点 </h3></summary>

1. 番茄钟功能
    - 将任务加入番茄钟规划
    - 开始/暂停/放弃/删除任务
    - 任务到期自动完成并提醒（即使重启 Obsidian 后也能弹窗），到期时间默认 25 分钟，可以在设置面板设置
    - 数据看板：每日专注时长，每日任务完成情况，当日时间线，日历月视图等
2. 鼠标特效
    - 目前支持 11 种，可以在[cursor-effects](https://tholman.com/cursor-effects/)查看
3. 按键特效
    - 目前支持 4 种
4. 窗口抖动特效（文本输入时触发）
5. 所有特效可以任意组合使用
6. 文档方向切换（支持从左到右和从右到左）
7. 文章配图（需要安装[obsidian-banners](https://github.com/noatpad/obsidian-banners)插件）
    - 支持三种图源（pixabay, pexels, dummyimage）
    - 支持在文档内容中单击右键，为当前文档配图
    - 支持使用右键单击文件浏览器视图中的任意文件夹，为整个目录下的文档配图
8. [ntfy](https://docs.ntfy.sh)支持，可以在 Windows/MacOS/Android/IOS/Linux/Web 等多种平台订阅通知消息，通知能力不再受到 Electron 的限制
    - 即使关闭 obsidian，也能收到通知
    - 你能在任何设备上订阅并收到来自 obsidian 的提醒，比如日程提醒，生日提醒，习惯打卡提醒等
    - 为了更好的体验，该功能后续开放，同时提供免费的 ntfy 服务 😁
    - 如果你只需要简单的通知能力且不跨平台，那么 [obsidian-reminder](https://github.com/uphy/obsidian-reminder) 是你更好的选择
9. 自动转移昨日未完成任务到今日日记文档
    - 暂未开放，推荐使用 [obsidian-rollover-daily-todos](https://github.com/lumoe/obsidian-rollover-daily-todos)

</details>

<details>
  <summary><h3> 🚩 1.3 路线图 👈 </h3></summary>

> 💡 未来的功能会越来越多，这只是冰山一角，为了避免迷路，点一点 ✨ star ✨ 吧

1. ⏰ 番茄钟
    - [ ] 与文档 TODO 任务数据联动（参考 task 和 dataview 插件）
    - [ ] 习惯打卡（周期性任务）支持
    - [ ] 结合 spaced repeat，智能规划复习任务
    - [ ] 任务结束音效提醒
    - [ ] 白噪音
    - [ ] 番茄热力图
    - [ ] 统计每日时间利用情况，给出优化建议
2. 🌈 鼠标特效
    - [ ] 增加更多特效 ing, 10%
    - [ ] 增加不同的特效触发方式（如单击，双击等）
    - [ ] 增加特效自定义配置的能力
3. 📄 文档方向切换
    - [ ] 记住每个文档的文档方向选择
    - [ ] 支持全局默认方向设置
4. 🏜️ 文章配图
    - [ ] AI 分析文档内容，寻找或生成图片
    - [ ] 支持输入自定义配图关键字
5. 📝 更好的笔记记录体验
    - [ ] 表格插入和实时预览编辑
    - [ ] 图片/大文件附件自动上传到个人 OSS 等仓库，防止外链失效
    - [ ] 康奈尔笔记法
    - [ ] 语音笔记
    - [ ] 自定义彩色标签
    - [ ] 自定义文档、文件夹图标、文字颜色等样式
    - [ ] 自定义常用网站的 icon
6. 🔥 博客系统支持
    - [ ] hugo 无缝部署
    - [ ] vuepress 无缝部署
    - [ ] 可能以对应博客系统的插件形式发布，而非整合在此插件
7. 📆 日程表、可自定义外观和功能的时间线
8. 💸 账单功能
    - [ ] 支持转移常用平台账单数据
    - [ ] 账单数据看板
    - [ ] 购物清单智能比价，并罗列价格和秒杀活动等
9. 📍 创建并维护 discord 等社区
10. 🔐 解决你的隐私之忧
    - [ ] 提供可以自己部署的 docker 镜像
    - [ ] 开源后端代码

</details>

<details open>
  <summary><h2> 🔍 2. 如何使用 </h2></summary>

现在你可以通过[浏览视频](https://github.com/JuckZ/awesome-brain-manager#--11-%E5%8A%9F%E8%83%BD%E9%A2%84%E8%A7%88-)的方式了解使用方法，未来需要时，会提供更好的使用文档

</details>

<details>
  <summary><h2> 👨‍💻 3. 开发者须知 👈 </h2></summary>

### 日志开关

打开设置面板，在 `Advance` 分组下有 `Enable debug` 选项

### 调试方法

#### Windows(cmd.exe)

```cmd
set "OUTDIR=path_to_this_plugin_in_your_obsidian_vault" && npm run dev
```

#### Windows(Powershell)

```powershell
($env:OUTDIR = "path_to_this_plugin_in_your_obsidian_vault") -and (npm run dev)
```

eg.

```powershell
($env:OUTDIR="../juckz.github.io/blogs/.obsidian/plugins/awesome-brain-manager") -and (npm run dev)
```

#### Linux, macOS(Bash)

```bash
OUTDIR="path_to_this_plugin_in_your_obsidian_vault" npm run dev
```

eg.

```bash
OUTDIR="../juckz.github.io/blogs/.obsidian/plugins/awesome-brain-manager" npm run dev
```

</details>

<details open>
  <summary><h2> 📈 4. 测试报告 </h2></summary>

  <img src="https://codecov.io/gh/JuckZ/awesome-brain-manager/branch/master/graphs/tree.svg?token=OSGSNH98WS"/>
</details>

<details open>
  <summary><h2> 📜 5. 参考 </h2></summary>

1. [obsidian-rollover-daily-todos](https://github.com/lumoe/obsidian-rollover-daily-todos)
2. [obsidian-admotion](https://github.com/valentine195/obsidian-admonition)
3. [obsidian-reminder](https://github.com/uphy/obsidian-reminder)
4. [cursor-effects](https://github.com/tholman/cursor-effects)
5. [awesome power mode](https://github.com/codeinthedark/awesome-power-mode)
6. [Obsidian RTL Plugin](https://github.com/esm7/obsidian-rtl)
7. [party-js](https://github.com/yiliansource/party-js)
8. [chart.js](https://chartjs.org/)
9. [naiveui](https://naiveui.com/)
10. 更多参考，请查阅 [package.json](./package.json) 文件

</details>

<!-- 📌🔥⭐🌟⛳🎯📲🎬🔎📩📬🗂️📆🌏🌄⚡ -->
