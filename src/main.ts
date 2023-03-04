import {
    TAbstractFile,
    Tasks,
    WorkspaceWindow,
    normalizePath,
    App,
    Editor,
    MarkdownView,
    Menu,
    Plugin,
    TFile,
    WorkspaceLeaf,
    debounce,
    MarkdownPreviewRenderer,
} from 'obsidian';
import type { MarkdownFileInfo, PluginManifest } from 'obsidian';

import Replacer from './Replacer';
import Process from './process/Process';
import { ref } from 'vue';
import type { Database } from 'sql.js';
import { checkInDefaultPath, checkInList, customSnippetPath, pomodoroDB } from './utils/constants';
import { monkeyPatchConsole } from './obsidian-hack/obsidian-debug-mobile';
import { EmojiPickerModal, ImageOriginModal, PomodoroReminderModal } from './ui/modal';
import { POMODORO_HISTORY_VIEW, PomodoroHistoryView } from './ui/view/PomodoroHistoryView';
import { BROWSER_VIEW, BrowserView } from './ui/view/BrowserView';
import { codeEmoji } from './render/Emoji';
import { toggleCursorEffects, toggleMouseClickEffects } from './render/CursorEffects';
import Logger, { initLogger } from './utils/logger';
import { getAllFiles, getCleanTitle, getNotePath } from './utils/file';
import { getWeather } from './utils/weather';
import { getTagsFromTask, getTaskContentFromTask } from './utils/common';
import {
    dbResultsToDBTables,
    deleteFromDB,
    getDB,
    initialDBCtx,
    insertIntoDB,
    saveDBAndKeepAlive,
    selectDB,
    updateDBConditionally,
} from './utils/db/db';
import { insertAfterHandler } from './utils/content';
import { editorUtil } from './utils/editor';
import { getLocalRandomImg, searchPicture } from './utils/genBanner';
import { loadSQL } from './utils/db/sqljs';
import { PomodoroStatus, initiateDB } from './utils/pomotodo';
import { AwesomeBrainSettingTab, SETTINGS } from './settings';
import { PluginDataIO } from './data';
import { eventTypes } from './types/types';
import type { ExtApp } from './types/types';
import { onCodeMirrorChange, toggleBlast, toggleShake } from './render/Blast';
import { pomodoroSchema } from './schemas/spaces';
import type { Pomodoro } from './schemas/spaces';
import { notify } from './api';
import t from './i18n';
import './main.scss';

export const OpenUrl = ref('https://baidu.com');
const media = window.matchMedia('(prefers-color-scheme: dark)');
export default class AwesomeBrainManagerPlugin extends Plugin {
    override app: ExtApp;
    pluginDataIO: PluginDataIO;
    private pomodoroTarget: Pomodoro | null;
    quickPreviewFunction: (file: TFile, data: string) => any;
    resizeFunction: () => any;
    clickFunction: (evt: MouseEvent) => any;
    activeLeafChangeFunction: (leaf: WorkspaceLeaf | null) => any;
    fileOpenFunction: (file: TFile | null) => any;
    layoutChangeFunction: () => any;
    windowOpenFunction: (win: WorkspaceWindow, window: Window) => any;
    windowCloseFunction: (win: WorkspaceWindow, window: Window) => any;
    cssChangeFunction: () => any;
    fileMenuFunction: (menu: Menu, file: TAbstractFile, source: string, leaf?: WorkspaceLeaf) => any;
    editorMenuFunction: (menu: Menu, editor: Editor, info: MarkdownView | MarkdownFileInfo) => any;
    editorChangeFunction: (editor: Editor, info: MarkdownView | MarkdownFileInfo) => any;
    editorPasteFunction: (evt: ClipboardEvent, editor: Editor, info: MarkdownView | MarkdownFileInfo) => any;
    editorDropFunction: (evt: DragEvent, editor: Editor, info: MarkdownView | MarkdownFileInfo) => any;
    codemirrorFunction: (cm: CodeMirror.Editor) => any;
    quitFunction: (tasks: Tasks) => any;

