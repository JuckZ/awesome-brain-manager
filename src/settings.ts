import {
    ReminderFormatType,
    ReminderFormatTypes,
    changeReminderFormat,
    kanbanPluginReminderFormat,
    reminderPluginReminderFormat,
    setReminderFormatConfig,
    tasksPluginReminderFormat,
} from 'model/format';
import { ReminderFormatConfig, ReminderFormatParameterKey } from 'model/format/reminder-base';
import type { SettingModel } from 'model/settings';
import { LatersSerde, RawSerde, ReminderFormatTypeSerde, SettingTabModel, TimeSerde } from 'model/settings';
import { DateTime, Later, Time } from 'model/time';
import { App, PluginSettingTab, Plugin_2, TAbstractFile, TFile } from 'obsidian';
import { getDailyNoteSettings } from 'obsidian-daily-notes-interface';
import type { PluginDataIO } from 'data';
import { toggleCursorEffects } from 'render/CursorEffects';
import { toggleBlast } from 'render/Blast';
import t from './i18n';
export const TAG_RESCAN = 're-scan';

class Settings {
    settings: SettingTabModel = new SettingTabModel();

    setRolloverTemplateHeadingOptionsHasBeenSet!: boolean;
    cursorEffectBuilder: any;
    powerModeBuilder: any;
    rolloverTemplateHeadingBuilder: any;

    cursorEffect: SettingModel<string, string>;
    powerMode: SettingModel<string, string>;
    shakeMode: SettingModel<boolean, boolean>;
    reminderTime: SettingModel<string, Time>;
    useSystemNotification: SettingModel<boolean, boolean>;
    laters: SettingModel<string, Array<Later>>;
    dateFormat: SettingModel<string, string>;
    dateTimeFormat: SettingModel<string, string>;
    strictDateFormat: SettingModel<boolean, boolean>;
    autoCompleteTrigger: SettingModel<string, string>;
    primaryFormat: SettingModel<string, ReminderFormatType>;
    useCustomEmojiForTasksPlugin: SettingModel<boolean, boolean>;
    removeTagsForTasksPlugin: SettingModel<boolean, boolean>;
    linkDatesToDailyNotes: SettingModel<boolean, boolean>;
    editDetectionSec: SettingModel<number, number>;
    reminderCheckIntervalSec: SettingModel<number, number>;
    templateHeading: SettingModel<string, string>;
    deleteOnComplete: SettingModel<boolean, boolean>;
    removeEmptyTodos: SettingModel<boolean, boolean>;
    debugEnable: SettingModel<boolean, boolean>;
    expectedTime: SettingModel<number, number>;

