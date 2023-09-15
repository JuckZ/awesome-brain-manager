// https://github.com/uphy/obsidian-reminder/blob/master/src/settings.ts
import { App, Plugin, PluginSettingTab } from 'obsidian';
import { RawSerde, type SettingModel, SettingTabModel } from '@/model/settings';
import { toggleCursorEffects } from '@/render/CursorEffects';
import { toggleBlast } from '@/render/Blast';
import t from '@/i18n';
import { EditorUtil } from '@/utils/editor';
import type { PluginDataIO } from '@/data';

class Settings {
    settings: SettingTabModel = new SettingTabModel();

    cursorEffectBuilder: any;
    powerModeBuilder: any;

    cursorEffect: SettingModel<string, string>;
    powerMode: SettingModel<string, string>;
    shakeMode: SettingModel<boolean, boolean>;
    toolbar: SettingModel<boolean, boolean>;
    expectedTime: SettingModel<string, string>;
    clickString: SettingModel<string, string>;
    customTag: SettingModel<string, string>;
    debugEnable: SettingModel<boolean, boolean>;
    serverHost: SettingModel<string, string>;
    systemNoticeEnable: SettingModel<boolean, boolean>;
    noticeAudio: SettingModel<string, string>;
    ntfyServerHost: SettingModel<string, string>;
    ntfyToken: SettingModel<string, string>;
    qweatherApiKey: SettingModel<string, string>;
    version: SettingModel<string, string>;
    enableTwemoji: SettingModel<boolean, boolean>;
    defaultMode: SettingModel<string, string>;
    triggerDelay: SettingModel<number, number>;
    closeDelay: SettingModel<number, number>;
    autoPin: SettingModel<string, string>;
    rollDown: SettingModel<boolean, boolean>;
    imageZoom: SettingModel<boolean, boolean>;
    autoFocus: SettingModel<boolean, boolean>;
    snapToEdges: SettingModel<boolean, boolean>;
    initialHeight: SettingModel<string, string>;
    initialWidth: SettingModel<string, string>;
    showViewHeader: SettingModel<boolean, boolean>;
    hoverEmbeds: SettingModel<boolean, boolean>;

