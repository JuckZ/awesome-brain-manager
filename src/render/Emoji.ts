import { MarkdownPostProcessorContext, MarkdownRenderChild } from 'obsidian';

export class Emoji extends MarkdownRenderChild {
    static ALL_EMOJIS: Record<string, string> = {
        ':+1:': '👍',
        ':sunglasses:': '😎',
        ':smile:': '😄',
    };

    text: string;

    constructor(containerEl: HTMLElement, text: string) {
        super(containerEl);

        this.text = text;
    }

    onload() {
        const emojiEl = this.containerEl.createSpan({
            text: Emoji.ALL_EMOJIS[this.text] ?? this.text,
        });
        this.containerEl.replaceWith(emojiEl);
    }
}

export function codeEmoji(el: HTMLElement, ctx: MarkdownPostProcessorContext) {
    const codeblocks = el.querySelectorAll('code');
    for (let index = 0; index < codeblocks.length; index++) {
        const codeblock = codeblocks.item(index);
        const text = codeblock.innerText.trim();
        const isEmoji = text[0] === ':' && text[text.length - 1] === ':';

        if (isEmoji) {
            ctx.addChild(new Emoji(codeblock, text));
        }
    }
}
