import {
    App,
    Editor,
    MarkdownPreviewRenderer,
    MarkdownView,
    Menu,
    Plugin,
    TAbstractFile,
    TFile,
    Tasks,
    WorkspaceLeaf,
    WorkspaceWindow,
    debounce,
    normalizePath,
} from 'obsidian';
import type { MarkdownFileInfo, PluginManifest } from 'obsidian';

import { ref } from 'vue';
import type { Database } from 'sql.js';
import Replacer from '@/Replacer';
import Process from '@/process/Process';
import { checkInDefaultPath, checkInList, customSnippetPath } from '@/utils/constants';
import { monkeyPatchConsole } from '@/obsidian-hack/obsidian-debug-mobile';
import { EmojiPickerModal, ImageOriginModal, PomodoroReminderModal } from '@/ui/modal';
import { POMODORO_HISTORY_VIEW, PomodoroHistoryView } from '@/ui/view/PomodoroHistoryView';
import { BROWSER_VIEW, BrowserView } from '@/ui/view/BrowserView';
import { codeEmoji } from '@/render/Emoji';
import { toggleCursorEffects, toggleMouseClickEffects } from '@/render/CursorEffects';
import LoggerUtil from '@/utils/logger';
import { getAllFiles, getCleanTitle, getNotePath } from '@/utils/file';
import { getWeather } from '@/utils/weather';
import { getTagsFromTask, getTaskContentFromTask } from '@/utils/common';
import { DBUtil } from '@/utils/db/db';
import { insertAfterHandler } from '@/utils/content';
import { getLocalRandomImg, searchPicture } from '@/utils/genBanner';
import { PomodoroStatus } from '@/utils/pomotodo';
import { AwesomeBrainSettingTab, SETTINGS } from '@/settings';
import { PluginDataIO } from '@/data';
import { eventTypes } from '@/types/types';
import type { ExtApp } from '@/types/types';
import { onCodeMirrorChange, toggleBlast, toggleShake } from '@/render/Blast';
import type { Pomodoro } from '@/schemas/spaces';
import { notifyNtfy } from '@/api';
import '@/main.scss';
import { NotifyUtil } from '@/utils/notify';
import { EditorUtil, EditorUtils } from '@/utils/editor';
import t from '@/i18n';
import { usePomodoroStore, useSystemStore } from '@/stores';
import { UpdateModal } from '@/ui/modal/UpdateModal';

export const OpenUrl = ref('https://baidu.com');
const media = window.matchMedia('(prefers-color-scheme: dark)');
export default class AwesomeBrainManagerPlugin extends Plugin {
    override app: ExtApp;
    pluginDataIO: PluginDataIO;
    private pomodoroHistoryView: PomodoroHistoryView | null;
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
    }

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

    openBrowserHandle(e: CustomEvent) {
        this.openBrowser(e.detail.url);
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
        500,
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
                title: t.menu.setBannerForCurrent,
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
                title: t.menu.planPomodoro,
                icon: 'send',
                clickFn: async (menu: Menu, editor: Editor, info: MarkdownView | MarkdownFileInfo) => {
                    const task = EditorUtils.getCurrentSelection(editor);
                    usePomodoroStore().quickAddPomodoro(task);
                },
            },
            {
                title: t.menu.showPomodoro,
                icon: 'alarm-clock',
                clickFn: async (menu: Menu, editor: Editor, info: MarkdownView | MarkdownFileInfo) => {
                    this.app.workspace.detachLeavesOfType(POMODORO_HISTORY_VIEW);
                    await this.app.workspace.getRightLeaf(false).setViewState({
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

    async customizeEditorPaste(evt: ClipboardEvent, editor: Editor, markdownView: MarkdownView): Promise<void> {
        // LoggerUtil.log('');
    }

    async customizeFileMenu(menu: Menu, file: TAbstractFile, source: string, leaf?: WorkspaceLeaf): Promise<void> {
        menu.addItem(item => {
            item.setTitle(t.menu.setBannerForTheFolder)
                .setIcon('image')
                .onClick(async () => {
                    new ImageOriginModal(this.app, this, file).open();
                });
        });
    }

    async customizeVaultCreate(file: TAbstractFile): Promise<void> {
        // LoggerUtil.log('');
    }

    async customizeVaultModify(file: TAbstractFile): Promise<void> {
        // LoggerUtil.log('');
    }

    async customizeVaultDelete(file: TAbstractFile): Promise<void> {
        // LoggerUtil.log('');
    }

    async customizeVaultRename(file: TAbstractFile, oldPath: string): Promise<void> {
        // LoggerUtil.log('');
    }

    override async onload(): Promise<void> {
        await this.pluginDataIO.load();
        LoggerUtil.init(SETTINGS.debugEnable);
        DBUtil.init(this, () => {
            usePomodoroStore().loadPomodoroData();
            this.startPomodoroTask();
        });
        EditorUtil.init(this);
        NotifyUtil.init(this);
        this.setupUI();
        this.setupCommands();
        if (SETTINGS.enableTwemoji.value) {
            MarkdownPreviewRenderer.registerPostProcessor(this.process.EmojiProcess);
        }
        this.registerMarkdownPostProcessor(codeEmoji);
        this.registerMarkdownCodeBlockProcessor('plantuml', this.process.UMLProcess);
        this.registerMarkdownCodeBlockProcessor('vue', this.process.VueProcess);

        this.app.workspace.onLayoutReady(async () => {
            if (SETTINGS.debugEnable.value) {
                monkeyPatchConsole(this);
            }
            this.watchVault();
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
            id: 'cut-line',
            icon: 'scissors',
            name: t.command['cut-line'],
            callback: () => {
                const editor = this.app.workspace.activeEditor?.editor;
                if (editor) {
                    EditorUtils.cutLine(editor);
                }
            },
        });
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
            await this.app.workspace.getRightLeaf(false).setViewState({
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
        // window.addEventListener('languagechange', () => {
        //     console.log('languagechange event detected!');
        // });
        this.registerDomEvent(activeDocument, 'selectionchange', async (e: MouseEvent) => {
            EditorUtil.changeToolbarPopover(e, SETTINGS.toolbar);
        });
        this.registerDomEvent(activeDocument, 'click', async (e: MouseEvent) => {
            toggleMouseClickEffects(e, SETTINGS.clickString);
        });
        window.addEventListener(eventTypes.openBrowser, this.openBrowserHandle.bind(this));
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
    }
}
