import type { Debouncer, MarkdownPostProcessor, MarkdownPostProcessorContext } from 'obsidian';
import { debounce } from 'obsidian';
import twemoji from 'twemoji';
import plantuml from 'plantuml-encoder';
import { v4 as uuidv4 } from 'uuid';
import { request } from '@/utils/request';
import type AwesomeBrainManagerPlugin from '@/main';
import { insertImageWithMap, insertReactComponent, insertVueComponent } from '@/utils/content';

export default class Process {
    plugin: AwesomeBrainManagerPlugin;

    constructor(plugin: AwesomeBrainManagerPlugin) {
        this.plugin = plugin;
    }

    EmojiProcess: MarkdownPostProcessor = (el: HTMLElement) => {
        twemoji.parse(el);
    };

    VueProcess = async (source, el, ctx) => {
        const closestLeaf = ctx.containerEl.closest('.workspace-leaf-content') as HTMLElement;
        if (closestLeaf && closestLeaf.dataset['mode'] === 'source' && !el.closest('.cm-line')) {
            // LoggerUtil.log(closestLeaf.dataset['mode']);
        } else {
            // insertVueComponent(el, ctx, `<Markdown src={${JSON.stringify('```tsx\n' + source + '\n```')}}/>`);
        }
        insertVueComponent(el, ctx, source);
    };

    ReactProcess = async (source, el, ctx) => {
        insertVueComponent(el, ctx, source);
    };

    // https://github.com/joethei/obsidian-plantuml
    UMLProcess = async (source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
        const debounceMap = new Map<
            string,
            Debouncer<[string, HTMLElement, MarkdownPostProcessorContext], Promise<void>>
        >();
        const processor = async (source: string, el: HTMLElement, _: MarkdownPostProcessorContext) => {
            const url = 'https://www.plantuml.com/plantuml';
            const imageUrlBase = url + '/png/';

            const encodedDiagram = plantuml.encode(source);
            const image = imageUrlBase + encodedDiagram;

            //get image map data to support clicking links in diagrams
            const mapUrlBase = url + '/map/';
            const map = await request({ url: mapUrlBase + encodedDiagram, method: 'GET' });
            insertImageWithMap(el, image, map, encodedDiagram);
        };
        const debounceTime = 3;
        const filetype = 'png';
        el.createEl('h6', { text: 'Generating PlantUML diagram' });

        if (el.dataset.plantumlDebounce) {
            const debounceId = el.dataset.plantumlDebounce;
            if (debounceMap.has(debounceId)) {
                await debounceMap.get(debounceId)?.(source, el, ctx);
            }
        } else {
            const func = debounce(processor, debounceTime, true);
            const uuid = uuidv4();
            el.dataset.plantumlDebouce = uuid;
            debounceMap.set(uuid, func);

            source = this.plugin.replacer.replaceNonBreakingSpaces(source);
            source = this.plugin.replacer.replaceLinks(source, this.plugin.replacer.getPath(ctx), filetype);
            source = '\r\n' + source;
            await processor(source, el, ctx);
        }
    };
}