    constructor() {
        const reminderFormatSettings = new ReminderFormatSettings(this.settings);

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

        this.reminderTime = this.settings
            .newSettingBuilder()
            .key('reminderTime')
            .name('Reminder Time')
            .desc('Time when a reminder with no time part will show')
            .tag(TAG_RESCAN)
            .text('09:00')
            .placeHolder('Time (hh:mm)')
            .build(new TimeSerde());

        this.useSystemNotification = this.settings
            .newSettingBuilder()
            .key('useSystemNotification')
            .name('Use system notification')
            .desc('Use system notification for reminder notifications')
            .toggle(false)
            .build(new RawSerde());

        this.laters = this.settings
            .newSettingBuilder()
            .key('laters')
            .name('Remind me later')
            .desc('Line-separated list of remind me later items')
            .textArea('In 30 minutes\nIn 1 hour\nIn 3 hours\nTomorrow\nNext week')
            .placeHolder('In 30 minutes\nIn 1 hour\nIn 3 hours\nTomorrow\nNext week')
            .build(new LatersSerde());

        this.dateFormat = this.settings
            .newSettingBuilder()
            .key('dateFormat')
            .name('Date format')
            .desc('moment style date format: https://momentjs.com/docs/#/displaying/format/')
            .tag(TAG_RESCAN)
            .text('YYYY-MM-DD')
            .placeHolder('YYYY-MM-DD')
            .onAnyValueChanged(context => {
                context.setEnabled(reminderFormatSettings.enableReminderPluginReminderFormat.value);
            })
            .build(new RawSerde());

        this.strictDateFormat = this.settings
            .newSettingBuilder()
            .key('strictDateFormat')
            .name('Strict Date format')
            .desc('Strictly parse the date and time')
            .tag(TAG_RESCAN)
            .toggle(false)
            .build(new RawSerde());

        this.dateTimeFormat = this.settings
            .newSettingBuilder()
            .key('dateTimeFormat')
            .name('Date and time format')
            .desc('moment() style date time format: https://momentjs.com/docs/#/displaying/format/')
            .tag(TAG_RESCAN)
            .text('YYYY-MM-DD HH:mm')
            .placeHolder('YYYY-MM-DD HH:mm')
            .onAnyValueChanged(context => {
                context.setEnabled(reminderFormatSettings.enableReminderPluginReminderFormat.value);
            })
            .build(new RawSerde());

        this.linkDatesToDailyNotes = this.settings
            .newSettingBuilder()
            .key('linkDatesToDailyNotes')
            .name('Link dates to daily notes')
            .desc('When toggled, Dates link to daily notes.')
            .tag(TAG_RESCAN)
            .toggle(false)
            .onAnyValueChanged(context => {
                context.setEnabled(reminderFormatSettings.enableReminderPluginReminderFormat.value);
            })
            .build(new RawSerde());

        this.autoCompleteTrigger = this.settings
            .newSettingBuilder()
            .key('autoCompleteTrigger')
            .name('Calendar popup trigger')
            .desc('Trigger text to show calendar popup')
            .text('(@')
            .placeHolder('(@')
            .onAnyValueChanged(context => {
                const value = this.autoCompleteTrigger.value;
                context.setInfo(`Popup is ${value.length === 0 ? 'disabled' : 'enabled'}`);
            })
            .build(new RawSerde());

        const primaryFormatBuilder = this.settings
            .newSettingBuilder()
            .key('primaryReminderFormat')
            .name('Primary reminder format')
            .desc('Reminder format for generated reminder by calendar popup')
            .dropdown(ReminderFormatTypes[0]!.name);
        ReminderFormatTypes.forEach(f => primaryFormatBuilder.addOption(`${f.description} - ${f.example}`, f.name));
        this.primaryFormat = primaryFormatBuilder.build(new ReminderFormatTypeSerde());

        this.useCustomEmojiForTasksPlugin = this.settings
            .newSettingBuilder()
            .key('useCustomEmojiForTasksPlugin')
            .name('Distinguish between reminder date and due date')
            .desc(
                "Use custom emoji ⏰ instead of 📅 and distinguish between reminder date/time and Tasks Plugin's due date.",
            )
            .tag(TAG_RESCAN)
            .toggle(false)
            .onAnyValueChanged(context => {
                context.setEnabled(reminderFormatSettings.enableTasksPluginReminderFormat.value);
            })
            .build(new RawSerde());
        this.removeTagsForTasksPlugin = this.settings
            .newSettingBuilder()
            .key('removeTagsForTasksPlugin')
            .name('Remove tags from reminder title')
            .desc('If checked, tags(#xxx) are removed from the reminder list view and notification.')
            .tag(TAG_RESCAN)
            .toggle(false)
            .onAnyValueChanged(context => {
                context.setEnabled(reminderFormatSettings.enableTasksPluginReminderFormat.value);
            })
            .build(new RawSerde());

        this.editDetectionSec = this.settings
            .newSettingBuilder()
            .key('editDetectionSec')
            .name('Edit Detection Time')
            .desc(
                'The minimum amount of time (in seconds) after a key is typed that it will be identified as notifiable.',
            )
            .number(10)
            .build(new RawSerde());
        this.reminderCheckIntervalSec = this.settings
            .newSettingBuilder()
            .key('reminderCheckIntervalSec')
            .name('Reminder check interval')
            .desc(
                'Interval(in seconds) to periodically check whether or not you should be notified of reminders.  You will need to restart Obsidian for this setting to take effect.',
            )
            .number(5)
            .build(new RawSerde());

        this.rolloverTemplateHeadingBuilder = this.settings
            .newSettingBuilder()
            .key('templateHeading')
            .name('Template heading')
            .desc('Which heading from your template should the todos go under')
            .dropdown('none');

        this.templateHeading = this.rolloverTemplateHeadingBuilder.build(new RawSerde());

        this.deleteOnComplete = this.settings
            .newSettingBuilder()
            .key('deleteOnComplete')
            .name('Delete todos from previous day')
            .desc(
                "Once todos are found, they are added to Today's Daily Note. If successful, they are deleted from Yesterday's Daily note. Enabling this is destructive and may result in lost data. Keeping this disabled will simply duplicate them from yesterday's note and place them in the appropriate section. Note that currently, duplicate todos will be deleted regardless of what heading they are in, and which heading you choose from above.",
            )
            .toggle(false)
            .build(new RawSerde());

        this.removeEmptyTodos = this.settings
            .newSettingBuilder()
            .key('removeEmptyTodos')
            .name('Remove empty todos in rollover')
            .desc('If you have empty todos, they will not be rolled over to the next day.')
            .toggle(true)
            .build(new RawSerde());

        this.debugEnable = this.settings
            .newSettingBuilder()
            .key('debugEnable')
            .name('Enable debug')
            .desc('If you set this value as true, your will see debug info in console.')
            .toggle(false)
            .build(new RawSerde());

        this.settings.newGroup(t.setting.title.effects).addSettings(this.cursorEffect, this.powerMode, this.shakeMode);

        this.settings.newGroup(t.setting.title.pomodoro).addSettings(this.expectedTime);

        this.settings.newGroup(t.setting.title.warning);
        this.settings
            .newGroup('Rollover TODOs')
            .addSettings(this.templateHeading, this.deleteOnComplete, this.removeEmptyTodos);

        this.settings
            .newGroup('Notification Settings')
            .addSettings(this.reminderTime, this.laters, this.useSystemNotification);
        this.settings.newGroup('Editor').addSettings(this.autoCompleteTrigger, this.primaryFormat);
        this.settings
            .newGroup('Reminder Format - Reminder Plugin')
            .addSettings(
                reminderFormatSettings.enableReminderPluginReminderFormat,
                this.dateFormat,
                this.dateTimeFormat,
                this.strictDateFormat,
                this.linkDatesToDailyNotes,
            );
        this.settings
            .newGroup('Reminder Format - Tasks Plugin')
            .addSettings(
                reminderFormatSettings.enableTasksPluginReminderFormat,
                this.useCustomEmojiForTasksPlugin,
                this.removeTagsForTasksPlugin,
            );
        this.settings
            .newGroup('Reminder Format - Kanban Plugin')
            .addSettings(reminderFormatSettings.enableKanbanPluginReminderFormat);
        this.settings
            .newGroup('Advanced')
            .addSettings(this.editDetectionSec, this.reminderCheckIntervalSec, this.debugEnable);

        const config = new ReminderFormatConfig();
        config.setParameterFunc(ReminderFormatParameterKey.now, () => DateTime.now());
        config.setParameter(ReminderFormatParameterKey.useCustomEmojiForTasksPlugin, this.useCustomEmojiForTasksPlugin);
        config.setParameter(ReminderFormatParameterKey.linkDatesToDailyNotes, this.linkDatesToDailyNotes);
        config.setParameter(ReminderFormatParameterKey.removeTagsForTasksPlugin, this.removeTagsForTasksPlugin);
        setReminderFormatConfig(config);
    }

