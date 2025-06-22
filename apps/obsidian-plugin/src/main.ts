/* eslint-disable @typescript-eslint/no-explicit-any */
import 'virtual:uno.css';
import {
    App,
    Editor,
    type MarkdownFileInfo,
    MarkdownPreviewRenderer,
    MarkdownView,
    Menu,
    Notice,
    Plugin,
    type PluginManifest,
    TAbstractFile,
    TFile,
    Tasks,
    WorkspaceLeaf,
    WorkspaceWindow,
    debounce,
    normalizePath,
} from 'obsidian';
import { ref } from 'vue';
import { Database } from 'sql.js';
import { t } from 'i18next';
import { i18nextPromise } from '@/i18n';
import { HoverEditor, type HoverEditorParent } from '@/ui/popover';
import { expandEmmetAbbreviation } from '@/utils/emmet';
import { usePomodoroStore, useSystemStore } from '@/stores';
import Replacer from '@/Replacer';
import Process from '@/process/Process';
import { checkInDefaultPath, checkInList, customSnippetPath } from '@/utils/constants';
import { monkeyPatchConsole } from '@/obsidian-hack/obsidian-debug-mobile';
import { EmojiPickerModal, ImageOriginModal, PomodoroReminderModal } from '@/ui/modal';
import { POMODORO_HISTORY_VIEW, PomodoroHistoryView } from '@/ui/view/PomodoroHistoryView';
import { BROWSER_VIEW, BrowserView } from '@/ui/view/BrowserView';
import { codeEmoji } from '@/render/Emoji';
import { toggleCursorEffects, toggleMouseClickEffects } from '@/render/CursorEffects';
import { LoggerUtil } from '@/utils/logger';
import { getAllFiles, getCleanTitle, getNotePath } from '@/utils/file';
import { weatherDesc } from '@/api/weather';
import { DBUtil } from '@/utils/db/db';
import { insertAfterHandler } from '@/utils/content';
import { getLocalRandomImg, searchPicture } from '@/utils/genBanner';
import { PomodoroStatus } from '@/utils/pomotodo';
import { AwesomeBrainSettingTab, SETTINGS } from '@/settings';
import { PluginDataIO } from '@/data';
import { eventTypes } from '@/types/types';
import { onCodeMirrorChange, toggleBlast, toggleShake } from '@/render/Blast';
import { notifyNtfy } from '@/api';
import '@/main.scss';
import { NotifyUtil } from '@/utils/ntfy/notify';
import { EditorUtil, EditorUtils } from '@/utils/editor';
import { UpdateModal } from '@/ui/modal/UpdateModal';

// import { initWorker } from '@/web-worker';

// initWorker();

export const OpenUrl = ref('https://baidu.com');
const media = window.matchMedia('(prefers-color-scheme: dark)');

export default class AwesomeBrainManagerPlugin extends Plugin {
    pluginDataIO: PluginDataIO;
    private pomodoroHistoryView: PomodoroHistoryView | null = null;
    spaceDB: Database | null = null;

    resizeFunction: () => any = () => {};
    clickFunction: (evt: MouseEvent) => any = () => {};
    fileOpenFunction: (file: TFile | null) => any = () => {};
    layoutChangeFunction: () => any = () => {};
    windowOpenFunction: (win: WorkspaceWindow, window: Window) => any = () => {};
    windowCloseFunction: (win: WorkspaceWindow, window: Window) => any = () => {};
    cssChangeFunction: () => any = () => {};
    fileMenuFunction: (menu: Menu, file: TAbstractFile, source: string, leaf?: WorkspaceLeaf) => any = () => {};
    editorMenuFunction: (menu: Menu, editor: Editor, info: MarkdownView | MarkdownFileInfo) => any = () => {};
    editorChangeFunction: (editor: Editor, info: MarkdownView | MarkdownFileInfo) => any = () => {};
    editorPasteFunction: (evt: ClipboardEvent, editor: Editor, info: MarkdownView | MarkdownFileInfo) => any = () => {};
    editorDropFunction: (evt: DragEvent, editor: Editor, info: MarkdownView | MarkdownFileInfo) => any = () => {};
    codemirrorFunction: (cm: CodeMirror.Editor) => any = () => {};
    quitFunction: (tasks: Tasks) => any = () => {};