    vaultCreateFunction: (file: TAbstractFile) => any;
    vaultModifyFunction: (file: TAbstractFile) => any;
    vaultDeleteFunction: (file: TAbstractFile) => any;
    vaultRenameFunction: (file: TAbstractFile, oldPath: string) => any;
    vaultClosedFunction: () => any;

    useSnippet = true;
    style: HTMLStyleElement;
    spacesDBPath: string;
    spaceDB: Database;
    replacer: Replacer;
    process: Process;
    emojiPickerModal: EmojiPickerModal;

    constructor(app: App, manifest: PluginManifest) {
        super(app, manifest);
        this.app = app as ExtApp;

        this.replacer = new Replacer(this);
        this.process = new Process(this);
        this.pluginDataIO = new PluginDataIO(this);
        this.bindFunction();
        initLogger(SETTINGS.debugEnable);
    }

    saveSpacesDB = debounce(() => saveDBAndKeepAlive(this.spaceDBInstance(), this.spacesDBPath), 1000, true);

    bindFunction() {
        this.resizeFunction = this.customizeResize.bind(this);
        this.clickFunction = this.customizeClick.bind(this);
        this.editorMenuFunction = this.customizeEditorMenu.bind(this);
        this.editorChangeFunction = this.customizeEditorChange.bind(this);
        this.editorPasteFunction = this.customizeEditorPaste.bind(this);
        this.fileMenuFunction = this.customizeFileMenu.bind(this);
        this.vaultCreateFunction = this.customizeVaultCreate.bind(this);
        this.vaultModifyFunction = this.customizeVaultModify.bind(this);
        this.vaultDeleteFunction = this.customizeVaultDelete.bind(this);
        this.vaultRenameFunction = this.customizeVaultRename.bind(this);
    }

	async sqlJS() {
        // Logger.time("Loading SQlite");
        const sqljs = await loadSQL();
        // Logger.timeEnd("Loading SQlite");
        return sqljs;
    }

    pomodoroChange(e: any) {
        this.refreshPomodoroTarget();
    }

    spaceDBInstance() {
        return this.spaceDB;
    }

    async startPomodoro(task: string) {
        const createTime = moment().format('YYYY-MM-DD HH:mm:ss');
        const tags: string[] = getTagsFromTask(task);
        const content: string = getTaskContentFromTask(task);
        const tagsStr = tags.join(',');
        insertIntoDB(this.spaceDB, {
            pomodoro: {
                uniques: pomodoroSchema.uniques,
                cols: pomodoroSchema.cols,
                rows: [
                    {
                        timestamp: new Date().getTime() + '',
                        task: content,
                        createTime,
                        spend: '0',
                        breaknum: '0',
                        expectedTime: (SETTINGS.expectedTime.value * 60 * 1000).toString(),
                        status: 'todo',
                        tags: tagsStr,
                    },
                ],
            },
        });
        saveDBAndKeepAlive(this.spaceDB, this.spacesDBPath);
        const evt = new CustomEvent(eventTypes.pomodoroChange);
        window.dispatchEvent(evt);
        Logger.log(selectDB(this.spaceDBInstance(), pomodoroDB));
    }

    get snippetPath() {
        return this.app.customCss.getSnippetPath(customSnippetPath);
    }

    generateCssString() {
        const sheet = [
            `/* This snippet was auto-generated by the awesome-brain-manager plugin on ${new Date().toLocaleString()} */`,
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
            await this.app.vault.create(this.snippetPath, this.generateCssString());
        }
        this.app.customCss.setCssEnabledStatus(customSnippetPath, true);
        this.app.customCss.readSnippets();
    }

    resizeHandle = debounce(() => Logger.log('resize'), 500, true);

    async customizeResize(): Promise<void> {
        // 防抖
        this.resizeHandle();
    }

    async customizeClick(evt: MouseEvent): Promise<void> {
        Logger.log('customizeClick');
    }

