import { around } from 'monkey-around';
import {
    App,
    Editor,
    type EphemeralState,
    type HoverParent,
    ItemView,
    type MarkdownFileInfo,
    MarkdownPreviewRenderer,
    MarkdownPreviewRendererStatic,
    MarkdownView,
    Menu,
    Platform,
    Plugin,
    type PluginManifest,
    PopoverState,
    TAbstractFile,
    TFile,
    Tasks,
    View,
    type ViewState,
    Workspace,
    WorkspaceContainer,
    WorkspaceItem,
    WorkspaceLeaf,
    WorkspaceTabs,
    WorkspaceWindow,
    debounce,
    normalizePath,
    requireApiVersion,
} from 'obsidian';
import { PerWindowComponent, use } from '@ophidian/core';
import { ref } from 'vue';
import type { Database } from 'sql.js';
import interactStatic from '@nothingislost/interactjs';
import type { Scope } from '@interactjs/types';
import { expandEmmetAbbreviation } from './utils/emmet';
import { HoverEditor, type HoverEditorParent, isHoverLeaf, setMouseCoords } from '@/popover';
import { onLinkHover } from '@/onLinkHover';
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
import { minimizeActivePopover, restoreActivePopover, snapActivePopover, snapDirections } from '@/utils/measure';
import { isA } from '@/utils/misc';
import { NotifyUtil } from '@/utils/notify';
import { EditorUtil, EditorUtils } from '@/utils/editor';
import t from '@/i18n';
import { usePomodoroStore, useSystemStore } from '@/stores';
import { UpdateModal } from '@/ui/modal/UpdateModal';

export const OpenUrl = ref('https://baidu.com');
const media = window.matchMedia('(prefers-color-scheme: dark)');

class Interactor extends PerWindowComponent {
    interact = this.createInteractor();
    plugin = this.use(AwesomeBrainManagerPlugin);

    createInteractor() {
        if (this.win === window) return interactStatic;
        const oldScope = (interactStatic as unknown as { scope: Scope }).scope;
        const newScope = new (oldScope.constructor as new () => Scope)();
        const interact = newScope.init(this.win).interactStatic;
        for (const plugin of oldScope._plugins.list) interact.use(plugin);
        return interact;
    }

    onload() {
        this.win.addEventListener('resize', this.plugin.debouncedPopoverReflow);
    }

    onunload() {
        this.win.removeEventListener('resize', this.plugin.debouncedPopoverReflow);
        try {
            this.interact.removeDocument(this.win.document);
        } catch (e) {
            // Sometimes, interact.removeDocument fails when the plugin unloads in 0.14.x:
            // Don't let it stop the plugin from fully unloading
            console.error(e);
        }
    }
}

export default class AwesomeBrainManagerPlugin extends Plugin {
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
    use: any;
    interact: any;

    constructor(app: App, manifest: PluginManifest) {
        super(app, manifest);
        this.app = app;
        this.replacer = new Replacer(this);
        this.process = new Process(this);
        this.pluginDataIO = new PluginDataIO(this);
        this.bindFunction();
        this.use = use.plugin(this);
        this.interact = this.use(Interactor);
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
    }

    debouncedPopoverReflow = debounce(
        () => {
            HoverEditor.activePopovers().forEach(popover => {
                popover.interact?.reflow({ name: 'drag', axis: 'xy' });
            });
        },
        100,
        true,
    );

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

