import {
    TAbstractFile,
    Tasks,
    WorkspaceWindow,
    normalizePath,
    request,
    App,
    Editor,
    MarkdownView,
    Menu,
    Notice,
    Plugin,
    TFile,
    WorkspaceLeaf,
    addIcon,
    debounce,
    setIcon,
    MarkdownPreviewRenderer,
} from 'obsidian';
import type { EditorPosition, MarkdownFileInfo, PluginManifest } from 'obsidian';

import Replacer from './Replacer';
import Process from './process/Process';
import { ref } from 'vue';
import moment from 'moment';
import { EditDetector, OneDay, Tag, UndoHistoryInstance } from './types';
import { getAllDailyNotes, getDailyNote, getDailyNoteSettings } from 'obsidian-daily-notes-interface';
import type { Database } from 'sql.js';
import type { EditorState } from '@codemirror/state';
import { lineNumbers } from '@codemirror/view';
import {
    MAX_TIME_SINCE_CREATION,
    checkInDefaultPath,
    checkInList,
    customSnippetPath,
    pomodoroDB,
} from './utils/constants';
import { monkeyPatchConsole } from './obsidian-hack/obsidian-debug-mobile';
import { EmojiPickerModal, ImageOriginModal, PomodoroReminderModal } from './ui/modal/customModals';
import { POMODORO_HISTORY_VIEW, PomodoroHistoryView } from './ui/view/PomodoroHistoryView';
import { BROWSER_VIEW, BrowserView } from './ui/view/BrowserView';
import { codeEmoji } from './render/Emoji';
import { toggleCursorEffects, toggleMouseClickEffects } from './render/CursorEffects';
import { buildTagRules } from './render/Tag';
import { ReminderModal } from './ui/reminder';
import Logger, { initLogger } from './utils/logger';
import { notify } from './utils/request';
import { getAllFiles, getCleanTitle, getNotePath } from './utils/file';
import { getWeather } from './utils/weather';
import { getTagsFromTask, getTaskContentFromTask } from './utils/common';
import {
    dbResultsToDBTables,
    deleteFromDB,
    getDB,
    insertIntoDB,
    saveDBAndKeepAlive,
    selectDB,
    updateDBConditionally,
} from './utils/db/db';
import { insertAfterHandler, setBanner } from './utils/content';
import {
    changeToolbarPopover,
    getEditorPositionFromIndex,
    loadCustomViewContainer,
    unloadCustomViewContainer,
} from './utils/editor';
import { getLocalRandom, searchPicture } from './utils/genBanner';
import { loadSQL } from './utils/db/sqljs';
import { PomodoroStatus, initiateDB } from './utils/promotodo';
import { DATE_TIME_FORMATTER } from './model/time';
import { ReminderSettingTab, SETTINGS } from './settings';
import { Reminder, Reminders } from './model/reminder';
import { PluginDataIO } from './data';
import { RemindersController } from './controller';
import { eventTypes } from './types/types';
import type { ExtApp, ExtTFile } from './types';
import { DocumentDirectionSettings } from './render/DocumentDirection';
import { emojiListPlugin } from './render/EmojiList';
import { onCodeMirrorChange, toggleBlast, toggleShake } from './render/Blast';
import { pomodoroSchema } from './schemas/spaces';
import type { Pomodoro } from './schemas/spaces';
import t from './i18n';
import './main.scss';

export const OpenUrl = ref('https://baidu.com');
const media = window.matchMedia('(prefers-color-scheme: dark)');
export default class AwesomeBrainManagerPlugin extends Plugin {
    override app: ExtApp;
    pluginDataIO: PluginDataIO;
    public docDirSettings = new DocumentDirectionSettings();
    private currentFile: TFile;
    private undoHistory: any[];
    private undoHistoryTime: Date;
    private remindersController: RemindersController;
    private editDetector: EditDetector;
    private reminderModal: ReminderModal;
    private reminders: Reminders;
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
        this.reminders = new Reminders(() => {
            this.pluginDataIO.changed = true;
        });
        this.replacer = new Replacer(this);
        this.process = new Process(this);
        this.undoHistory = [];
        this.undoHistoryTime = new Date();
        this.pluginDataIO = new PluginDataIO(this, this.reminders);
        this.reminders.reminderTime = SETTINGS.reminderTime;
        DATE_TIME_FORMATTER.setTimeFormat(SETTINGS.dateFormat, SETTINGS.dateTimeFormat, SETTINGS.strictDateFormat);
        this.editDetector = new EditDetector(SETTINGS.editDetectionSec);
        this.remindersController = new RemindersController(app.vault, this.reminders);
        this.reminderModal = new ReminderModal(this.app, SETTINGS.useSystemNotification, SETTINGS.laters);
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