    async customizeEditorMenu(menu: Menu, editor: Editor, info: MarkdownView | MarkdownFileInfo): Promise<void> {
        menu.addItem(item => {
            item.setTitle(t.menu.setBannerForCurrent)
                .setIcon('image')
                .onClick(async () => {
                    new ImageOriginModal(this.app, this, this.app.workspace.getActiveFile()).open();
                });
        });
        menu.addItem(item => {
            item.setTitle('Notify this to ntfy')
                .setIcon('bell')
                .onClick(async () => {
                    const cursorPos = editor.getCursor();
                    let content = editor.getSelection();
                    if (!content) {
                        if (cursorPos) {
                            content = editor.getLine(cursorPos.line);
                        }
                    }
                    notify(content);
                });
        });
        menu.addItem(item => {
            item.setTitle('Query openAI')
                .setIcon('bot')
                .onClick(async () => {
                    const evt = new CustomEvent(eventTypes.calledFunction, {
                        detail: {
                            type: 'OpenAI',
                            keyword: editor.getSelection(),
                        },
                    });
                    window.dispatchEvent(evt);
                    // const cookies = electron.remote.session.defaultSession.cookies;
                    // cookies.get({ url: 'https://openai.com' }).then(cookies => {
                    //     console.log(cookies);
                    // });
                });
        });
        menu.addItem(item => {
            item.setTitle(t.menu.planPomodoro)
                .setIcon('clock')
                .onClick(async () => {
                    const cursorPos = editor.getCursor();
                    let task = editor.getSelection();
                    if (!task) {
                        if (cursorPos) {
                            task = editor.getLine(cursorPos.line);
                        }
                    }
                    task = task.replace('- [x] ', '');
                    task = task.replace('- [ ] ', '').trim();
                    if (!task) {
                        task = t.menu.defaultTask + Date.now();
                    }
                    this.startPomodoro(task);
                });
        });
    }
    async customizeEditorChange(editor: Editor, info: MarkdownView | MarkdownFileInfo): Promise<void> {
        onCodeMirrorChange(editor);
    }

    async customizeEditorPaste(evt: ClipboardEvent, editor: Editor, markdownView: MarkdownView): Promise<void> {}

    async customizeFileMenu(menu: Menu, file: TAbstractFile, source: string, leaf?: WorkspaceLeaf): Promise<void> {
        menu.addItem(item => {
            item.setTitle(t.menu.setBannerForTheFolder)
                .setIcon('image')
                .onClick(async () => {
                    new ImageOriginModal(this.app, this, file).open();
                });
        });
    }

    async customizeVaultCreate(file: TAbstractFile): Promise<void> {}

    async customizeVaultModify(file: TAbstractFile): Promise<void> {}

    async customizeVaultDelete(file: TAbstractFile): Promise<void> {}

    async customizeVaultRename(file: TAbstractFile, oldPath: string): Promise<void> {}

    override async onload(): Promise<void> {
        await this.pluginDataIO.load();
        editorUtil.init(this);
        this.setupUI();
        this.setupCommands();
        MarkdownPreviewRenderer.registerPostProcessor(this.process.EmojiProcess);
        this.registerMarkdownPostProcessor(codeEmoji);
        this.registerMarkdownCodeBlockProcessor('plantuml', this.process.UMLProcess);
        this.registerMarkdownCodeBlockProcessor('vue', this.process.VueProcess);

        this.spacesDBPath = normalizePath(
            this.app.vault.configDir + '/plugins/awesome-brain-manager/ObsidianManager.mdb',
        );
        initialDBCtx(this.app);
        this.spaceDB = await getDB(await loadSQL(), this.spacesDBPath);
        const tables = dbResultsToDBTables(
            this.spaceDBInstance().exec(
                "SELECT name FROM sqlite_schema WHERE type ='table' AND name NOT LIKE 'sqlite_%';",
            ),
        );
        if (tables.length == 0) {
            initiateDB(this.spaceDBInstance());
        }
        this.refreshPomodoroTarget();
        this.app.workspace.onLayoutReady(async () => {
            if (SETTINGS.debugEnable.value) {
                monkeyPatchConsole(this);
            }
            this.watchVault();
            // this.startPomodoroTask();
        });
    }

    private async refreshPomodoroTarget() {
        const pomodoroList = (await selectDB(this.spaceDBInstance(), pomodoroDB)?.rows) || [];
        this.pomodoroTarget = (pomodoroList.filter(pomodoro => pomodoro.status === 'ing')[0] as Pomodoro) || null;
    }

