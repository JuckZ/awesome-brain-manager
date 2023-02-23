// https://github.com/uphy/obsidian-reminder/blob/master/src/settings.ts
import { App, PluginSettingTab, Plugin_2 } from 'obsidian';
import type { SettingModel } from './model/settings';
import { RawSerde, SettingTabModel } from './model/settings';
import type { PluginDataIO } from './data';
import { toggleCursorEffects } from './render/CursorEffects';
import { toggleBlast } from './render/Blast';
import t from './i18n';

class Settings {
    settings: SettingTabModel = new SettingTabModel();

    cursorEffectBuilder: any;
    powerModeBuilder: any;

    cursorEffect: SettingModel<string, string>;
    powerMode: SettingModel<string, string>;
    shakeMode: SettingModel<boolean, boolean>;
    toolbar: SettingModel<boolean, boolean>;
    debugEnable: SettingModel<boolean, boolean>;
    expectedTime: SettingModel<number, number>;
    clickString: SettingModel<string, string>;

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
            .number(25)
            .build(new RawSerde());

        this.clickString = this.settings
            .newSettingBuilder()
            .key('clickString')
            .name('Show something on click')
            .desc('input something you want to show, separated by commas')
            .text('富强,民主,文明,和谐,自由,平等,公正,法治,爱国,敬业,诚信,友善')
            .placeHolder('富强,民主,文明,和谐,自由,平等,公正,法治,爱国,敬业,诚信,友善')
            .build(new RawSerde());

        this.toolbar = this.settings
            .newSettingBuilder()
            .key('toolbar')
            .name(t.setting.toolbar.name)
            .desc(t.setting.toolbar.desc)
            .toggle(false)
            .build(new RawSerde());

        this.debugEnable = this.settings
            .newSettingBuilder()
            .key('debugEnable')
            .name('Enable debug')
            .desc('If you set this value as true, your will see debug info in console.')
            .toggle(false)
            .build(new RawSerde());

        this.settings
            .newGroup(t.setting.title.effects)
            .addSettings(this.cursorEffect, this.clickString, this.powerMode, this.shakeMode);

        this.settings.newGroup(t.setting.title.pomodoro).addSettings(this.expectedTime);

        this.settings.newGroup(t.setting.title.toolbar).addSettings(this.toolbar);

        this.settings.newGroup('Advanced').addSettings(this.debugEnable);
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