    vaultCreateFunction: (file: TAbstractFile) => any = () => {};
    vaultModifyFunction: (file: TAbstractFile) => any = () => {};
    vaultDeleteFunction: (file: TAbstractFile) => any = () => {};
    vaultRenameFunction: (file: TAbstractFile, oldPath: string) => any = () => {};
    vaultRawFunction: (path: string) => any = () => {};
    vaultClosedFunction: () => any = () => {};

    useSnippet = true;
    style: HTMLStyleElement = document.createElement('style');
    spacesDBPath: string = '';
    replacer: Replacer = new Replacer(this);
    process: Process = new Process(this);
    emojiPickerModal: EmojiPickerModal = new EmojiPickerModal(this.app);
    interact: any = null;

    constructor(app: App, manifest: PluginManifest) {
        super(app, manifest);
        this.app = app;
        this.replacer = new Replacer(this);
        this.process = new Process(this);
        this.pluginDataIO = new PluginDataIO(this);
        this.bindFunction();
    }

    bindFunction() {
        this.resizeFunction = this.customizeResize.bind(this);
        this.clickFunction = this.customizeClick.bind(this);
        this.editorMenuFunction = this.customizeEditorMenu.bind(this);
        this.editorChangeFunction = this.customizeEditorChange.bind(this);
        this.editorPasteFunction = this.customizeEditorPaste.bind(this);
        this.fileMenuFunction = this.customizeFileMenu.bind(this);
        this.codemirrorFunction = this.customizeCodeMirror.bind(this);
        this.vaultCreateFunction = this.customizeVaultCreate.bind(this);
        this.vaultModifyFunction = this.customizeVaultModify.bind(this);
        this.vaultDeleteFunction = this.customizeVaultDelete.bind(this);
        this.vaultRenameFunction = this.customizeVaultRename.bind(this);
        this.vaultRawFunction = this.customizeRaw.bind(this);
    }

    openBrowserHandle(e: CustomEvent) {
        this.openBrowser(e.detail.url);
    }

    get snippetPath() {
        return this.app.customCss.getSnippetPath(customSnippetPath);
    }

    generateCssString() {
        const sheet: string[] = [
            // TODO 临时解决，这个代码导致同步插件同步隐藏文件时频繁冲突，后面可以优化成判断是否已经生成过css
            // `/* This snippet was auto-generated by the awesome-brain-manager plugin on ${new Date().toLocaleString()} */`,
        ];

        for (const rule of Array.from(this.style.sheet!.cssRules)) {
            sheet.push(rule.cssText);
        }
        return sheet.join('\n\n');
    }

    async updateSnippet() {
        if (!this.useSnippet) return;
        if (await this.app.vault.adapter.exists(this.snippetPath)) {
            await this.app.vault.adapter.write(this.snippetPath, this.generateCssString());
        } else {
            const snippetsPath = this.app.customCss.getSnippetsFolder();
            const pathExist = await this.app.vault.adapter.exists(snippetsPath);
            if (!pathExist) {
                this.app.vault.adapter.mkdir(snippetsPath);
                await this.app.vault.create(this.snippetPath, this.generateCssString());
            }
            await this.app.vault.create(this.snippetPath, this.generateCssString());
        }
        this.app.customCss.getSnippetsFolder();
        this.app.customCss.setCssEnabledStatus(customSnippetPath, true);
        this.app.customCss.readSnippets();
    }

    resizeHandle = debounce(
        () => {
            // LoggerUtil.log('resize')
        },
        100,
        true,
    );