    mdbChange(e: any) {
        Logger.log(this, e);
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

    addTag(tag: Tag) {
        if (!tag) return;
        const rules = buildTagRules(tag);
        rules.forEach(rule => this.style.sheet?.insertRule(rule, this.style.sheet.cssRules.length));
        this.updateSnippet();
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

    isDailyNotesEnabled() {
        const dailyNotesPlugin = this.app.internalPlugins.plugins['daily-notes'];
        const dailyNotesEnabled = dailyNotesPlugin && dailyNotesPlugin.enabled;
        const periodicNotesPlugin = this.app.plugins.getPlugin('periodic-notes');
        const periodicNotesEnabled = periodicNotesPlugin && periodicNotesPlugin!.settings?.daily?.enabled;

        return dailyNotesEnabled || periodicNotesEnabled;
    }

    getLastDailyNote(): TFile {
        const { folder = '', format } = getDailyNoteSettings();

        // get all notes in directory that aren't null
        const dailyNoteFiles = this.app.vault
            .getAllLoadedFiles()
            .filter(file => file.path.startsWith(folder))
            .filter(file => (file as ExtTFile).basename != null) as TFile[];

        // remove notes that are from the future
        const todayMoment = moment();
        const dailyNotesTodayOrEarlier: TFile[] = [];
        dailyNoteFiles.forEach(file => {
            if (moment(file.basename, format).isSameOrBefore(todayMoment, 'day')) {
                dailyNotesTodayOrEarlier.push(file);
            }
        });

        // sort by date
        const sorted = dailyNotesTodayOrEarlier.sort(
            (a, b) => moment(b.basename, format).valueOf() - moment(a.basename, format).valueOf(),
        );
        return sorted[1] as TFile;
    }

    async getAllUnfinishedTodos(file: TFile) {
        const contents = await this.app.vault.read(file);
        const unfinishedTodosRegex = /\t*- \[ \].*/g;
        const unfinishedTodos = Array.from(contents.matchAll(unfinishedTodosRegex)).map(([todo]) => todo);

        return unfinishedTodos;
    }

    async sortHeadersIntoHeirarchy(file: TFile) {
        ///Logger.log('testing')
        const templateContents = await this.app.vault.read(file);
        const allHeadings = Array.from(templateContents.matchAll(/#{1,} .*/g)).map(([heading]) => heading);

        if (allHeadings.length > 0) {
            // Logger.log(createRepresentationFromHeadings(allHeadings));
        }
    }

    async sayHello() {
        // await this.remindersController.reloadAllFiles();
        // this.pluginDataIO.scanned.value = true;
        // this.pluginDataIO.save();
        // const expired = this.reminders.getExpiredReminders(SETTINGS.reminderTime.value);
        notify('test', {});
    }

    async rollover(file: TFile | undefined) {
        /*** First we check if the file created is actually a valid daily note ***/
        const { folder = '', format } = getDailyNoteSettings();
        let ignoreCreationTime = false;

        // Rollover can be called, but we need to get the daily file
        if (file == undefined) {
            const allDailyNotes = getAllDailyNotes();
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            file = getDailyNote(moment(), allDailyNotes);
            ignoreCreationTime = true;
        }
        if (!file) return;

        // is a daily note
        if (!file.path.startsWith(folder)) return;

        // is today's daily note
        const today = new Date();
        const todayFormatted = moment(today).format(format);
        if (todayFormatted !== file.basename) return;

        // was just created
        if (today.getTime() - file.stat.ctime > MAX_TIME_SINCE_CREATION && !ignoreCreationTime) return;

        /*** Next, if it is a valid daily note, but we don't have daily notes enabled, we must alert the user ***/
        if (!this.isDailyNotesEnabled()) {
            new Notice(
                'AwesomeBrainManagerPlugin unable to rollover unfinished todos: Please enable Daily Notes, or Periodic Notes (with daily notes enabled).',
                10000,
            );
        } else {
            const { templateHeading, deleteOnComplete, removeEmptyTodos } = SETTINGS;
            // check if there is a daily note from yesterday
            const lastDailyNote = this.getLastDailyNote();
            if (lastDailyNote == null) return;

            // TODO: Rollover to subheadings (optional)
            //this.sortHeadersIntoHeirarchy(lastDailyNote)

            // get unfinished todos from yesterday, if exist
            const todos_yesterday = await this.getAllUnfinishedTodos(lastDailyNote);
            if (todos_yesterday.length == 0) {
                Logger.log(`rollover-daily-todos: 0 todos found in ${lastDailyNote.basename}.md`);
                return;
            }

            // Potentially filter todos from yesterday for today
            let todosAdded = 0;
            let emptiesToNotAddToTomorrow = 0;
            const todos_today = !removeEmptyTodos.value ? todos_yesterday : [];
            if (removeEmptyTodos.value) {
                todos_yesterday.forEach((line, i) => {
                    const trimmedLine = (line || '').trim();
                    if (trimmedLine != '- [ ]' && trimmedLine != '- [  ]') {
                        todos_today.push(line);
                        todosAdded++;
                    } else {
                        emptiesToNotAddToTomorrow++;
                    }
                });
            } else {
                todosAdded = todos_yesterday.length;
            }

            // get today's content and modify it
            let templateHeadingNotFoundMessage = '';
            const templateHeadingSelected = templateHeading.value !== 'none';
            let today!: OneDay;
            if (todos_today.length > 0) {
                let dailyNoteContent = await this.app.vault.read(file);
                today = new OneDay(file, `${dailyNoteContent}`);
                const todos_todayString = `\n${todos_today.join('\n')}`;

                // If template heading is selected, try to rollover to template heading
                if (templateHeadingSelected) {
                    const contentAddedToHeading = dailyNoteContent.replace(
                        templateHeading.value,
                        `${templateHeading.value}${todos_todayString}`,
                    );
                    if (contentAddedToHeading == dailyNoteContent) {
                        templateHeadingNotFoundMessage = `Rollover couldn't find '${templateHeading.value}' in today's daily not. Rolling todos to end of file.`;
                    } else {
                        dailyNoteContent = contentAddedToHeading;
                    }
                }

                // Rollover to bottom of file if no heading found in file, or no heading selected
                if (!templateHeadingSelected || templateHeadingNotFoundMessage.length > 0) {
                    dailyNoteContent += todos_todayString;
                }

                await this.app.vault.modify(file, dailyNoteContent);
            }

            let previousDay!: OneDay;
            // if deleteOnComplete, get yesterday's content and modify it
            if (deleteOnComplete.value) {
                const lastDailyNoteContent = await this.app.vault.read(lastDailyNote);
                previousDay = new OneDay(lastDailyNote, `${lastDailyNoteContent}`);
                const lines = lastDailyNoteContent.split('\n');

                for (let i = lines.length; i >= 0; i--) {
                    if (todos_yesterday.includes(lines[i])) {
                        lines.splice(i, 1);
                    }
                }

                const modifiedContent = lines.join('\n');
                await this.app.vault.modify(lastDailyNote, modifiedContent);
            }

            // Let user know rollover has been successful with X todos
            const todosAddedString =
                todosAdded == 0 ? '' : `- ${todosAdded} todo${todosAdded > 1 ? 's' : ''} rolled over.`;
            const emptiesToNotAddToTomorrowString =
                emptiesToNotAddToTomorrow == 0
                    ? ''
                    : deleteOnComplete.value
                    ? `- ${emptiesToNotAddToTomorrow} empty todo${emptiesToNotAddToTomorrow > 1 ? 's' : ''} removed.`
                    : '';
            const part1 = templateHeadingNotFoundMessage.length > 0 ? `${templateHeadingNotFoundMessage}` : '';
            const part2 = `${todosAddedString}${todosAddedString.length > 0 ? ' ' : ''}`;
            const part3 = `${emptiesToNotAddToTomorrowString}${emptiesToNotAddToTomorrowString.length > 0 ? ' ' : ''}`;

            const allParts = [part1, part2, part3];
            const nonBlankLines: string[] = [];
            allParts.forEach(part => {
                if (part.length > 0) {
                    nonBlankLines.push(part);
                }
            });

            const message = nonBlankLines.join('\n');
            if (message.length > 0) {
                new Notice(message, 4000 + message.length * 3);
            }
            this.undoHistoryTime = new Date();
            this.undoHistory = [new UndoHistoryInstance(previousDay, today)];
        }
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
                    // Logger.info('百度');
                    // @ts-ignore
                    // const cookies = window.electron.remote.session.defaultSession.cookies;
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

    async customizeEditorPaste(evt: ClipboardEvent, editor: Editor, markdownView: MarkdownView): Promise<void> {
        return;
        // const clipboardText = evt.clipboardData?.getData('text/plain');
        // if (!clipboardText) return;

        // Logger.warn(evt);
        // Logger.dir(evt.clipboardData?.files);
        // Logger.warn(clipboardText);
        // evt.clipboardData?.setDragImage
        // await evt.clipboardData?.setData('text/plain', 'Hello, world!');
        // evt.stopPropagation();
        // evt.preventDefault();

        // let newLine = clipboardText;
        // const text = editor.getValue();
        // const oldLine = editor.getLine(editor.getCursor().line);
        // if (oldLine.trimStart().startsWith('- [ ]') || newLine.trimStart().startsWith('- [ ]')) {
        //     const reg = /(\s*- \[ \]\s?)+/;
        //     newLine = newLine.replace(reg, '');
        // }
        // const start = text.indexOf(clipboardText);
        // if (start < 0) {
        //     Logger.log(`Unable to find text "${clipboardText}" in current editor`);
        // } else {
        //     const end = start + clipboardText.length;
        //     const startPos = AwesomeBrainManagerPlugin.getEditorPositionFromIndex(text, start);
        //     const endPos = AwesomeBrainManagerPlugin.getEditorPositionFromIndex(text, end);
        //     editor.replaceRange(newLine, startPos, endPos);
        //     return;
        // }
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
        // TODO 增加开关，决定是否自动rollover
        // this.rollover(file as TFile);
    }

    async customizeVaultModify(file: TAbstractFile): Promise<void> {
        this.remindersController.reloadFile(file, true);
    }

    async customizeVaultDelete(file: TAbstractFile): Promise<void> {
        const { format } = getDailyNoteSettings();
        const today = new Date();
        const todayFormatted = moment(today).format(format);
        if (
            file.name == todayFormatted + '.md' &&
            this.app.commands.commands['obsidian-day-planner:app:unlink-day-planner-from-note']
        ) {
            this.app.commands.executeCommandById('obsidian-day-planner:app:unlink-day-planner-from-note');
        }
        this.remindersController.removeFile(file.path);
    }

    async customizeVaultRename(file: TAbstractFile, oldPath: string): Promise<void> {
        // We only reload the file if it CAN be deleted, otherwise this can
        // cause crashes.
        if (await this.remindersController.removeFile(oldPath)) {
            // We need to do the reload synchronously so as to avoid racing.
            await this.remindersController.reloadFile(file);
        }
    }

    override async onload(): Promise<void> {
        await this.pluginDataIO.load();
        this.setupUI();
        this.setupCommands();
        MarkdownPreviewRenderer.registerPostProcessor(this.process.EmojiProcess);
        this.registerMarkdownPostProcessor(codeEmoji);
        this.registerMarkdownCodeBlockProcessor('plantuml', this.process.UMLProcess);
        this.registerMarkdownCodeBlockProcessor('vue', this.process.VueProcess);

        this.spacesDBPath = normalizePath(app.vault.configDir + '/plugins/awesome-brain-manager/ObsidianManager.mdb');
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
            // this.startPeriodicTask();
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

    private startPeriodicTask() {
        let intervalTaskRunning = true;
        // Force the view to refresh as soon as possible.
        this.periodicTask().finally(() => {
            intervalTaskRunning = false;
        });

        // Set up the recurring check for reminders.
        this.registerInterval(
            window.setInterval(() => {
                if (intervalTaskRunning) {
                    Logger.log('Skip reminder interval task because task is already running.');
                    return;
                }
                intervalTaskRunning = true;
                this.periodicTask().finally(() => {
                    intervalTaskRunning = false;
                });
            }, SETTINGS.reminderCheckIntervalSec.value * 1000),
        );
    }

    private async periodicTask(): Promise<void> {
        if (!this.pluginDataIO.scanned.value) {
            this.remindersController.reloadAllFiles().then(() => {
                this.pluginDataIO.scanned.value = true;
                this.pluginDataIO.save();
            });
        }

        this.pluginDataIO.save(false);

        if (this.editDetector.isEditing()) {
            return;
        }
        const expired = this.reminders.getExpiredReminders(SETTINGS.reminderTime.value);

        let previousReminder: Reminder | undefined = undefined;
        for (const reminder of expired) {
            if (this.app.workspace.layoutReady) {
                if (reminder.muteNotification) {
                    // We don't want to set `previousReminder` in this case as the current
                    // reminder won't be shown.
                    continue;
                }
                if (previousReminder) {
                    while (previousReminder.beingDisplayed) {
                        // Displaying too many reminders at once can cause crashes on
                        // mobile. We use `beingDisplayed` to wait for the current modal to
                        // be dismissed before displaying the next.
                        await this.sleep(100);
                    }
                }
                this.showReminder(reminder);
                Logger.log(reminder);
                previousReminder = reminder;
            }
        }
    }

    /* An asynchronous sleep function. To use it you must `await` as it hands
     * off control to other portions of the JS control loop whilst waiting.
     *
     * @param milliseconds - The number of milliseconds to wait before resuming.
     */
    private async sleep(milliseconds: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, milliseconds));
    }

    private showReminder(reminder: Reminder) {
        reminder.muteNotification = true;
        this.reminderModal.show(
            reminder,
            time => {
                Logger.info('Remind me later: time=%o', time);
                reminder.time = time;
                reminder.muteNotification = false;
                this.remindersController.updateReminder(reminder, false);
                this.pluginDataIO.save(true);
            },
            () => {
                Logger.info('done');
                reminder.muteNotification = false;
                this.remindersController.updateReminder(reminder, true);
                this.reminders.removeReminder(reminder);
                this.pluginDataIO.save(true);
            },
            () => {
                Logger.info('Mute');
                reminder.muteNotification = true;
            },
            () => {
                Logger.info('Open');
                this.openReminderFile(reminder);
            },
        );
    }

    private async openReminderFile(reminder: Reminder) {
        const leaf = this.app.workspace.getUnpinnedLeaf();
        await this.remindersController.openReminder(reminder, leaf);
    }

    private async addACheck(path, filename, time, content) {
        const normalizedPath = await getNotePath(path, filename);
        const todayMoment = moment();
        const fileContents = await app.vault.adapter.read(normalizedPath);
        const newFileContent = await insertAfterHandler(
            '## 打卡',
            `- [ ] ${time} ${content} ⏳ ${todayMoment.format('YYYY-MM-DD')}`,
            fileContents,
        );
        await app.vault.adapter.write(normalizedPath, newFileContent.content);
    }

    private async removeACheck(path, filename, time, content) {
        const normalizedPath = await getNotePath(path, filename);
        const todayMoment = moment();
        const fileContents = await app.vault.adapter.read(normalizedPath);
        const originalLine = `- [ ] ${time} ${content} ⏳ ${todayMoment.format('YYYY-MM-DD')}`;
        const newContent = fileContents.replace(originalLine, '');
        await app.vault.adapter.write(normalizedPath, newContent);
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
        getLocalRandom,
        getWeather,
    };

    async setRandomBanner(path: TAbstractFile | null, origin: string): Promise<void> {
        // const ignorePath = ['Journal', 'Reading', 'MyObsidian', 'Archive'];
        const ignorePath = [];
        // FIXME 找到并使用更高性能api this.app.vault.getMarkdownFiles();
        const allFilePathNeededHandle: TFile[] = await getAllFiles(path, ignorePath, ['md'], []);
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
                await setBanner(file.path, banner, newBanner);
            }
        });
    }

    private setupCommands() {
        this.addCommand({
            id: 'awesome-brain-manager-check-in',
            name: t.command['awesome-brain-manager-check-in'],
            callback: () => {
                this.habitCheckIn();
            },
        });

        this.addCommand({
            id: 'awesome-brain-manager-remove-check-in',
            name: t.command['awesome-brain-manager-remove-check-in'],
            callback: () => {
                this.removeHabitCheckIn();
            },
        });

        this.addCommand({
            id: 'query-openai',
            name: 'Query openAI',
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
            id: 'awesome-brain-manager-rollover',
            name: t.command['awesome-brain-manager-rollover'],
            callback: () => this.rollover(undefined),
        });

        this.addCommand({
            id: 'awesome-brain-manager-undo',
            name: t.command['awesome-brain-manager-undo'],
            // 带条件的指令
            checkCallback: checking => {
                // no history, don't allow undo
                if (this.undoHistory.length > 0) {
                    const now = moment();
                    const lastUse = moment(this.undoHistoryTime);
                    const diff = now.diff(lastUse, 'seconds');
                    // 2+ mins since use: don't allow undo
                    if (diff > 2 * 60) {
                        return false;
                    }
                    // if (!checking) {
                    // 	new UndoModal(this).open();
                    // }
                    return true;
                }
                return false;
            },
        });

        this.addCommand({
            id: 'awesome-brain-manager:open-emoji-picker',
            name: t.command['awesome-brain-manager:open-emoji-picker'],
            // 带条件的指令
            checkCallback: (checking: boolean) => {
                const leaf = this.app.workspace.activeLeaf;
                if (leaf) {
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

    toggleDocumentDirection() {
        const newDirection = this.getDocumentDirection() === 'ltr' ? 'rtl' : 'ltr';
        this.setDocumentDirection(newDirection);
        if (this.docDirSettings.rememberPerFile && this.currentFile && this.currentFile.path) {
            this.docDirSettings.fileDirections[this.currentFile.path] = newDirection;
        }
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

    getDocumentDirection() {
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!view) return t.info.unknown;
        const rtlEditors = view.contentEl.getElementsByClassName('is-rtl');
        if (rtlEditors.length > 0) return 'rtl';
        else return 'ltr';
    }

    setDocumentDirection(newDirection: string) {
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!view || !view?.editor) return;

        const editorDivs = view.contentEl.getElementsByClassName('cm-editor');
        for (const editorDiv of editorDivs) {
            if (editorDiv instanceof HTMLDivElement) this.setDocumentDirectionForEditorDiv(editorDiv, newDirection);
        }
        const markdownPreviews = view.contentEl.getElementsByClassName('markdown-preview-view');
        for (const preview of markdownPreviews) {
            if (preview instanceof HTMLDivElement) this.setDocumentDirectionForReadingDiv(preview, newDirection);
        }

        // --- General global fixes ---

        // Fix list indentation problems in RTL
        this.replacePageStyleByString(
            'List indent fix',
            '/* List indent fix */ .is-rtl .HyperMD-list-line { text-indent: 0px !important; }',
            true,
        );
        this.replacePageStyleByString(
            'CodeMirror-rtl pre',
            '.CodeMirror-rtl pre { text-indent: 0px !important; }',
            true,
        );

        // Embedded backlinks should always be shown as LTR
        this.replacePageStyleByString(
            'Embedded links always LTR',
            '/* Embedded links always LTR */ .embedded-backlinks { direction: ltr; }',
            true,
        );

        // Fold indicator fix (not perfect yet -- it can't be clicked)
        this.replacePageStyleByString(
            'Fold symbol fix',
            '/* Fold symbol fix*/ .is-rtl .cm-fold-indicator { right: -15px !important; }',
            true,
        );

        if (this.docDirSettings.setNoteTitleDirection) {
            const container = view.containerEl.parentElement;
            const header = container?.getElementsByClassName(
                'view-header-title-container',
            ) as HTMLCollectionOf<Element>;
            (header[0] as HTMLDivElement).style.direction = newDirection;
        }

        view.editor.refresh();

        // Set the *currently active* export direction. This is global and changes every time the user
        // switches a pane
        this.setExportDirection(newDirection);
    }

    setDocumentDirectionForEditorDiv(editorDiv: HTMLDivElement, newDirection: string) {
        editorDiv.style.direction = newDirection;
        if (newDirection === 'rtl') {
            editorDiv.parentElement?.classList.add('is-rtl');
        } else {
            editorDiv.parentElement?.classList.remove('is-rtl');
        }
    }

    setDocumentDirectionForReadingDiv(readingDiv: HTMLDivElement, newDirection: string) {
        readingDiv.style.direction = newDirection;
        // Although Obsidian doesn't care about is-rtl in Markdown preview, we use it below for some more formatting
        if (newDirection === 'rtl') readingDiv.classList.add('is-rtl');
        else readingDiv.classList.remove('is-rtl');
        if (this.docDirSettings.setYamlDirection)
            this.replacePageStyleByString(
                'Patch YAML',
                '/* Patch YAML RTL */ .is-rtl .language-yaml code { text-align: right; }',
                true,
            );
    }

    setExportDirection(newDirection: string) {
        this.replacePageStyleByString(
            'searched and replaced',
            `/* This is searched and replaced by the plugin */ @media print { body { direction: ${newDirection}; } }`,
            false,
        );
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
        // this.registerEditorExtension(lineNumbers({ formatNumber: (lineNo: number, state: EditorState) => '' }));
        // this.registerEditorExtension(emojiListPlugin);
        toggleMouseClickEffects(SETTINGS.clickString);
        toggleBlast(SETTINGS.powerMode.value);
        toggleShake(SETTINGS.shakeMode);
        toggleCursorEffects(SETTINGS.cursorEffect.value);
        // 状态栏图标
        const obsidianManagerDocumentDirectionDirStatusBar = this.addStatusBarItem();
        obsidianManagerDocumentDirectionDirStatusBar.setText('📄:' + this.getDocumentDirection().toUpperCase());
        obsidianManagerDocumentDirectionDirStatusBar.onClickEvent(evt => {
            this.toggleDocumentDirection();
            obsidianManagerDocumentDirectionDirStatusBar.setText('📄:' + this.getDocumentDirection().toUpperCase());
        });

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
        // setIcon(obsidianManagerDocumentDirectionDirStatusBar, 'swords');
        // 自定义图标
        // addIcon('circle', '<circle cx="50" cy="50" r="50" fill="currentColor" />');
        // 设置选项卡
        this.addSettingTab(new ReminderSettingTab(this.app, this, this.pluginDataIO));
        this.registerView(POMODORO_HISTORY_VIEW, leaf => new PomodoroHistoryView(leaf, this));
        this.registerView(BROWSER_VIEW, leaf => new BrowserView(leaf, this, OpenUrl));

        // ⏱️🌱🚬⚠️🚀🏳️🏴🚩🚧🛞🧭🎲🔧📏📐✂️📌
        this.addTag(new Tag('white', '#ac6700', 'inprogress', ' 🕯️', "'Lucida Handwriting', 'Segoe UI Emoji'"));
        this.addTag(new Tag('white', '#bd1919', 'important', ' ', ''));
        this.addTag(new Tag('white', '#565656d8', 'ideas', ' 💡', ''));
        this.addTag(new Tag('white', '#6640ae', 'questions', ' ❓', ''));
        this.addTag(new Tag('white', '#058c1c', 'complete', ' ', ''));
        this.addTag(new Tag('red', '#ffb6b9', 'principle', ' 📌', ''));
        this.addTag(new Tag('white', '#323232', 'abandon', ' 🏁', ''));
        this.addTag(new Tag('white', '#eaffd0', 'review', ' 🌱', ''));
        this.addTag(new Tag('white', '#eaffd0', 'flashcards', ' 🌱', ''));
        this.addTag(new Tag('white', '#a6e3e9', 'juck', ' 👨‍💻', ''));
        this.addTag(new Tag('white', '#a6e3e9', 'juckz', ' 👨‍💻', ''));

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
        loadCustomViewContainer(this);
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
            changeToolbarPopover(this.app, e, SETTINGS.toolbar);
        });
        window.addEventListener(eventTypes.pomodoroChange, this.pomodoroChange.bind(this));
        window.addEventListener(eventTypes.mdbChange, this.mdbChange.bind(this));
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
        unloadCustomViewContainer();
        toggleBlast('0');
        this.app.workspace.detachLeavesOfType(POMODORO_HISTORY_VIEW);
        this.style.detach();
    }
}
