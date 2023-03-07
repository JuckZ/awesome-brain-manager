import { TFile, normalizePath } from 'obsidian';
import LoggerUtil from './logger';

export async function getNotePath(directory, filename) {
    if (!filename.endsWith('.md')) {
        filename += '.md';
    }
    const path = normalizePath(join(directory, filename));
    await ensureFolderExists(path);
    return path;
}

function join(...partSegments) {
    let parts = [];
    for (let i2 = 0, l2 = partSegments.length; i2 < l2; i2++) {
        parts = parts.concat(partSegments[i2].split('/'));
    }
    const newParts = [];
    for (let i2 = 0, l2 = parts.length; i2 < l2; i2++) {
        const part = parts[i2];
        if (!part || part === '.') continue;
        else newParts.push(part);
    }
    if (parts[0] === '') newParts.unshift();
    return newParts.join('/');
}

async function ensureFolderExists(path) {
    const dirs = path.replace(/\\/g, '/').split('/');
    dirs.pop();
    if (dirs.length) {
        const dir = join(...dirs);
        if (!window.app.vault.getAbstractFileByPath(dir)) {
            await window.app.vault.createFolder(dir);
        }
    }
}

export async function getAllFiles(app, folders, ignorePath: string[], ext, files): Promise<TFile[]> {
    const ignoreMatch = ignorePath.find(item => folders.path.startsWith(item));
    if (!ignoreMatch) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const children = await app.fileManager.vault.fileMap[folders.path].children;
        if (!children) {
            files.push(folders);
        } else {
            for (let index = 0; index < children.length; index++) {
                const element = children[index];
                if (element.children && element.children.length != 0) {
                    await getAllFiles(app, element, ignorePath, ext, files);
                } else if (ext && ext.length > 0) {
                    if (element.extension && ext.contains(element.extension)) {
                        files.push(element);
                    }
                } else {
                    files.push(element);
                }
            }
        }
    }
    return files;
}

//from https://github.com/Pamela-Wang/Obsidian-Starter-Vaults/tree/2.01/Potato%20Vault/90%20Meta/92%20Plugins/Templater%20Scripts
export function getCleanTitle(msg) {
    // TODO 重构
    if (msg) {
        return msg.trim();
    }
    //  no dash in title so return current title trimmed
    const count = (msg.match(/-/g) || []).length;
    let nameTitle = msg;

    if (nameTitle.length > 1) {
        nameTitle = nameTitle.trim();
    }

    if (count == 0) {
        // DONE send back empty string if untitled
        if (msg.includes('Untitled')) {
            LoggerUtil.log('Untitled so returning empty space');
            return ' ';
        } else {
            LoggerUtil.log('No Dash so returning trimmed:', msg);
            // TODO remove fullstop
            return nameTitle.trim();
        }
    }
    // if there is a dash in the title
    else if (count == 1) {
        LoggerUtil.log('Dash detected in:', msg);
        nameTitle = nameTitle.split('-').slice(1);
        nameTitle = nameTitle[0];
        return nameTitle.trim();
    } else if (count > 1) {
        // TODO Check for date

        const dateType = /(\d{4})([-])(\d{2})([-])(\d{2})/;
        const isMatch = dateType.test(msg);

        if (isMatch && count == 2) {
            // since it has a date... and only has dashes for a date, return it.
            LoggerUtil.log('Date detected! No other dash, return as is', msg);

            return nameTitle.trim();
        } else {
            // it may contain date but also a front snippet OR it does not contain date and just multiple dashes
            LoggerUtil.log('Just front snippets with extra dash or date but also more dash', msg);

            nameTitle = nameTitle.split('-').slice(1);
            nameTitle = nameTitle.join('-');
            return nameTitle.trim();
        }
    } else {
        LoggerUtil.log('Logic Error');
    }
}
