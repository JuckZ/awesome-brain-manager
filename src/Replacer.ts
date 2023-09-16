// https://github.com/joethei/obsidian-plantuml
import type { MarkdownPostProcessorContext } from 'obsidian';
import type AwesomeBrainManagerPlugin from '@/main';

export default class Replacer {
    plugin: AwesomeBrainManagerPlugin;

    constructor(plugin: AwesomeBrainManagerPlugin) {
        this.plugin = plugin;
    }

    /**
     * replace all non-breaking spaces with actual spaces
     * @param text
     * @param path
     */
    public replaceNonBreakingSpaces(text: string): string {
        const lines = text.split(/\r?\n/);
        const resultLines: string[] = [];
        if (text.startsWith('@startmindmap')) {
            for (const line of lines) {
                resultLines.push(line.replace(/\s+/g, ' '));
            }
        } else {
            resultLines.push(...lines);
        }
        const result = resultLines.join('\r\n');
        return result.replace(/&nbsp;/gi, ' ');
    }

    /**
     * replace all links in the plugin syntax with valid plantuml links to note inside the vault
     * @param text the text, in which to replace all links
     * @param path path of the current file
     * @param filetype
     */
    public replaceLinks(text: string, path: string, filetype: string): string {
        return text.replace(/\[\[\[([\s\S]*?)\]\]\]/g, (_, args) => {
            const split = args.split('|');
            const file = this.plugin.app.metadataCache.getFirstLinkpathDest(split[0], path);
            if (!file) {
                return 'File with name: ' + split[0] + ' not found';
            }
            let alias = file.basename;
            if (filetype === 'png') {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                //@ts-ignore
                const url = this.plugin.app.getObsidianUrl(file);
                if (split[1]) {
                    alias = split[1];
                }
                return '[[' + url + ' ' + alias + ']]';
            }
            return '[[' + file.basename + ']]';
        });
    }

    /**
     * get the absolute path on the users computer
     * @param path vault local path
     */
    public getFullPath(path: string) {
        if (path.length === 0) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-ignore
            return this.plugin.app.vault.adapter.getFullPath('');
        }
        const file = this.plugin.app.vault.getAbstractFileByPath(path);

        if (!file) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-ignore
            return this.plugin.app.vault.adapter.getFullPath('');
        }

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        const folder = this.plugin.app.vault.getDirectParent(file);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        return this.plugin.app.vault.adapter.getFullPath(folder.path);
    }

    public getPath(ctx: MarkdownPostProcessorContext) {
        return this.getFullPath(ctx ? ctx.sourcePath : '');
    }
}
