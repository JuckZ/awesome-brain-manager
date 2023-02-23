import type { Plugin_2 } from 'obsidian';
import { SETTINGS, TAG_RESCAN } from './settings';
import { Reference } from './model/ref';

export class PluginDataIO {
    private restoring = true;
    changed = false;
    public scanned: Reference<boolean> = new Reference(false);

    constructor(private plugin: Plugin_2) {
        SETTINGS.forEach(setting => {
            setting.rawValue.onChanged(() => {
                if (this.restoring) {
                    return;
                }
                if (setting.hasTag(TAG_RESCAN)) {
                    this.scanned.value = false;
                }
                this.changed = true;
            });
        });
    }

    async load() {
        const data = await this.plugin.loadData();
        if (!data) {
            this.scanned.value = false;
            return;
        }
        this.scanned.value = data.scanned;
        const loadedSettings = data.settings;
        SETTINGS.forEach(setting => {
            setting.load(loadedSettings);
        });

        this.changed = false;
        if (this.restoring) {
            this.restoring = false;
        }
    }

    async save(force = false) {
        // Logger.warn('save exec');
        if (!force && !this.changed) {
            return;
        }
        const settings = {};
        SETTINGS.forEach(setting => {
            setting.store(settings);
        });
        await this.plugin.saveData({
            scanned: this.scanned.value,
            settings,
        });
        this.changed = false;
    }
}