    async customizeCodeMirror(cm: CodeMirror.Editor, view: MarkdownView): Promise<void> {
        // LoggerUtil.log('');
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

    hoverEditorInit() {
        this.registerActivePopoverHandler();
        this.registerFileRenameHandler();
        this.registerContextMenuHandler();
        this.patchUnresolvedGraphNodeHover();
        this.patchWorkspace();
        this.patchQuickSwitcher();
        this.patchWorkspaceLeaf();
        this.patchItemView();
        this.patchMarkdownPreviewRenderer();
    }

    override async onload(): Promise<void> {
        await this.pluginDataIO.load();
        LoggerUtil.init(SETTINGS.debugEnable);
        this.hoverEditorInit();
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
            this.patchSlidingPanes();
            this.patchLinkHover();
            setTimeout(() => {
                // workaround to ensure our plugin shows up properly within Style Settings
                this.app.workspace.trigger('css-change');
            }, 2000);
        });
        await this.migrate();
        this.announceUpdate();
    }

    get activePopovers(): HoverEditor[] {
        return HoverEditor.activePopovers();
    }

    patchWorkspaceLeaf() {
        this.register(
            around(WorkspaceLeaf.prototype, {
                getRoot(old) {
                    return function () {
                        const top = old.call(this);
                        return top.getRoot === this.getRoot ? top : top.getRoot();
                    };
                },
                onResize(old) {
                    return function () {
                        this.view?.onResize();
                    };
                },
                setViewState(old) {
                    return async function (viewState: ViewState, eState?: unknown) {
                        const result = await old.call(this, viewState, eState);
                        // try and catch files that are opened from outside of the
                        // HoverEditor class so that we can update the popover title bar
                        try {
                            const he = HoverEditor.forLeaf(this);
                            if (he) {
                                if (viewState.type) he.hoverEl.setAttribute('data-active-view-type', viewState.type);
                                const titleEl = he.hoverEl.querySelector('.popover-title');
                                if (titleEl) {
                                    titleEl.textContent = this.view?.getDisplayText();
                                    if (this.view?.file?.path) {
                                        titleEl.setAttribute('data-path', this.view.file.path);
                                    } else {
                                        titleEl.removeAttribute('data-path');
                                    }
                                }
                            }
                        } catch {
                            // ignore
                        }
                        return result;
                    };
                },
                setEphemeralState(old) {
                    return function (state: EphemeralState) {
                        old.call(this, state);
                        if (state.focus && this.view?.getViewType() === 'empty') {
                            // Force empty (no-file) view to have focus so dialogs don't reset active pane
                            this.view.contentEl.tabIndex = -1;
                            this.view.contentEl.focus();
                        }
                    };
                },
            }),
        );
        this.register(
            around(WorkspaceItem.prototype, {
                getContainer(old) {
                    return function () {
                        if (!old) return; // 0.14.x doesn't have this
                        if (!this.parentSplit || this instanceof WorkspaceContainer) return old.call(this);
                        return this.parentSplit.getContainer();
                    };
                },
            }),
        );
    }

    patchQuickSwitcher() {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const plugin = this;
        const { QuickSwitcherModal } = this.app.internalPlugins.plugins.switcher.instance;
        const uninstaller = around(QuickSwitcherModal.prototype, {
            open(old) {
                return function () {
                    const result = old.call(this);
                    this.setInstructions([
                        {
                            command: Platform.isMacOS ? 'cmd p' : 'ctrl p',
                            purpose: 'to open in new popover',
                        },
                    ]);
                    this.scope.register(['Mod'], 'p', (event: KeyboardEvent) => {
                        this.close();
                        const item = this.chooser.values[this.chooser.selectedItem];
                        if (!item?.file) return;
                        const newLeaf = plugin.spawnPopover(undefined, () =>
                            this.app.workspace.setActiveLeaf(newLeaf, false, true),
                        );
                        newLeaf.openFile(item.file);
                        return false;
                    });
                    return result;
                };
            },
        });
        this.register(uninstaller);
    }

    patchItemView() {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const plugin = this;
        // Once 0.15.3+ is min. required Obsidian, this can be simplified to View + "onPaneMenu"
        const [cls, method] = View.prototype['onPaneMenu'] ? [View, 'onPaneMenu'] : [ItemView, 'onMoreOptionsMenu'];
        const uninstaller = around(cls.prototype, {
            [method](old: (menu: Menu, ...args: unknown[]) => void) {
                return function (menu: Menu, ...args: unknown[]) {
                    const popover = this.leaf ? HoverEditor.forLeaf(this.leaf) : undefined;
                    if (!popover) {
                        menu.addItem(item => {
                            item.setIcon('popup-open')
                                .setTitle('Open in Hover Editor')
                                .onClick(() => {
                                    const newLeaf = plugin.spawnPopover();
                                    if (this.leaf?.getViewState) newLeaf.setViewState(this.leaf.getViewState());
                                })
                                .setSection?.('open');
                        });
                        menu.addItem(item => {
                            item.setIcon('popup-open')
                                .setTitle('Convert to Hover Editor')
                                .onClick(() => {
                                    plugin.convertLeafToPopover(this.leaf);
                                })
                                .setSection?.('open');
                        });
                    } else {
                        menu.addItem(item => {
                            item.setIcon('popup-open')
                                .setTitle('Dock Hover Editor to workspace')
                                .onClick(() => {
                                    plugin.dockPopoverToWorkspace(this.leaf);
                                })
                                .setSection?.('open');
                        });
                    }
                    return old.call(this, menu, ...args);
                };
            },
        });
        this.register(uninstaller);
    }

    patchMarkdownPreviewRenderer() {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const plugin = this;
        const uninstaller = around(MarkdownPreviewRenderer as MarkdownPreviewRendererStatic, {
            // eslint-disable-next-line @typescript-eslint/ban-types
            registerDomEvents(old: Function) {
                return function (
                    el: HTMLElement,
                    instance: {
                        getFile?(): TFile;
                        hoverParent?: HoverParent;
                        info?: HoverParent & { getFile(): TFile };
                    },
                    ...args: unknown[]
                ) {
                    el?.on('mouseover', '.internal-embed.is-loaded', (event: MouseEvent, targetEl: HTMLElement) => {
                        if (targetEl && SETTINGS.hoverEmbeds.value) {
                            app.workspace.trigger('hover-link', {
                                event: event,
                                source: targetEl.matchParent('.markdown-source-view') ? 'editor' : 'preview',
                                hoverParent: instance.hoverParent ?? instance.info,
                                targetEl: targetEl,
                                linktext: targetEl.getAttribute('src'),
                                sourcePath: (instance.info ?? instance).getFile?.()?.path || '',
                            });
                        }
                    });
                    return old.call(this, el, instance, ...args);
                };
            },
        });
        this.register(uninstaller);
    }

    patchWorkspace() {
        let layoutChanging = false;
        const uninstaller = around(Workspace.prototype, {
            changeLayout(old) {
                return async function (workspace: unknown) {
                    layoutChanging = true;
                    try {
                        // Don't consider hover popovers part of the workspace while it's changing
                        await old.call(this, workspace);
                    } finally {
                        layoutChanging = false;
                    }
                };
            },
            recordHistory(old) {
                return function (leaf: WorkspaceLeaf, pushHistory: boolean, ...args: unknown[]) {
                    const paneReliefLoaded = this.app.plugins.plugins['pane-relief']?._loaded;
                    if (!paneReliefLoaded && isHoverLeaf(leaf)) return;
                    return old.call(this, leaf, pushHistory, ...args);
                };
            },
            iterateLeaves(old) {
                type leafIterator = (item: WorkspaceLeaf) => boolean | void;
                return function (arg1, arg2) {
                    // Fast exit if desired leaf found
                    if (old.call(this, arg1, arg2)) return true;

                    // Handle old/new API parameter swap
                    const cb: leafIterator = (typeof arg1 === 'function' ? arg1 : arg2) as leafIterator;
                    const parent: WorkspaceItem = (typeof arg1 === 'function' ? arg2 : arg1) as WorkspaceItem;

                    if (!parent) return false; // <- during app startup, rootSplit can be null
                    if (layoutChanging) return false; // Don't let HEs close during workspace change

                    // 0.14.x doesn't have WorkspaceContainer; this can just be an instanceof check once 15.x is mandatory:
                    if (
                        parent === app.workspace.rootSplit ||
                        (WorkspaceContainer && parent instanceof WorkspaceContainer)
                    ) {
                        for (const popover of HoverEditor.popoversForWindow((parent as WorkspaceContainer).win)) {
                            // Use old API here for compat w/0.14.x
                            if (old.call(this, cb, popover.rootSplit)) return true;
                        }
                    }
                    return false;
                };
            },
            getDropLocation(old) {
                return function getDropLocation(event: MouseEvent) {
                    for (const popover of HoverEditor.activePopovers()) {
                        const dropLoc = this.recursiveGetTarget(event, popover.rootSplit);
                        if (dropLoc) {
                            if (requireApiVersion && requireApiVersion('0.15.3')) {
                                // getDropLocation's return signature changed in 0.15.3
                                // it now only returns the target
                                return dropLoc;
                            } else {
                                return { target: dropLoc, sidedock: false };
                            }
                        }
                    }
                    return old.call(this, event);
                };
            },
            onDragLeaf(old) {
                return function (event: MouseEvent, leaf: WorkspaceLeaf) {
                    const hoverPopover = HoverEditor.forLeaf(leaf);
                    hoverPopover?.togglePin(true);
                    return old.call(this, event, leaf);
                };
            },
        });
        this.register(uninstaller);
    }

    patchSlidingPanes() {
        const SlidingPanesPlugin = this.app.plugins.plugins['sliding-panes-obsidian']?.constructor;
        if (SlidingPanesPlugin) {
            const uninstaller = around(SlidingPanesPlugin.prototype, {
                // eslint-disable-next-line @typescript-eslint/ban-types
                handleFileOpen(old: Function) {
                    return function (...args: unknown[]) {
                        // sliding panes needs to ignore popover open events or else it freaks out
                        if (isHoverLeaf(this.app.workspace.activeLeaf)) return;
                        return old.call(this, ...args);
                    };
                },
                // eslint-disable-next-line @typescript-eslint/ban-types
                handleLayoutChange(old: Function) {
                    return function (...args: unknown[]) {
                        // sliding panes needs to ignore popovers or else it activates the wrong pane
                        if (isHoverLeaf(this.app.workspace.activeLeaf)) return;
                        return old.call(this, ...args);
                    };
                },
                // eslint-disable-next-line @typescript-eslint/ban-types
                focusActiveLeaf(old: Function) {
                    return function (...args: unknown[]) {
                        // sliding panes tries to add popovers to the root split if we don't exclude them
                        if (isHoverLeaf(this.app.workspace.activeLeaf)) return;
                        return old.call(this, ...args);
                    };
                },
            });
            this.register(uninstaller);
        }
    }

    patchLinkHover() {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const plugin = this;
        const pagePreviewPlugin = this.app.internalPlugins.plugins['page-preview'];
        if (!pagePreviewPlugin.enabled) return;
        const uninstaller = around(pagePreviewPlugin.instance.constructor.prototype, {
            // eslint-disable-next-line @typescript-eslint/ban-types
            onHoverLink(old: Function) {
                return function (options: { event: MouseEvent }, ...args: unknown[]) {
                    if (options && isA(options.event, MouseEvent)) setMouseCoords(options.event);
                    return old.call(this, options, ...args);
                };
            },
            // eslint-disable-next-line @typescript-eslint/ban-types
            onLinkHover(old: Function) {
                return function (
                    parent: HoverEditorParent,
                    targetEl: HTMLElement,
                    linkText: string,
                    path: string,
                    state: EphemeralState,
                    ...args: unknown[]
                ) {
                    onLinkHover(plugin, parent, targetEl, linkText, path, state, ...args);
                };
            },
        });
        this.register(uninstaller);

        // This will recycle the event handlers so that they pick up the patched onLinkHover method
        pagePreviewPlugin.disable();
        pagePreviewPlugin.enable();

        plugin.register(function () {
            if (!pagePreviewPlugin.enabled) return;
            pagePreviewPlugin.disable();
            pagePreviewPlugin.enable();
        });
    }

    registerContextMenuHandler() {
        this.registerEvent(
            this.app.workspace.on(
                'file-menu',
                (menu: Menu, file: TAbstractFile, source: string, leaf?: WorkspaceLeaf) => {
                    const popover = leaf ? HoverEditor.forLeaf(leaf) : undefined;
                    if (file instanceof TFile && !popover && !leaf) {
                        menu.addItem(item => {
                            item.setIcon('popup-open')
                                .setTitle('Open in Hover Editor')
                                .onClick(() => {
                                    const newLeaf = this.spawnPopover();
                                    newLeaf.openFile(file);
                                })
                                .setSection?.('open');
                        });
                    }
                },
            ),
        );
    }

    registerActivePopoverHandler() {
        this.registerEvent(
            this.app.workspace.on('active-leaf-change', leaf => {
                HoverEditor.activePopover?.hoverEl.removeClass('is-active');
                const hoverEditor = (HoverEditor.activePopover = leaf ? HoverEditor.forLeaf(leaf) : undefined);
                if (hoverEditor && leaf) {
                    hoverEditor.hoverEl.addClass('is-active');
                    const titleEl = hoverEditor.hoverEl.querySelector('.popover-title');
                    if (!titleEl) return;
                    titleEl.textContent = leaf.view?.getDisplayText();
                    if (leaf?.view?.getViewType()) {
                        hoverEditor.hoverEl.setAttribute('data-active-view-type', leaf.view.getViewType());
                    }
                    if (leaf.view?.file?.path) {
                        titleEl.setAttribute('data-path', leaf.view.file.path);
                    } else {
                        titleEl.removeAttribute('data-path');
                    }
                }
            }),
        );
    }

    registerFileRenameHandler() {
        this.app.vault.on('rename', (file, oldPath) => {
            HoverEditor.iteratePopoverLeaves(this.app.workspace, leaf => {
                if (file === leaf?.view?.file && file instanceof TFile) {
                    const hoverEditor = HoverEditor.forLeaf(leaf);
                    if (hoverEditor?.hoverEl) {
                        const titleEl = hoverEditor.hoverEl.querySelector('.popover-title');
                        if (!titleEl) return;
                        const filePath = titleEl.getAttribute('data-path');
                        if (oldPath === filePath) {
                            titleEl.textContent = leaf.view?.getDisplayText();
                            titleEl.setAttribute('data-path', file.path);
                        }
                    }
                }
            });
        });
    }

    patchUnresolvedGraphNodeHover() {
        const leaf = new (WorkspaceLeaf as new (app: App) => WorkspaceLeaf)(this.app);
        const view = this.app.internalPlugins.plugins.graph.views.localgraph(leaf);
        const GraphEngine = view.engine.constructor;
        leaf.detach(); // close the view
        view.renderer?.worker?.terminate(); // ensure the worker is terminated
        const uninstall = around(GraphEngine.prototype, {
            // eslint-disable-next-line @typescript-eslint/ban-types
            onNodeHover(old: Function) {
                return function (event: UIEvent, linkText: string, nodeType: string, ...items: unknown[]) {
                    if (nodeType === 'unresolved') {
                        if ((this.onNodeUnhover(), isA(event, MouseEvent))) {
                            if (
                                this.hoverPopover &&
                                this.hoverPopover.state !== PopoverState.Hidden &&
                                this.lastHoverLink === linkText
                            ) {
                                this.hoverPopover.onTarget = true;
                                return void this.hoverPopover.transition();
                            }
                            this.lastHoverLink = linkText;
                            this.app.workspace.trigger('hover-link', {
                                event: event,
                                source: 'graph',
                                hoverParent: this,
                                targetEl: null,
                                linktext: linkText,
                            });
                        }
                    } else {
                        return old.call(this, event, linkText, nodeType, ...items);
                    }
                };
            },
        });
        this.register(uninstall);
        leaf.detach();
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

    convertLeafToPopover(oldLeaf: WorkspaceLeaf) {
        if (!oldLeaf) return;
        const newLeaf = this.spawnPopover(undefined, () => {
            const { parentSplit: newParentSplit } = newLeaf;
            const { parentSplit: oldParentSplit } = oldLeaf;
            oldParentSplit.removeChild(oldLeaf);
            newParentSplit.replaceChild(0, oldLeaf, true);
            this.app.workspace.setActiveLeaf(oldLeaf, false, true);
        });
        return newLeaf;
    }

    dockPopoverToWorkspace(oldLeaf: WorkspaceLeaf) {
        if (!oldLeaf) return;
        oldLeaf.parentSplit.removeChild(oldLeaf);
        const { rootSplit } = this.app.workspace;
        if (requireApiVersion('0.16.3') && rootSplit.children[0] instanceof WorkspaceTabs) {
            rootSplit.children[0].insertChild(-1, oldLeaf);
        } else rootSplit.insertChild(-1, oldLeaf);
        app.workspace.activeLeaf = null; // Force re-activation
        app.workspace.setActiveLeaf(oldLeaf, false, true);
        return oldLeaf;
    }

    spawnPopover(initiatingEl?: HTMLElement, onShowCallback?: () => unknown): WorkspaceLeaf {
        const parent = this.app.workspace.activeLeaf as unknown as HoverEditorParent;
        if (!initiatingEl) initiatingEl = parent.containerEl;
        const hoverPopover = new HoverEditor(parent, initiatingEl!, this, undefined, onShowCallback);
        hoverPopover.togglePin(true);
        return hoverPopover.attachLeaf();
    }

    private setupCommands() {
        this.addCommand({
            id: 'bounce-popovers',
            name: 'Toggle bouncing popovers',
            callback: () => {
                this.activePopovers.forEach(popover => {
                    popover.toggleBounce();
                });
            },
        });
        this.addCommand({
            id: 'open-new-popover',
            name: 'Open new Hover Editor',
            callback: () => {
                // Focus the leaf after it's shown
                const newLeaf = this.spawnPopover(undefined, () =>
                    this.app.workspace.setActiveLeaf(newLeaf, false, true),
                );
            },
        });
        this.addCommand({
            id: 'open-link-in-new-popover',
            name: 'Open link under cursor in new Hover Editor',
            checkCallback: (checking: boolean) => {
                const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
                if (activeView) {
                    if (!checking) {
                        const token = activeView.editor.getClickableTokenAt(activeView.editor.getCursor());
                        if (token?.type === 'internal-link') {
                            const newLeaf = this.spawnPopover(undefined, () =>
                                this.app.workspace.setActiveLeaf(newLeaf, false, true),
                            );
                            newLeaf.openLinkText(token.text, activeView.file.path);
                        }
                    }
                    return true;
                }
                return false;
            },
        });
        this.addCommand({
            id: 'open-current-file-in-new-popover',
            name: 'Open current file in new Hover Editor',
            checkCallback: (checking: boolean) => {
                const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
                if (activeView) {
                    if (!checking) {
                        const newLeaf = this.spawnPopover(undefined, () =>
                            this.app.workspace.setActiveLeaf(newLeaf, false, true),
                        );
                        newLeaf.openFile(activeView.file);
                    }
                    return true;
                }
                return false;
            },
        });
        this.addCommand({
            id: 'convert-active-pane-to-popover',
            name: 'Convert active pane to Hover Editor',
            checkCallback: (checking: boolean) => {
                const { activeLeaf } = this.app.workspace;
                if (activeLeaf) {
                    if (!checking) {
                        this.convertLeafToPopover(activeLeaf);
                    }
                    return true;
                }
                return false;
            },
        });
        this.addCommand({
            id: 'dock-active-popover-to-workspace',
            name: 'Dock active Hover Editor to workspace',
            checkCallback: (checking: boolean) => {
                const { activeLeaf } = this.app.workspace;
                if (activeLeaf && HoverEditor.forLeaf(activeLeaf)) {
                    if (!checking) {
                        this.dockPopoverToWorkspace(activeLeaf);
                    }
                    return true;
                }
                return false;
            },
        });
        this.addCommand({
            id: 'restore-active-popover',
            name: 'Restore active Hover Editor',
            checkCallback: (checking: boolean) => {
                return restoreActivePopover(checking);
            },
        });
        this.addCommand({
            id: 'minimize-active-popover',
            name: 'Minimize active Hover Editor',
            checkCallback: (checking: boolean) => {
                return minimizeActivePopover(checking);
            },
        });
        snapDirections.forEach(direction => {
            this.addCommand({
                id: `snap-active-popover-to-${direction}`,
                name: `Snap active Hover Editor to ${direction}`,
                checkCallback: (checking: boolean) => {
                    return snapActivePopover(direction, checking);
                },
            });
        });
        this.addCommand({
            id: 'open-link-in-new-popover',
            name: 'Open link under cursor in new Hover Editor',
            checkCallback: (checking: boolean) => {
                const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
                if (activeView) {
                    if (!checking) {
                        const token = activeView.editor.getClickableTokenAt(activeView.editor.getCursor());
                        if (token?.type === 'internal-link') {
                            const newLeaf = this.spawnPopover(undefined, () =>
                                this.app.workspace.setActiveLeaf(newLeaf, false, true),
                            );
                            newLeaf.openLinkText(token.text, activeView.file.path);
                        }
                    }
                    return true;
                }
                return false;
            },
        });
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
        this.registerDomEvent(activeDocument, 'selectionchange', async (e: MouseEvent) => {
            EditorUtil.changeToolbarPopover(e, SETTINGS.toolbar);
        });
        this.registerDomEvent(activeDocument, 'click', async (e: MouseEvent) => {
            toggleMouseClickEffects(e, SETTINGS.clickString);
        });
        window.addEventListener(eventTypes.openBrowser, this.openBrowserHandle.bind(this));
        [
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
        HoverEditor.activePopovers().forEach(popover => popover.hide());
        EditorUtil.unload();
        NotifyUtil.onload();
        toggleBlast('0');
        this.app.workspace.detachLeavesOfType(POMODORO_HISTORY_VIEW);
        this.style.detach();
    }
}