    async customizeResize(): Promise<void> {
        // 防抖
        this.resizeHandle();
    }

    async customizeClick(evt: MouseEvent): Promise<void> {
        // LoggerUtil.log('customizeClick');
    }

    getMenus() {
        return [
            {
                title: t('menu.setBannerForCurrent'),
                icon: 'image',
                clickFn: (menu: Menu, editor: Editor, info: MarkdownView | MarkdownFileInfo) => {
                    new ImageOriginModal(this.app, this, this.app.workspace.getActiveFile()).open();
                },
            },
            {
                title: 'Notify this to ntfy',
                icon: 'megaphone',
                clickFn: (menu: Menu, editor: Editor, info: MarkdownView | MarkdownFileInfo) => {
                    notifyNtfy(EditorUtils.getCurrentSelection(editor));
                },
            },
            {
                title: 'Query openAI',
                icon: 'bot',
                clickFn: async (menu: Menu, editor: Editor, info: MarkdownView | MarkdownFileInfo) => {
                    const evt = new CustomEvent(eventTypes.calledFunction, {
                        detail: {
                            type: 'OpenAI',
                            keyword: EditorUtils.getCurrentSelection(editor),
                        },
                    });
                    window.dispatchEvent(evt);
                },
            },
            {
                title: t('menu.planPomodoro'),
                icon: 'send',
                clickFn: async (menu: Menu, editor: Editor, info: MarkdownView | MarkdownFileInfo) => {
                    const task = EditorUtils.getCurrentSelection(editor);
                    usePomodoroStore().quickAddPomodoro(task);
                },
            },
            {
                title: t('menu.showPomodoro'),
                icon: 'alarm-clock',
                clickFn: async (menu: Menu, editor: Editor, info: MarkdownView | MarkdownFileInfo) => {
                    this.app.workspace.detachLeavesOfType(POMODORO_HISTORY_VIEW);
                    await this.app.workspace.getRightLeaf(false)?.setViewState({
                        type: POMODORO_HISTORY_VIEW,
                        active: true,
                    });
                    this.app.workspace.revealLeaf(
                        this.app.workspace.getLeavesOfType(POMODORO_HISTORY_VIEW)[0] as WorkspaceLeaf,
                    );
                },
            },
        ];
    }

    async customizeEditorMenu(menu: Menu, editor: Editor, info: MarkdownView | MarkdownFileInfo): Promise<void> {
        this.getMenus().forEach(menuMeta => {
            menu.addItem(item => {
                item.setTitle(menuMeta.title)
                    .setIcon(menuMeta.icon)
                    .onClick(async () => {
                        menuMeta.clickFn(menu, editor, info);
                    });
            });
        });
    }
    async customizeEditorChange(editor: Editor, info: MarkdownView | MarkdownFileInfo): Promise<void> {
        onCodeMirrorChange(editor);
    }

    async customizeEditorPaste(
        evt: ClipboardEvent,
        editor: Editor,
        info: MarkdownView | MarkdownFileInfo,
    ): Promise<void> {
        // LoggerUtil.log('');
    }

    async customizeFileMenu(menu: Menu, file: TAbstractFile, source: string, leaf?: WorkspaceLeaf): Promise<void> {
        menu.addItem(item => {
            item.setTitle(t('menu.setBannerForTheFolder'))
                .setIcon('image')
                .onClick(async () => {
                    new ImageOriginModal(this.app, this, file).open();
                });
        });
    }

    async customizeCodeMirror(cm: CodeMirror.Editor): Promise<void> {
        // LoggerUtil.log('');
    }

    async customizeVaultCreate(file: TAbstractFile): Promise<void> {}

    async customizeVaultModify(file: TAbstractFile): Promise<void> {}

    async customizeVaultDelete(file: TAbstractFile): Promise<void> {}

    async customizeVaultRename(file: TAbstractFile, oldPath: string): Promise<void> {}

