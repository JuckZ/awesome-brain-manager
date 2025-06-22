import type { MarkdownPostProcessorContext, TFile } from 'obsidian';
import naive from 'naive-ui';
import * as vue from 'vue/dist/vue.esm-bundler.js';
import TestTitle from '@/ui/TestTitle';
import { LoggerUtil } from '@/utils/logger';

interface MContent {
    content: string;
    posNum?: number;
}

// TODO  registerCodeBlockComponents
export async function registerComponent(file: TFile, vueApp: vue.VueApp) {
    const content = await app.vault.read(file);
    const templateMatch = content.match(/<template>([\s\S]*?)<\/template>/);
    const scriptMatch = content.match(/<script>([\s\S]*?)<\/script>/);

    if (templateMatch && scriptMatch) {
        const templateContent = templateMatch[1].trim();
        const scriptContent = scriptMatch[1].trim();
        const compName = file.name.replace('.' + file.extension, '');
        vueApp.component(compName, {
            data() {
                return {
                    message: 'hello juck',
                };
            },
            template: templateContent,
        });
    }
}

export async function awaitFilesLoaded() {
    let len: number;
    do {
        len = app.vault.getAllLoadedFiles().length;
        await new Promise(r => setTimeout(r, 500));
    } while (len != app.vault.getAllLoadedFiles().length);
}

async function registerComponentsFromDirectory(dir, vueApp) {
    try {
        await awaitFilesLoaded();
        const sfcList = app.vault.getFiles().filter(file => {
            return file.path.contains(dir) && file.extension === 'vue';
        });
        for (const file of sfcList) {
            await registerComponent(file, vueApp);
        }
    } catch (e) {
        console.error(e);
    }
}

//credit to chhoumann, original code from: https://github.com/chhoumann/quickadd
export function insertAfterHandler(targetString: string, formatted: string, fileContent: string) {
    // const targetString: string = plugin.settings.InsertAfter;
    //eslint-disable-next-line
    const targetRegex = new RegExp(`\s*${escapeRegExp(targetString)}\s*`);
    const fileContentLines: string[] = getLinesInString(fileContent);

    const targetPosition = fileContentLines.findIndex(line => targetRegex.test(line));
    const targetNotFound = targetPosition === -1;
    if (targetNotFound) {
        // if (this.choice.insertAfter?.createIfNotFound) {
        //     return await createInsertAfterIfNotFound(formatted);
        // }

        LoggerUtil.log('unable to find insert after line in file.');
    }

    const nextHeaderPositionAfterTargetPosition = fileContentLines
        .slice(targetPosition + 1)
        .findIndex(line => /^#+ |---/.test(line));
    const foundNextHeader = nextHeaderPositionAfterTargetPosition !== -1;

    if (foundNextHeader) {
        let endOfSectionIndex = -1;

        for (let i = nextHeaderPositionAfterTargetPosition + targetPosition; i > targetPosition; i--) {
            const lineIsNewline: boolean = /^[\s\n ]*$/.test(fileContentLines[i]);
            if (!lineIsNewline) {
                endOfSectionIndex = i;
                break;
            }
        }

        if (endOfSectionIndex == -1) endOfSectionIndex = targetPosition;

        return insertTextAfterPositionInBody(formatted, fileContent, endOfSectionIndex, foundNextHeader);
    } else {
        return insertTextAfterPositionInBody(formatted, fileContent, fileContentLines.length - 1, foundNextHeader);
    }
    // return insertTextAfterPositionInBody(formatted, fileContent, targetPosition);
}

// https://stackoverflow.com/questions/3115150/how-to-escape-regular-expression-special-characters-using-javascript
export function escapeRegExp(text: string) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

//credit to chhoumann, original code from: https://github.com/chhoumann/quickadd/blob/7536a120701a626ef010db567cea7cf3018e6c82/src/utility.ts#L130
export function getLinesInString(input: string) {
    const lines: string[] = [];
    let tempString = input;

    while (tempString.contains('\n')) {
        const lineEndIndex = tempString.indexOf('\n');
        lines.push(tempString.slice(0, lineEndIndex));
        tempString = tempString.slice(lineEndIndex + 1);
    }

    lines.push(tempString);

    return lines;
}

export function insertTextAfterPositionInBody(text: string, body: string, pos: number, found?: boolean): MContent {
    if (pos === -1) {
        return {
            content: `${body}\n${text}`,
            posNum: -1,
        };
    }

    const splitContent = body.split('\n');

    if (found) {
        const pre = splitContent.slice(0, pos + 1).join('\n');
        const post = splitContent.slice(pos + 1).join('\n');
        // return `${pre}\n${text}\n${post}`;
        return {
            content: `${pre}\n${text}\n${post}`,
            posNum: pos,
        };
    } else {
        const pre = splitContent.slice(0, pos + 1).join('\n');
        const post = splitContent.slice(pos + 1).join('\n');
        if (/[\s\S]*?/g.test(post)) {
            return {
                content: `${pre}\n${text}`,
                posNum: pos,
            };
        } else {
            return {
                content: `${pre}${text}\n${post}`,
                posNum: pos,
            };
        }
        // return `${pre}${text}\n${post}`;
    }
}

export function insertImageWithMap(el: HTMLElement, image: string, map: string, encodedDiagram: string) {
    el.empty();

    const img = document.createElement('img');
    if (image.startsWith('http')) {
        img.src = image;
    } else {
        img.src = 'data:image/png;base64,' + image;
    }
    img.useMap = '#' + encodedDiagram;

    if (map.contains('map')) {
        el.innerHTML = map;
        el.children[0].setAttr('name', encodedDiagram);
    }

    el.appendChild(img);
}

export function insertAsciiImage(el: HTMLElement, image: string) {
    el.empty();

    const pre = document.createElement('pre');
    const code = document.createElement('code');
    pre.appendChild(code);
    code.setText(image);
    el.appendChild(pre);
}

export function insertSvgImage(el: HTMLElement, image: string) {
    el.empty();

    const parser = new DOMParser();
    const svg = parser.parseFromString(image, 'image/svg+xml');

    const links = svg.getElementsByTagName('a');
    for (let i = 0; i < links.length; i++) {
        const link = links[i];
        link.addClass('internal-link');
    }

    el.insertAdjacentHTML('beforeend', svg.documentElement.outerHTML);
}

export async function registerVueComponent(vueApp: vue.VueApp) {
    vueApp.use(naive);
    // TODO 扫描并注册某个文件夹下所有的组件
    await registerComponentsFromDirectory('vue-widget', vueApp);
    vueApp.component('TestTitle', TestTitle);
}

export async function insertVueComponent(el: HTMLElement, ctx: MarkdownPostProcessorContext, source: string) {
    const vueApp = vue.createApp({
        data() {
            return {
                message: 'ignore this place',
            };
        },
        template: source,
    });
    // TODO 优化方向1，根据source进行有选择的注入组件，而非全部注入；优化方向2：只使用一个实例，通过定位等方式在不同元素上使用是否可行
    await registerVueComponent(vueApp);
    const container = document.createElement('span');
    vueApp.mount(container);
    el.replaceChildren(container);
}

export function insertReactComponent(el: HTMLElement, ctx: MarkdownPostProcessorContext, source: string) {
    const vueApp = vue.createApp({
        data() {
            return {
                message: 'ignore this place',
            };
        },
        template: source,
    });
    const container = document.createElement('span');
    vueApp.mount(container);
    el.replaceChildren(container);
}