    private startPomodoroTask() {
        // 进来就找到ing任务，如果有，则开始interval任务，倒计时准备弹窗提醒
        // 监听数据库变化事件，若变化，则刷新监听的任务
        // this.register
        this.registerInterval(
            window.setInterval(() => {
                const pomodoro = this.pomodoroTarget;
                if (!pomodoro) {
                    return;
                }
                const pomodoroStatus = new PomodoroStatus(pomodoro);
                if (pomodoroStatus.isOutTime()) {
                    // TODO 弹窗，响铃，结束该任务
                    new PomodoroReminderModal(this.app, pomodoro).open();
                    const changed = pomodoroStatus.changeState('done');
                    if (changed) {
                        this.updatePomodoro(pomodoro);
                        this.pomodoroTarget = null;
                    } else {
                        Logger.error('Update failed', pomodoro);
                    }
                }
            }, 1 * 1000),
        );
    }

    deletePomodoro(pomodoro: Pomodoro) {
        deleteFromDB(this.spaceDBInstance(), pomodoroDB, `timestamp = ${pomodoro.timestamp}`);
        saveDBAndKeepAlive(this.spaceDBInstance(), this.spacesDBPath);
        const evt = new CustomEvent(eventTypes.pomodoroChange);
        window.dispatchEvent(evt);
    }

    updatePomodoro(pomodoro: Pomodoro) {
        updateDBConditionally(
            this.spaceDBInstance(),
            {
                pomodoro: {
                    uniques: pomodoroSchema.uniques,
                    cols: pomodoroSchema.cols,
                    rows: [pomodoro],
                },
            },
            `timestamp = ${pomodoro.timestamp}`,
        );
        saveDBAndKeepAlive(this.spaceDBInstance(), this.spacesDBPath);
        const evt = new CustomEvent(eventTypes.pomodoroChange);
        window.dispatchEvent(evt);
    }