    async customizeRaw(path: string): Promise<void> {
        const paths = path.split('/');
        const reloadPluginList = ['awesome-brain-manager'];
        if (path.startsWith(this.app.plugins.getPluginFolder()) && paths.length >= 4) {
            const plugin = paths[2];
            const file = paths[paths.length - 1];
            if (file.endsWith('.mdb')) return;
            if (reloadPluginList.includes(plugin)) {
                this.reloadPlugins(plugin);
            }
        }
    }

    async reloadPlugins(plugin: string) {
        const plugins = this.app.plugins;
        // Don't reload disabled plugins
        if (!plugins.enabledPlugins.has(plugin)) return;
        await plugins.disablePlugin(plugin);
        try {
            setTimeout(async () => {
                await this.app.plugins.enablePlugin(plugin);
                new Notice(`Plugin "${plugin}" has been reloaded`);
            }, 100);
        } catch (error) {
            new Notice(`Failed reload "${plugin}"`);
            console.error(error);
        }
    }

    override async onload(): Promise<void> {
        await i18nextPromise;
        await this.pluginDataIO.load();
        LoggerUtil.init(SETTINGS.debugEnable);
        DBUtil.init(this, () => {
            usePomodoroStore().loadPomodoroData();
            this.startPomodoroTask();
        });
        EditorUtil.init(this);
        NotifyUtil.init(this);
        this.setupCommands();
        if (SETTINGS.enableTwemoji.value) {
            MarkdownPreviewRenderer.registerPostProcessor(this.process.EmojiProcess);
        }
        this.registerMarkdownPostProcessor(codeEmoji);
        this.registerMarkdownCodeBlockProcessor('plantuml', this.process.UMLProcess);
        this.registerMarkdownCodeBlockProcessor('vue-widget', this.process.VueProcess);
        this.registerMarkdownCodeBlockProcessor('react-widget', this.process.ReactProcess);

        this.app.workspace.onLayoutReady(async () => {
            if (SETTINGS.debugEnable.value) {
                monkeyPatchConsole(this);
            }
            this.setupUI();
            this.watchVault();
            setTimeout(() => {
                // workaround to ensure our plugin shows up properly within Style Settings
                this.app.workspace.trigger('css-change');
            }, 2000);
        });
        await this.migrate();
        this.announceUpdate();
    }

    private startPomodoroTask() {
        // 进来就找到ing任务，如果有，则开始interval任务，倒计时准备弹窗提醒
        // 监听数据库变化事件，若变化，则刷新监听的任务
        this.registerInterval(
            window.setInterval(() => {
                const pomodoro = usePomodoroStore().currentPomodoro;
                if (!pomodoro) {
                    return;
                }
                const pomodoroStatus = new PomodoroStatus(pomodoro);
                if (pomodoroStatus.isOutTime()) {
                    NotifyUtil.playNoticeAudio();
                    if (SETTINGS.systemNoticeEnable.value) {
                        NotifyUtil.nativeSystemNotify('Pomodoro task done: ', pomodoro.task);
                    } else {
                        new PomodoroReminderModal(this.app, pomodoro).open();
                    }
                    if (SETTINGS.ntfyServerHost.value) {
                        notifyNtfy('Pomodoro task done: ' + pomodoro.task);
                    }
                    const changed = pomodoroStatus.changeState('done');
                    if (changed) {
                        usePomodoroStore().updatePomodoro(pomodoro);
                    } else {
                        LoggerUtil.error('Update failed', pomodoro);
                    }
                }
                if (pomodoroStatus.getState() === 'ing') {
                    const statusBar = document.querySelector('#obsidian-manager-pomodoro-status-bar');
                    statusBar?.setAttr('title', pomodoro.task);
                    // TODO 控制titlebar的宽度，使用省略号
                    const remainTime = moment.duration(pomodoroStatus.getRemainTime(), 'milliseconds');
                    statusBar?.setText(
                        `🍅 ${pomodoroStatus.getPomodoro().task} ${moment
                            .utc(remainTime.asMilliseconds())
                            .format('HH:mm:ss')}`,
                    );
                }
            }, 1 * 1000),
        );
    }

