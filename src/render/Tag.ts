import type { Tag } from 'types';

export function buildTagRules(tag: Tag) {
    return [
        `body.tag-pill-outlined .cm-s-obsidian:not([class="markdown-source-view cm-s-obsidian mod-cm6"]) span.cm-hashtag.cm-meta.cm-hashtag-end:is(.cm-tag-important,.cm-tag-complete,.cm-tag-ideas,.cm-tag-${tag.type},.cm-tag-weeklynote,.cm-tag-dailynote,.cm-tag-inprogress):not(.cm-formatting-hashtag) {
        border-top: var(--tag-border-width) solid var(--tag1);
        border-bottom: var(--tag-border-width) solid var(--tag1);
    }`,
        `body:not(.tag-default) .tag[href ^="#${tag.type}"]:not(.token) {
        background-color: var(--tag-${tag.type}-bg) !important;
        font-weight: 600;
        font-family: ${tag.font.fontFamily} !important;
        color: ${tag.color} !important;
        filter: hue-rotate(0) !important;
    }`,
        `body:not(.tag-default) .tag[href^="#${tag.type}"]::after {
        content: ' 🚩';
        font-size: var(--font-size-emoji-after-tag);
    }`,
        `body:not(.tag-default) .cm-s-obsidian:not([class="markdown-source-view cm-s-obsidian mod-cm6"]) span.cm-tag-${tag.type}:not(.cm-formatting-hashtag)::after {
        content: ' 🚩';
    }`,
        `body:not(.tag-default) .cm-s-obsidian:not([class="markdown-source-view cm-s-obsidian mod-cm6"]) span.cm-hashtag.cm-meta.cm-hashtag-end.cm-tag-${tag.type}:not(.cm-formatting-hashtag) {
        font-family: ${tag.font.fontFamily} !important;
        font-weight: 600;
        background-color: ${tag.bgColor} !important;
        color: ${tag.color} !important;
        font-size: ${tag.font.size};
        filter: hue-rotate(0) !important;
    }`,
        `body:not(.tag-default) .cm-s-obsidian:not([class="markdown-source-view cm-s-obsidian mod-cm6"]) .cm-formatting.cm-formatting-hashtag.cm-hashtag.cm-hashtag-begin.cm-meta.cm-tag-${tag.type} {
        font-weight: 600;
        font-family: ${tag.font.fontFamily} !important;
        display: inline;
        color: ${tag.color} !important;
        background-color: ${tag.bgColor} !important;
        filter: hue-rotate(0) !important;
        --callout-icon: ${tag.icon.name};  /* Icon name from the Obsidian Icon Set */
    }`,
    ];
}
