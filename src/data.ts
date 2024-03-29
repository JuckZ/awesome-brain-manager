// https://github.com/uphy/obsidian-reminder/blob/master/src/data.ts
import type { Plugin } from 'obsidian';
import type { SettingData, SettingsData } from './model/settings';
import { SETTINGS } from '@/settings';

export class PluginDataIO {
    changed = false;

    constructor(private plugin: Plugin) {
        SETTINGS.forEach(setting => {
            setting.rawValue.onChanged(() => {
                this.changed = true;
            });
        });
    }

    async load() {
        const data: SettingData = await this.plugin.loadData();
        if (!data) {
            return;
        }
        const loadedSettings = data.settings;
        SETTINGS.forEach(setting => {
            setting.load(loadedSettings);
        });
        this.changed = false;
    }

    async save() {
        if (!this.changed) {
            return;
        }
        const settings = {} as SettingsData;
        SETTINGS.forEach(setting => {
            setting.store(settings);
        });
        await this.plugin.saveData({
            settings,
        });
        this.changed = false;
    }
}