    private async addACheck(path, filename, time, content) {
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

    private async removeACheck(path, filename, time, content) {
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
        getLocalRandom: (title, path) => {
            return getLocalRandomImg(this.app, title, path);
        },
        getWeather,
    };

    async setRandomBanner(path: TAbstractFile | null, origin: string): Promise<void> {
        // const ignorePath = ['Journal', 'Reading', 'MyObsidian', 'Archive'];
        const ignorePath = [];
        // FIXME 找到并使用更高性能api this.app.vault.getMarkdownFiles();
        const allFilePathNeededHandle: TFile[] = await getAllFiles(this.app, path, ignorePath, ['md'], []);
        // allFilePathNeededHandle = allFilePathNeededHandle.filter(file => {
        //     const banner =
        //         this.app.metadataCache.metadataCache[this.app.metadataCache.fileCache[file.path].hash].frontmatter
        //             ?.banner;
        //     return (
        //         banner &&
        //         typeof banner == 'string' &&
        //         (banner.startsWith('https://dummyimage') ||
        //             banner.startsWith('https://images.unsplash') ||
        //             banner.startsWith('https://pixabay.com') ||
        //             banner.startsWith('/'))
        //     );
        // });
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

    private setupCommands() {
        this.addCommand({
            id: 'check-in',
            name: t.command['check-in'],
            callback: () => {
                this.habitCheckIn();
            },
        });

        this.addCommand({
            id: 'remove-check-in',
            name: t.command['remove-check-in'],
            callback: () => {
                this.removeHabitCheckIn();
            },
        });

        this.addCommand({
            id: 'query-openai',
            name: t.command['query-openai'],
            hotkeys: [{ modifiers: ['Mod', 'Shift'], key: 'o' }],
            // 带条件的编辑器指令
            // editorCheckCallback: (checking: boolean, editor: Editor, view: MarkdownView) => {}
            editorCallback: (editor: Editor, view: MarkdownView) => {
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
            name: t.command['open-emoji-picker'],
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

    // Returns true if a replacement was made
    replacePageStyleByString(searchString: string, newStyle: string, addIfNotFound: boolean) {
        let alreadyExists = false;
        const style = this.findPageStyle(searchString);
        if (style) {
            if (style.getText() === searchString) alreadyExists = true;
            else style.setText(newStyle);
        } else if (addIfNotFound) {
            const style = document.createElement('style');
            style.textContent = newStyle;
            document.head.appendChild(style);
        }
        return style && !alreadyExists;
    }

    findPageStyle(regex: string) {
        const styles = document.head.getElementsByTagName('style');
        for (const style of styles) {
            if (style.getText().match(regex)) return style;
        }
        return null;
    }

    private setupUI() {
        this.style = document.head.createEl('style', {
            attr: { id: 'OBSIDIAN_MANAGER_CUSTOM_STYLE_SHEET' },
        });
        // this.registerEditorExtension(emojiListPlugin);
        toggleBlast(SETTINGS.powerMode.value);
        toggleShake(SETTINGS.shakeMode);
        toggleCursorEffects(SETTINGS.cursorEffect.value);
        // 状态栏图标
        const obsidianManagerPomodoroStatusBar = this.addStatusBarItem();
        obsidianManagerPomodoroStatusBar.createEl('span', { text: '🍅' });
        obsidianManagerPomodoroStatusBar.onClickEvent(async evt => {
            this.app.workspace.detachLeavesOfType(POMODORO_HISTORY_VIEW);
            await this.app.workspace.getRightLeaf(true).setViewState({
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
        this.registerView(POMODORO_HISTORY_VIEW, leaf => new PomodoroHistoryView(leaf, this));
        this.registerView(BROWSER_VIEW, leaf => new BrowserView(leaf, this, OpenUrl));

        editorUtil.addTags(JSON.parse(SETTINGS.customTag.value));

        // 左侧菜单，使用自定义图标
        this.addRibbonIcon('settings-2', 'Awesome Brain Manager', event => {
            const menu = new Menu();
            menu.addItem(item =>
                item
                    .setTitle(t.menu.showPomodoroHistory)
                    .setIcon('alarm-clock')
                    .onClick(async () => {
                        this.app.workspace.detachLeavesOfType(POMODORO_HISTORY_VIEW);
                        await this.app.workspace.getLeaf(true).setViewState({
                            type: POMODORO_HISTORY_VIEW,
                            active: true,
                        });
                        this.app.workspace.revealLeaf(
                            this.app.workspace.getLeavesOfType(POMODORO_HISTORY_VIEW)[0] as WorkspaceLeaf,
                        );
                    }),
            );
            menu.showAtMouseEvent(event);
        });
    }

    private watchVault() {
        // https://github.com/kepano/obsidian-system-dark-mode/blob/master/main.ts
        // Watch for system changes to color theme
        const callback = () => {
            // 监听主题跟随系统变化
            if (media.matches) {
                Logger.log('Dark mode active');
            } else {
                Logger.log('Light mode active');
            }
        };
        media.addEventListener('change', callback);
        // Remove listener when we unload
        this.register(() => media.removeEventListener('change', callback));
        this.registerDomEvent(activeDocument, 'mouseup', async (e: MouseEvent) => {
            editorUtil.changeToolbarPopover(e, SETTINGS.toolbar);
        });
        this.registerDomEvent(activeDocument, 'click', async (e: MouseEvent) => {
            toggleMouseClickEffects(e, SETTINGS.clickString);
        });
        window.addEventListener(eventTypes.pomodoroChange, this.pomodoroChange.bind(this));
        [
            this.app.workspace.on('click', this.clickFunction),
            this.app.workspace.on('resize', this.resizeFunction),
            this.app.workspace.on('editor-change', this.editorChangeFunction),
            this.app.workspace.on('editor-paste', this.editorPasteFunction),
            this.app.workspace.on('file-menu', this.fileMenuFunction),
            this.app.workspace.on('editor-menu', this.editorMenuFunction),
            this.app.vault.on('create', this.vaultCreateFunction),
            this.app.vault.on('modify', this.vaultModifyFunction),
            this.app.vault.on('delete', this.vaultDeleteFunction),
            this.app.vault.on('rename', this.vaultRenameFunction),
        ].forEach(eventRef => {
            this.registerEvent(eventRef);
        });
    }

    override async onunload(): Promise<void> {
        editorUtil.unloadCustomViewContainer();
        toggleBlast('0');
        this.app.workspace.detachLeavesOfType(POMODORO_HISTORY_VIEW);
        this.style.detach();
    }
}