    private async addACheck(path: string, filename: string, time: string, content: string) {
        const normalizedPath = await getNotePath(path, filename);
        const todayMoment = moment();
        this.app.vault.adapter.process(normalizedPath, fileContents => {
            const newFileContent = insertAfterHandler(
                '## 打卡',
                `- [ ] ${time} ${content} ⏳ ${todayMoment.format('YYYY-MM-DD')}`,
                fileContents,
            );
            return newFileContent.content;
        });
    }

    private async removeACheck(path: string, filename: string, time: string, content: string) {
        const normalizedPath = await getNotePath(path, filename);
        const todayMoment = moment();
        this.app.vault.adapter.process(normalizedPath, fileContents => {
            const originalLine = `\n- [ ] ${time} ${content} ⏳ ${todayMoment.format('YYYY-MM-DD')}`;
            const newContent = fileContents.replace(originalLine, '');
            return newContent;
        });
    }

    private async habitCheckIn() {
        checkInList.forEach(habit => {
            const { path, filename, time, content } = habit;
            this.addACheck(path || checkInDefaultPath, filename, time, content);
        });
    }

    private async removeHabitCheckIn() {
        checkInList.forEach(habit => {
            const { path, filename, time, content } = habit;
            this.removeACheck(path || checkInDefaultPath, filename, time, content);
        });
    }

    public utils = {
        getCleanTitle,
        getLocalRandom: (title: string, path: string) => {
            return getLocalRandomImg(this.app, title, path);
        },
        weatherDesc: (apiKey: string, amapKey: string) => {
            return weatherDesc({
                apiKey: apiKey || SETTINGS.qweatherApiKey.value,
                amapKey: amapKey || SETTINGS.aMapApiKey.value,
                type: 'obsidian',
            });
        },
    };