    constructor() {
        this.defaultMode = this.settings
            .newSettingBuilder()
            .key('defaultMode')
            .name(t.setting.defaultMode.name)
            .desc(t.setting.defaultMode.desc)
            .dropdown('preview')
            .build(new RawSerde());

        this.autoPin = this.settings
            .newSettingBuilder()
            .key('autoPin')
            .name(t.setting.autoPin.name)
            .desc(t.setting.autoPin.desc)
            .text('onMove')
            .build(new RawSerde());

        this.triggerDelay = this.settings
            .newSettingBuilder()
            .key('triggerDelay')
            .name(t.setting.triggerDelay.name)
            .desc(t.setting.triggerDelay.desc)
            .number(300)
            .build(new RawSerde());

        this.closeDelay = this.settings
            .newSettingBuilder()
            .key('closeDelay')
            .name(t.setting.closeDelay.name)
            .desc(t.setting.closeDelay.desc)
            .number(600)
            .build(new RawSerde());

        this.autoFocus = this.settings
            .newSettingBuilder()
            .key('autoFocus')
            .name(t.setting.autoFocus.name)
            .desc(t.setting.autoFocus.desc)
            .toggle(true)
            .build(new RawSerde());

        this.rollDown = this.settings
            .newSettingBuilder()
            .key('rollDown')
            .name(t.setting.rollDown.name)
            .desc(t.setting.rollDown.desc)
            .toggle(false)
            .build(new RawSerde());

        this.snapToEdges = this.settings
            .newSettingBuilder()
            .key('snapToEdges')
            .name(t.setting.snapToEdges.name)
            .desc(t.setting.snapToEdges.desc)
            .toggle(false)
            .build(new RawSerde());

        this.initialHeight = this.settings
            .newSettingBuilder()
            .key('initialHeight')
            .name(t.setting.initialHeight.name)
            .desc(t.setting.initialHeight.desc)
            .text('340px')
            .build(new RawSerde());

        this.initialWidth = this.settings
            .newSettingBuilder()
            .key('initialWidth')
            .name(t.setting.initialWidth.name)
            .desc(t.setting.initialWidth.desc)
            .text('400px')
            .build(new RawSerde());

        this.cursorEffectBuilder = this.settings
            .newSettingBuilder()
            .key('cursorEffect')
            .name(t.setting.cursorEffect.name)
            .desc(t.setting.cursorEffect.desc)
            .dropdown('none');

        this.showViewHeader = this.settings
            .newSettingBuilder()
            .key('showViewHeader')
            .name(t.setting.showViewHeader.name)
            .desc(t.setting.showViewHeader.desc)
            .toggle(true)
            .build(new RawSerde());

        this.imageZoom = this.settings
            .newSettingBuilder()
            .key('imageZoom')
            .name(t.setting.imageZoom.name)
            .desc(t.setting.imageZoom.desc)
            .toggle(true)
            .build(new RawSerde());

        this.hoverEmbeds = this.settings
            .newSettingBuilder()
            .key('hoverEmbeds')
            .name(t.setting.hoverEmbeds.name)
            .desc(t.setting.hoverEmbeds.desc)
            .toggle(false)
            .build(new RawSerde());

        Object.keys(t.info.effects).forEach(f => this.cursorEffectBuilder.addOption(`${t.info.effects[f]}`, f));

        this.cursorEffect = this.cursorEffectBuilder
            .onAnyValueChanged(context => {
                toggleCursorEffects(SETTINGS.cursorEffect.value);
            })
            .build(new RawSerde());

        this.powerModeBuilder = this.settings
            .newSettingBuilder()
            .key('powerMode')
            .name(t.setting.powerMode.name)
            .desc(t.setting.powerMode.desc)
            .dropdown('0');
        Object.keys(t.info.powerMode).forEach(f => {
            this.powerModeBuilder.addOption(t.info.powerMode[f], f);
        });
        this.powerMode = this.powerModeBuilder
            .onAnyValueChanged(context => {
                toggleBlast(SETTINGS.powerMode.value);
            })
            .build(new RawSerde());

        this.shakeMode = this.settings
            .newSettingBuilder()
            .key('shakeMode')
            .name(t.setting.shakeMode.name)
            .desc(t.setting.shakeMode.desc)
            .toggle(false)
            .build(new RawSerde());

        this.expectedTime = this.settings
            .newSettingBuilder()
            .key('expectedTime')
            .name(t.setting.expectedTime.name)
            .desc(t.setting.expectedTime.desc)
            .text('25')
            .build(new RawSerde());

        this.clickString = this.settings
            .newSettingBuilder()
            .key('clickString')
            .name('Show something on click')
            .desc('Something you want to show when mousekey down, separated by commas')
            .text('')
            .build(new RawSerde());

        // ⏱️🌱🚬⚠️🚀🏳️🏴🚩🚧🛞🧭🎲🔧📏📐✂️📌⚒️🛠️📬📥🐞
        const defaultTag = [
            ['white', '#ac6700', 'inprogress', ' 🕯️', "'Lucida Handwriting', 'Segoe UI Emoji'"],
            ['white', '#bd1919', 'important', ' ', ''],
            ['white', '#565656d8', 'ideas', ' 💡', ''],
            ['white', '#6640ae', 'questions', ' ❓', ''],
            ['white', '#058c1c', 'complete', ' ', ''],
            ['red', '#ffb6b9', 'principle', ' 📌', ''],
            ['white', '#323232', 'abandon', ' 🏁', ''],
            ['white', '#b5dc8e', 'review', ' 🌱', ''],
            ['white', '#b5dc8e', 'flashcards', ' 🌱', ''],
            ['white', '#a6e3e9', 'juck', ' 👨‍💻', ''],
            ['white', '#a6e3e9', 'juckz', ' 👨‍💻', ''],
            ['white', '#a6e3e9', 'todo', ' 📥', ''],
            ['white', '#e23e57', 'bug', ' 🐛', ''],
            ['white', '#f9ed69', 'fixme', ' 🛠️', ''],
        ];
        this.customTag = this.settings
            .newSettingBuilder()
            .key('customTag')
            .name('Custom Tag')
            .desc('Customized label configuration')
            .text(JSON.stringify(defaultTag))
            .onAnyValueChanged(context => {
                EditorUtil.addTags(JSON.parse(SETTINGS.customTag.value));
            })
            .build(new RawSerde());

        this.toolbar = this.settings
            .newSettingBuilder()
            .key('toolbar')
            .name(t.setting.toolbar.name)
            .desc(t.setting.toolbar.desc)
            .toggle(false)
            .build(new RawSerde());

        this.enableTwemoji = this.settings
            .newSettingBuilder()
            .key('enableTwemoji')
            .name(t.setting.enableTwemoji.name)
            .desc(t.setting.enableTwemoji.desc)
            .toggle(false)
            .build(new RawSerde());

        this.debugEnable = this.settings
            .newSettingBuilder()
            .key('debugEnable')
            .name('Enable debug')
            .desc('If you set this value as true, your will see debug info in console.')
            .toggle(false)
            .build(new RawSerde());

        this.serverHost = this.settings
            .newSettingBuilder()
            .key('serverHost')
            .name('Server Host')
            .desc('input your server address')
            .text('https://vercel.ihave.cool')
            .build(new RawSerde());

        this.systemNoticeEnable = this.settings
            .newSettingBuilder()
            .key('systemNoticeEnable')
            .name('Enable systemNotice')
            .desc('Enable systemNotice?')
            .toggle(false)
            .build(new RawSerde());

        const ding =
            'https://cdn.freesound.org/sounds/573/573381-7411b311-d148-41f2-8812-7572170a00b6?filename=573381__ammaro__ding.wav';
        // const roraUrl = 'https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3'
        this.noticeAudio = this.settings
            .newSettingBuilder()
            .key('noticeAudio')
            .name('Notice Audio')
            .desc('input your notice voice url, or mute if the fill value is empty')
            .text(ding)
            .build(new RawSerde());

        this.ntfyServerHost = this.settings
            .newSettingBuilder()
            .key('ntfyServerHost')
            .name('Ntfy Server Host')
            .desc(
                'Change value to your ntfy server address, or use the ntfy official address https://ntfy.sh/change_to_your_topic_name, or disable if empty. Notice: Please learn how to use it from official documents to ensure information security!!!',
            )
            .text('')
            .build(new RawSerde());

        this.ntfyToken = this.settings
            .newSettingBuilder()
            .key('ntfyToken')
            .name('Ntfy Token')
            .desc('input your ntfy token')
            .text('')
            .build(new RawSerde());

        this.qweatherApiKey = this.settings
            .newSettingBuilder()
            .key('qweatherApiKey')
            .name('Qweather ApiKey')
            .desc('input your ApiKey from https://dev.qweather.com/')
            .text('')
            .build(new RawSerde());

        this.version = this.settings
            .newSettingBuilder()
            .key('version')
            .name('last version')
            .desc('record last version, do not change it!')
            .text('1.8.0')
            .build(new RawSerde());

        this.settings
            .newGroup(t.setting.title.effects)
            .addSettings(this.cursorEffect, this.clickString, this.customTag, this.powerMode, this.shakeMode);

        this.settings.newGroup(t.setting.title.pomodoro).addSettings(this.expectedTime);

        this.settings.newGroup(t.setting.title.tools).addSettings(this.toolbar, this.enableTwemoji);

        this.settings
            .newGroup('Notification')
            .addSettings(
                this.systemNoticeEnable,
                this.noticeAudio,
                this.ntfyServerHost,
                this.ntfyToken,
                this.qweatherApiKey,
            );
        this.settings.newGroup('Advanced').addSettings(this.serverHost, this.debugEnable, this.version);
    }

    public forEach(consumer: (setting: SettingModel<any, any>) => void) {
        this.settings.forEach(consumer);
    }
}

export const SETTINGS = new Settings();

export class AwesomeBrainSettingTab extends PluginSettingTab {
    constructor(
        app: App,
        plugin: Plugin,
        protected pluginData: PluginDataIO,
    ) {
        super(app, plugin);
    }

    async display(): Promise<void> {
        const { containerEl } = this;
        SETTINGS.settings.displayOn(containerEl);
    }

    override hide() {
        this.pluginData.save();
    }
}