    public setRolloverTemplateHeadingOptions(val: string[]) {
        if (this.setRolloverTemplateHeadingOptionsHasBeenSet) {
            return;
        }
        val.forEach(f => this.rolloverTemplateHeadingBuilder.addOption(`${f}`, f));
        this.setRolloverTemplateHeadingOptionsHasBeenSet = true;
        // this.settings.newGroup("test").addSettings(this.templateHeading)
    }

    public forEach(consumer: (setting: SettingModel<any, any>) => void) {
        this.settings.forEach(consumer);
    }
}

class ReminderFormatSettings {
    private settingKeyToFormatName: Map<string, ReminderFormatType> = new Map();
    reminderFormatSettings: Array<SettingModel<boolean, boolean>> = [];

    enableReminderPluginReminderFormat: SettingModel<boolean, boolean>;
    enableTasksPluginReminderFormat: SettingModel<boolean, boolean>;
    enableKanbanPluginReminderFormat: SettingModel<boolean, boolean>;

    constructor(private settings: SettingTabModel) {
        this.enableReminderPluginReminderFormat = this.createUseReminderFormatSetting(reminderPluginReminderFormat);
        this.enableTasksPluginReminderFormat = this.createUseReminderFormatSetting(tasksPluginReminderFormat);
        this.enableKanbanPluginReminderFormat = this.createUseReminderFormatSetting(kanbanPluginReminderFormat);
    }

    private createUseReminderFormatSetting(format: ReminderFormatType) {
        const key = `enable${format.name}`;
        const setting = this.settings
            .newSettingBuilder()
            .key(key)
            .name(`Enable ${format.description}`)
            .desc(`Enable ${format.description}`)
            .tag(TAG_RESCAN)
            .toggle(format.defaultEnabled)
            .onAnyValueChanged(context => {
                context.setInfo(
                    `Example: ${format.format.appendReminder('- [ ] Task 1', DateTime.now())?.insertedLine}`,
                );
            })
            .build(new RawSerde());

        this.settingKeyToFormatName.set(key, format);
        this.reminderFormatSettings.push(setting);

        setting.rawValue.onChanged(() => {
            this.updateReminderFormat(setting);
        });
        return setting;
    }

    private updateReminderFormat(setting: SettingModel<boolean, boolean>) {
        const selectedFormats = this.reminderFormatSettings
            .filter(s => s.value)
            .map(s => this.settingKeyToFormatName.get(s.key))
            .filter((s): s is ReminderFormatType => s !== undefined);
        changeReminderFormat(selectedFormats);
    }
}

export const SETTINGS = new Settings();

export class ReminderSettingTab extends PluginSettingTab {
    constructor(app: App, plugin: Plugin_2, protected pluginData: PluginDataIO) {
        super(app, plugin);
    }

    async getTemplateHeadings(): Promise<string[]> {
        const { template } = getDailyNoteSettings();
        if (!template) return [];

        let file: TAbstractFile | null = this.app.vault.getAbstractFileByPath(template);
        if (file == null) {
            file = this.app.vault.getAbstractFileByPath(template + '.md');
        }
        const templateContents: string = await this.app.vault.read(file as TFile);
        const allHeadings: string[] = Array.from(templateContents.matchAll(/#{1,} .*/g)).map(
            ([heading]) => heading as string,
        );
        return allHeadings;
    }

    async display(): Promise<void> {
        const { containerEl } = this;
        const templateHeadings: string[] = await this.getTemplateHeadings();
        SETTINGS.setRolloverTemplateHeadingOptions(templateHeadings);
        SETTINGS.settings.displayOn(containerEl);
    }

    override hide() {
        this.pluginData.save();
    }
}