    async setRandomBanner(path: TAbstractFile | null, origin: string): Promise<void> {
        // const ignorePath = ['Journal', 'Reading', 'Obsidian', 'Archive'];
        const ignorePath: string[] = [];
        // FIXME 找到并使用更高性能api this.app.vault.getMarkdownFiles();
        const allFilePathNeededHandle: TFile[] = await getAllFiles(this.app, path, ignorePath, ['md'], []);
        allFilePathNeededHandle.forEach(async file => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const hash = this.app.metadataCache.fileCache[file.path].hash;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const frontmatter = this.app.metadataCache.metadataCache[hash].frontmatter;
            const banner = frontmatter?.banner;
            const title = frontmatter?.title;
            const newBanner = await searchPicture(origin, title);
            if (newBanner) {
                this.app.vault.adapter.process(normalizePath(file.path), fileContents => {
                    let originalLine = `banner: '${banner}'`;
                    if (!fileContents.contains(originalLine)) {
                        originalLine = `banner: "${banner}"`;
                    }
                    const newContent = fileContents.replace(originalLine, `banner: '${newBanner}'`);
                    return newContent;
                });
            }
        });
    }

    private async copyDebugInfo() {
        const debugInfo = this.getDebugInfo(); // 获取调试信息的函数
        await navigator.clipboard.writeText(debugInfo);
        new Notice('调试信息已复制到剪贴板');
    }

    private getDebugInfo(): string {
        // 这里构建你的调试信息
        return `调试信息：\n插件版本: ${this.manifest.version}\n其他信息...`;
    }

    private sendHelpEmail() {
        const debugInfo = this.getDebugInfo();
        const mailtoLink = `mailto:juckz@foxmail.com?subject=求助&body=${encodeURIComponent(debugInfo)}`;
        window.open(mailtoLink);
    }

    private openGitHubIssue(errorMessage: string): void {
        const repoUrl = 'https://github.com/juckz/awesome-brain-manager/issues/new'; // 替换为您的 GitHub 仓库 URL
        const issueTitle = encodeURIComponent('错误报告');
        const body = encodeURIComponent(`## 错误详情\n\n\`\`\`\n${errorMessage}\n\`\`\``);
        const issueUrl = `${repoUrl}?title=${issueTitle}&body=${body}`;
        window.open(issueUrl, '_blank');
    }

    private setupCommands() {
        this.addCommand({
            id: 'copy-debug-info',
            name: '复制调试信息',
            callback: () => {
                this.copyDebugInfo();
            },
        });

        this.addCommand({
            id: 'send-help-email',
            name: '发送求助邮件',
            callback: () => {
                this.sendHelpEmail();
            },
        });

        this.addCommand({
            id: 'new-issue',
            name: '创建github issue',
            callback: () => {
                this.openGitHubIssue(this.getDebugInfo());
            },
        });

        this.addCommand({
            id: 'cut-line',
            icon: 'scissors',
            name: t('command.cut-line'),
            callback: () => {
                const editor = this.app.workspace.activeEditor?.editor;
                if (editor) {
                    EditorUtils.cutLine(editor);
                }
            },
        });
        this.addCommand({
            id: 'plan-pomodoro',
            icon: 'scissors',
            name: t('command.plan-pomodoro'),
            callback: () => {
                const editor = this.app.workspace.activeEditor?.editor;
                if (editor) {
                    const task = EditorUtils.getCurrentSelection(editor);
                    usePomodoroStore().quickAddPomodoro(task);
                }
            },
        });
        this.addCommand({
            id: 'check-in',
            name: t('command.check-in'),
            callback: () => {
                this.habitCheckIn();
            },
        });

        this.addCommand({
            id: 'remove-check-in',
            name: t('command.remove-check-in'),
            callback: () => {
                this.removeHabitCheckIn();
            },
        });

        this.addCommand({
            id: 'query-openai',
            name: t('command.query-openai'),
            hotkeys: [{ modifiers: ['Mod', 'Shift'], key: 'o' }],
            // 带条件的编辑器指令
            // editorCheckCallback: (checking: boolean, editor: Editor, view: MarkdownView) => {}
            editorCallback: (editor: Editor, view: MarkdownView | MarkdownFileInfo) => {
                const evt = new CustomEvent(eventTypes.calledFunction, {
                    detail: {
                        type: 'OpenAI',
                        keyword: editor.getSelection(),
                    },
                });
                window.dispatchEvent(evt);
            },
        });

        this.addCommand({
            id: 'open-emoji-picker',
            name: t('command.open-emoji-picker'),
            // 带条件的指令
            checkCallback: (checking: boolean) => {
                const activeFile = this.app.workspace.getActiveFile();
                if (activeFile) {
                    if (!checking) {
                        if (!this.emojiPickerModal) {
                            this.emojiPickerModal = new EmojiPickerModal(this.app);
                        }
                        this.emojiPickerModal.open();
                    }
                    return true;
                }
                return false;
            },
        });
    }

    async openBrowser(url: string) {
        OpenUrl.value = url;
        this.app.workspace.detachLeavesOfType(BROWSER_VIEW);
        await this.app.workspace.getLeaf(true).setViewState({
            type: BROWSER_VIEW,
            active: true,
        });
        this.app.workspace.revealLeaf(this.app.workspace.getLeavesOfType(BROWSER_VIEW)[0] as WorkspaceLeaf);
    }

    private setupUI() {
        useSystemStore().updateLanguage(window.localStorage.getItem('language') || 'en');
        useSystemStore().updateTheme(document.body.classList.contains('theme-dark') ? 'dark' : 'light');
        this.style = document.head.createEl('style', {
            attr: { id: 'OBSIDIAN_MANAGER_CUSTOM_STYLE_SHEET' },
        });
        // this.registerEditorExtension(emojiListPlugin);
        toggleBlast(SETTINGS.powerMode.value);
        toggleShake(SETTINGS.shakeMode);
        toggleCursorEffects(SETTINGS.cursorEffect.value);
        // 状态栏图标
        const obsidianManagerPomodoroStatusBar = this.addStatusBarItem();
        obsidianManagerPomodoroStatusBar.createEl('span', {
            text: '🍅',
            attr: {
                id: 'obsidian-manager-pomodoro-status-bar',
                style: 'cursor: pointer',
            },
        });
        obsidianManagerPomodoroStatusBar.onClickEvent(async evt => {
            this.app.workspace.detachLeavesOfType(POMODORO_HISTORY_VIEW);
            await this.app.workspace.getRightLeaf(false)?.setViewState({
                type: POMODORO_HISTORY_VIEW,
                active: true,
            });
            this.app.workspace.revealLeaf(
                this.app.workspace.getLeavesOfType(POMODORO_HISTORY_VIEW)[0] as WorkspaceLeaf,
            );
        });
        // 自定义图标
        // addIcon('circle', '<circle cx="50" cy="50" r="50" fill="currentColor" />');
        // 设置选项卡
        this.addSettingTab(new AwesomeBrainSettingTab(this.app, this, this.pluginDataIO));
        this.registerView(POMODORO_HISTORY_VIEW, leaf => {
            if (!this.pomodoroHistoryView) {
                this.pomodoroHistoryView = new PomodoroHistoryView(leaf, this);
            }
            return this.pomodoroHistoryView;
        });
        this.registerView(BROWSER_VIEW, leaf => new BrowserView(leaf, this, OpenUrl));

        EditorUtil.addTags(JSON.parse(SETTINGS.customTag.value));

        // 左侧菜单，使用自定义图标
        this.addRibbonIcon('settings-2', 'Awesome Brain Manager', event => {
            const menu = new Menu();
            this.getMenus().forEach(menuMeta => {
                menu.addItem(item => {
                    item.setTitle(menuMeta.title)
                        .setIcon(menuMeta.icon)
                        .onClick(async () => {
                            // TODO 参数校验优化
                            menuMeta.clickFn(
                                menu,
                                this.app.workspace.activeEditor?.editor as Editor,
                                this.app.workspace.activeEditor as MarkdownFileInfo,
                            );
                        });
                });
            });
            menu.showAtMouseEvent(event);
        });
    }

    maybeRefresh = () => {
        // TODO
        // If the index revision has changed recently, then queue a reload.
        // But only if we're mounted in the DOM and auto-refreshing is active.
        // if (this.lastReload != this.index.revision && this.container.isShown() && this.settings.refreshEnabled) {
        //     this.lastReload = this.index.revision;
        //     this.render();
        // }
    };

    private watchVault() {
        // https://github.com/kepano/obsidian-system-dark-mode/blob/master/main.ts
        // Watch for system changes to color theme
        const callback = () => {
            // 监听主题跟随系统变化
            if (media.matches) {
                LoggerUtil.log('Dark mode active');
            } else {
                LoggerUtil.log('Light mode active');
            }
        };

        const classChangeCallback: MutationCallback = (mutationsList, observer) => {
            mutationsList.forEach(mutation => {
                const currentTheme = useSystemStore().systemState.theme;
                if (currentTheme === 'dark' && document.body.classList.contains('theme-light')) {
                    useSystemStore().updateTheme('light');
                }
                if (currentTheme === 'light' && document.body.classList.contains('theme-dark')) {
                    useSystemStore().updateTheme('dark');
                }
            });
        };
        const mutationObserver = new MutationObserver(classChangeCallback);
        mutationObserver.observe(document.body, { attributeFilter: ['class'], subtree: false });
        media.addEventListener('change', callback);
        this.register(() => media.removeEventListener('change', callback));
        this.register(() => mutationObserver.disconnect());
        window.onkeydown = event => {
            if (event.key === 'Tab') {
                const editor = this.app.workspace.activeEditor?.editor as Editor;
                if (editor) {
                    const triggerText = EditorUtils.getCurrentSelection(editor);
                    const targetText = expandEmmetAbbreviation(triggerText);
                    if (targetText) {
                        EditorUtils.replaceCurrentSelection(editor, targetText);
                        event.preventDefault();
                    }
                }
            }
        };
        // window.addEventListener('languagechange', () => {
        //     console.log('languagechange event detected!');
        // });
        const selectionChangeCallback = async (e: Event) => {
            EditorUtil.changeToolbarPopover(e as MouseEvent, SETTINGS.toolbar);
        };
        this.registerDomEvent(activeDocument, 'selectionchange', selectionChangeCallback);
        this.registerDomEvent(activeDocument, 'click', async (e: MouseEvent) => {
            toggleMouseClickEffects(e, SETTINGS.clickString);
        });
        const mouseMoveCallback = (event: MouseEvent) => {
            useSystemStore().updateMouseCoords({
                x: event.clientX,
                y: event.clientY,
            });
        };
        const previewCursorCallback = (e: CustomEvent) => {
            const newLeaf = new HoverEditor(
                this.app.workspace.activeLeaf as unknown as HoverEditorParent,
                this.app.workspace.activeLeaf!.containerEl,
                this,
                300,
                () => {
                    this.app.workspace.setActiveLeaf(newLeaf, false, true);
                },
            ).attachLeaf();
            newLeaf!.openLinkText(e.detail.cursorTarget.file.name, e.detail.cursorTarget.path);
        };
        window.addEventListener('mousemove', mouseMoveCallback);
        this.register(() => window.removeEventListener('mousemove', mouseMoveCallback));
        window.addEventListener(eventTypes.previewCursor, previewCursorCallback as EventListener);
        this.register(() =>
            window.removeEventListener(eventTypes.previewCursor, previewCursorCallback as EventListener),
        );
        const openBrowserCallback = this.openBrowserHandle.bind(this);
        window.addEventListener(eventTypes.openBrowser, openBrowserCallback as EventListener);
        this.register(() => window.removeEventListener(eventTypes.openBrowser, openBrowserCallback as EventListener));
        [
            this.app.workspace.on('dataview:refresh-views', this.maybeRefresh),
            this.app.workspace.on('codemirror', this.codemirrorFunction),
            // this.app.workspace.on('click', this.clickFunction),
            this.app.workspace.on('resize', this.resizeFunction),
            this.app.workspace.on('editor-change', this.editorChangeFunction),
            this.app.workspace.on('editor-paste', this.editorPasteFunction),
            this.app.workspace.on('file-menu', this.fileMenuFunction),
            this.app.workspace.on('editor-menu', this.editorMenuFunction),
            this.app.vault.on('create', this.vaultCreateFunction),
            this.app.vault.on('modify', this.vaultModifyFunction),
            this.app.vault.on('delete', this.vaultDeleteFunction),
            this.app.vault.on('rename', this.vaultRenameFunction),
            this.app.vault.on('raw', this.vaultRawFunction),
        ].forEach(eventRef => {
            this.registerEvent(eventRef);
        });
    }

    // 版本迁移(为后续改造番茄钟数据结构做准备)
    private migrate() {
        return false;
    }

    private announceUpdate() {
        // TODO 优化
        const currentVersion = this.manifest.version;
        const knownVersion = SETTINGS.version.value;
        if (currentVersion === knownVersion) return;
        SETTINGS.version.rawValue.value = currentVersion;
        this.pluginDataIO.save();
        const updateModal = new UpdateModal(knownVersion);
        updateModal.open();
    }

    override async onunload(): Promise<void> {
        EditorUtil.unload();
        NotifyUtil.onload();
        toggleBlast('0');
        this.app.workspace.detachLeavesOfType(POMODORO_HISTORY_VIEW);
        this.style.detach();
        console.warn('unloading plugin');
    }
}
