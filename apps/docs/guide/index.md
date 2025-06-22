# Awesome Brain Manager Plugin

## ✨ Features

1. Pomodoro
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
8. Support [ntfy](https:/docs.ntfy.sh), you can subscribe to notification messages on multiple platforms such as Windows/MacOS/Android/IOS/Linux/Web, and notification capability is no longer limited by Electron
    - You can be notified even if you turn off obsidian
    - You can subscribe to any device and receive reminders from obsidian, such as schedule reminders, birthday reminders, habit sign-in reminders, etc.
    - For a better experience, the feature will be available later, along with free ntfy services. 😁
    - If you only need simple notification capabilities and do not cross platforms, then [obsidian-reminder](https://github.com/uphy/obsidian-reminder) is your better choice.
9. Automatically transfer yesterday's unfinished tasks to today's diary documents
    - Not available yet. [obsidian-rollover-daily-todos](https://github.com/lumoe/obsidian-rollover-daily-todos) is recommended.

## 🚩 Roadmap

> 💡 There will be more and more functions in the future. This is just the tip of the iceberg. To avoid getting lost, you can click ✨ star ✨.

1. ⏰ Pomodoro feature
    - [ ] Link with document TODO task data (see task and dataview plug-ins)
    - [ ] Habit of clocking in (periodic tasks) support
    - [ ] Combined with spaced repeat, intelligent planning review tasks
    - [ ] Sound reminder at the end of the mission
    - [ ] White noise
    - [ ] Pomodoro thermal map
    - [ ] Statistics of daily time utilization and optimization suggestions are given.
2. 🌈 Mouse effects
    - [ ] Add more effects
    - [ ] Add different trigger methods for special effects (such as click, double click, etc.)
    - [ ] Add the ability to customize the configuration of special effects
3. 📄 Document direction switch
    - [ ] Remember the document direction selection for each document
    - [ ] Support global default direction settings
4. 🏜️ Add banner to the article
    - [ ] AI analyzes the contents of the document to find or generate pictures
    - [ ] Support for entering custom image matching keywords
5. 📝 Better note-taking experience
    - [ ] Table insertion and real-time preview editing
    - [ ] Pictures / large file attachments are automatically uploaded to personal OSS and other warehouses to prevent external chain failure
    - [ ] Cornell's note-taking
    - [ ] Voice notes
    - [ ] Custom color tag
    - [ ] Customize documents, folder icons, text colors, and other styles
    - [ ] Customize the icon of commonly used websites
6. 🔥 Blog system support
    - [ ] Seamless deployment of hugo
    - [ ] Seamless deployment of vuepress
    - [ ] May be released as a plugin corresponding to the blog system, rather than integrated in this plugin
7. 📆 Calendar, timeline with customizable appearance and function
8. 💸 Legger feature
    - [ ] Support the transfer of billing data from common platforms
    - [ ] Billing data Kanban
    - [ ] Shopping list intelligent price comparison, and list prices and flash sale activity, etc.
9. 📍 Create and maintain communities such as discord
10. 🔐 Solve your privacy concerns.
    - [ ] Provide docker images that can be deployed on your own
    - [ ] Open source backend code