# Awesome Brain Manager Plugin

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

It's not too long now. Just finish reading.π€£

[δΈ­ζζζ‘£](./README.md)

[English Doc](#)

</details>

<details open>
  <summary><h2>π€ 1. Why Awesome Brain Manager </h2></summary>
  
- π¨ Designed carefully, your obsidian will be unique
- β¨ Rich features; A plugin can also meet many requirements
- π Support the core values of obsidian without privacy and security issues
- βοΈ Will continue to optimize performance
- πͺ Jest-based coverage test (in the future)
- π Welcome to [join me](https://github.com/JuckZ/JuckZ/blob/main/README_en.md#-how-to-reach-me) and develop together

</details>

<details open>
  <summary><h3> π» 1.1 Preview </h3></summary>

#### mouse and keystroke effects

<a href="https://www.bilibili.com/video/BV12R4y1q7De/?spm_id_from=333.999.0.0">
  <img src="https://raw.githubusercontent.com/JuckZ/awesome-brain-manager/master/public/recording/preview/ηΉζε±η€Ί.png" alt="ιΌ ζ γζι?ηΉζε±η€Ί" width="49%">
</a>

#### pomodoro

<a href="https://w11ww.bilibili.com/video/BV1284y1H74R/?spm_id_from=333.999.0.0">
  <img src="https://raw.githubusercontent.com/JuckZ/awesome-brain-manager/master/public/recording/preview/ηͺθιη€ΊδΎ.png" alt="ηͺθιεθ½ε±η€Ί" width="49%">
</a>

#### Attach pictures to the article intelligently

<a href="https://www.bilibili.com/video/BV1SM411Y7L9/?spm_id_from=333.999.0.0">
  <img src="https://raw.githubusercontent.com/JuckZ/awesome-brain-manager/master/public/recording/preview/εζ’banner.png" alt="ζζ‘£ζΊθ½ιεΎεθ½ε±η€Ί" width="49%">
</a>

#### Display of document direction switch

<a href="ttps://www.bilibili.com/video/BV1ne4y1P7qf/?spm_id_from=333.999.0.0">
  <img src="https://raw.githubusercontent.com/JuckZ/awesome-brain-manager/master/public/recording/preview/ζζ‘£ζΉε.png" alt="ζζ‘£ζΉεεζ’εθ½ε±η€Ί" width="49%">
</a>
 
</details>

<details open>
  <summary><h3> β¨ 1.2 Features </h3></summary>

1. Pomodoro features
    - (new) i18n support
    - (new) Support theme following system (effective when the pomodoro page is reopened)
    - plan a task
    - start/stop/cancel/delete task
    - Tasks are automatically completed and reminded when they are due (even after restarting). The expiration time is 25m by default, which can be set in the settings panel.
    - Data kanban: daily focus time, daily task completion, daily timeline, calendar month view, etc
2. Mouse effects
    - 11 types are supported, which can be found in [cursor-effects](https://tholman.com/cursor-effects/)
3. Keystroke effects
    - 4 types are supported now
4. Window jitter effect (triggered when text input)
5. All effects can be used in any combination
6. Document direction switch (support LTR and RTL)
7. Add banner to the article ([obsidian-banners](https://github.com/noatpad/obsidian-banners) is required)
    - Supports 3 kinds of image sources (pixabay, pexels, dummyimage)
    - Support right-clicking in the content of the document to add banner to the current document
    - Support right-clicking any folder in the file browser view to add banners to all the documents in the directory
8. Support [ntfy](https://docs.ntfy.sh), you can subscribe to notification messages on multiple platforms such as Windows/MacOS/Android/IOS/Linux/Web, and notification capability is no longer limited by Electron
    - You can be notified even if you turn off obsidian
    - You can subscribe to any device and receive reminders from obsidian, such as schedule reminders, birthday reminders, habit sign-in reminders, etc.
    - For a better experience, the feature will be available later, along with free ntfy services. π
    - If you only need simple notification capabilities and do not cross platforms, then [obsidian-reminder](https://github.com/uphy/obsidian-reminder) is your better choice.
9. Automatically transfer yesterday's unfinished tasks to today's diary documents
    - Not available yet. [obsidian-rollover-daily-todos](https://github.com/lumoe/obsidian-rollover-daily-todos) is recommended.

</details>

<details>
  <summary><h3> π© 1.3 Roadmap π </h3></summary>

> π‘ There will be more and more functions in the future. This is just the tip of the iceberg. To avoid getting lost, you can click β¨ star β¨.

1. β° Pomodoro feature
    - [ ] Link with document TODO task data (see task and dataview plug-ins)
    - [ ] Habit of clocking in (periodic tasks) support
    - [ ] Combined with spaced repeat, intelligent planning review tasks
    - [ ] Sound reminder at the end of the mission
    - [ ] White noise
    - [ ] Pomodoro thermal map
    - [ ] Statistics of daily time utilization and optimization suggestions are given.
2. π Mouse effects
    - [ ] Add more effects
    - [ ] Add different trigger methods for special effects (such as click, double click, etc.)
    - [ ] Add the ability to customize the configuration of special effects
3. π Document direction switch
    - [ ] Remember the document direction selection for each document
    - [ ] Support global default direction settings
4. ποΈ Add banner to the article
    - [ ] AI analyzes the contents of the document to find or generate pictures
    - [ ] Support for entering custom image matching keywords
5. π Better note-taking experience
    - [ ] Table insertion and real-time preview editing
    - [ ] Pictures / large file attachments are automatically uploaded to personal OSS and other warehouses to prevent external chain failure
    - [ ] Cornell's note-taking
    - [ ] Voice notes
    - [ ] Custom color tag
    - [ ] Customize documents, folder icons, text colors, and other styles
    - [ ] Customize the icon of commonly used websites
6. π₯ Blog system support
    - [ ] Seamless deployment of hugo
    - [ ] Seamless deployment of vuepress
    - [ ] May be released as a plugin corresponding to the blog system, rather than integrated in this plugin
7. π Calendar, timeline with customizable appearance and function
8. πΈ Legger feature
    - [ ] Support the transfer of billing data from common platforms
    - [ ] Billing data Kanban
    - [ ] Shopping list intelligent price comparison, and list prices and flash sale activity, etc.
9. π Create and maintain communities such as discord
10. π Solve your privacy concerns.
    - [ ] Provide docker images that can be deployed on your own
    - [ ] Open source backend code

</details>

<details open>
  <summary><h2> π 2. How to use </h2></summary>

### How to install

#### method1: From Plugin Market in Obsidian

π: [Not available now] At present, PR has been submitted to obsidian official, and it can only be launched after a period of review. Now, this plugin cannot be searched in the plugin market

#### method2: Download Manually

π: Download the latest release.zip from [Releases](https://github.com/JuckZ/awesome-brain-manager/releases) pageοΌthen put the extracted folder `awesome-brain-manager` into your {{obsidian_vault}}/.obsidian/plugins folder.

#### Method3: Using BRAT

π: Add `JuckZ/awesome-brain-manager` to BRAT.

> Now you can learn how to use it by [watching videos](https://github.com/JuckZ/awesome-brain-manager/blob/master/README_en.md#--11-preview-), and if needed, I will provide better documentation in the future.

</details>

<details>
  <summary><h2> π¨βπ» 3. For developer π </h2></summary>

### Log switch

Open the Settings panel with the 'Enable debug' option under the 'Advance' group

### Debugging method

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
  <summary><h2> π 4. Test report </h2></summary>

  <img src="https://codecov.io/gh/JuckZ/awesome-brain-manager/branch/master/graphs/tree.svg?token=OSGSNH98WS"/>
</details>

<details open>
  <summary><h2> π 5. Reference </h2></summary>

1. [obsidian-rollover-daily-todos](https://github.com/lumoe/obsidian-rollover-daily-todos)
2. [obsidian-admotion](https://github.com/valentine195/obsidian-admonition)
3. [obsidian-reminder](https://github.com/uphy/obsidian-reminder)
4. [cursor-effects](https://github.com/tholman/cursor-effects)
5. [awesome power mode](https://github.com/codeinthedark/awesome-power-mode)
6. [Obsidian RTL Plugin](https://github.com/esm7/obsidian-rtl)
7. [party-js](https://github.com/yiliansource/party-js)
8. [chart.js](https://chartjs.org/)
9. [naiveui](https://naiveui.com/)
10. For more reference projects, see [package.json](./package.json) file

</details>

## π Thanks

This project owes a debt of gratitude to [obsidian-rollover-daily-todos](https://github.com/lumoe/obsidian-rollover-daily-todos), [obsidian-admotion](https://github.com/valentine195/obsidian-admonition), [obsidian-reminder](https://github.com/uphy/obsidian-reminder), [makemd](https://github.com/Make-md/makemd), [Blue-topaz-example](https://github.com/PKM-er/Blue-topaz-example) and some other projects for their invaluable contributions, especially project Blue-topaz-exampleγobsidian-reminderγmakemd bring me lots of inspiratio. I have utilized and customized some of their code in this project, and I strongly recommend these projects for their impressive.

<!-- ππ₯β­πβ³π―π²π¬ππ©π¬ποΈπππβ‘ -->
