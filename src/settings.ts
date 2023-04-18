// https://github.com/uphy/obsidian-reminder/blob/master/src/settings.ts
import { App, PluginSettingTab, Plugin_2 } from 'obsidian';
import type { SettingModel } from './model/settings';
import { RawSerde, SettingTabModel } from './model/settings';
import type { PluginDataIO } from './data';
import { toggleCursorEffects } from './render/CursorEffects';
import { toggleBlast } from './render/Blast';
import t from './i18n';
import { EditorUtil } from './utils/editor';

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
    version: SettingModel<string, string>;
    enableTwemoji: SettingModel<boolean, boolean>;

    constructor() {
        this.cursorEffectBuilder = this.settings
            .newSettingBuilder()
            .key('cursorEffect')
            .name(t.setting.cursorEffect.name)
            .desc(t.setting.cursorEffect.desc)
            .dropdown('none');

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
            ['white', '#eaffd0', 'review', ' 🌱', ''],
            ['white', '#eaffd0', 'flashcards', ' 🌱', ''],
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
            .addSettings(this.systemNoticeEnable, this.noticeAudio, this.ntfyServerHost, this.ntfyToken);
        this.settings.newGroup('Advanced').addSettings(this.serverHost, this.debugEnable, this.version);
    }

    public forEach(consumer: (setting: SettingModel<any, any>) => void) {
        this.settings.forEach(consumer);
    }
}

export const SETTINGS = new Settings();

export class AwesomeBrainSettingTab extends PluginSettingTab {
    constructor(app: App, plugin: Plugin_2, protected pluginData: PluginDataIO) {
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
