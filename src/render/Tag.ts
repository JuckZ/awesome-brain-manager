import type { Tag } from '@/types/types';

export function buildTagRules(tag: Tag) {
    return [
        `body.tag-awesome-brain-manager:not(.tag-default) .cm-s-obsidian.is-live-preview span.cm-tag-${tag.type}:not(.cm-formatting-hashtag)::after,
body:not(.tag-default) .cm-s-obsidian.is-live-preview .tag[href^='#${tag.type}']::after,
body.tag-awesome-brain-manager:not(.tag-default) .markdown-preview-view span.cm-tag-${tag.type}:not(.cm-formatting-hashtag)::after,
body:not(.tag-default) .markdown-preview-view .tag[href^='#${tag.type}']::after {
    content: '${tag.icon}';
}`,
        `body.tag-awesome-brain-manager:not(.tag-default) .markdown-preview-view .tag:is([href^='#${tag.type}']):not(.token),
body.tag-awesome-brain-manager:not(.tag-default) .markdown-preview-view span:is(.cm-tag-${tag.type}),
body.tag-awesome-brain-manager:not(.tag-default) .cm-s-obsidian.is-live-preview .tag:is([href^='#${tag.type}']):not(.token),
body.tag-awesome-brain-manager:not(.tag-default) .cm-s-obsidian.is-live-preview span:is(.cm-tag-${tag.type}) {
    font-family: ${tag.font} !important;
    font-weight: lighter;
    color: ${tag.color} !important;
    background-color: ${tag.bgColor} !important;
    opacity: 0.7;
    font-size: var(--font-size-tag);
    filter: hue-rotate(0) !important;
}`,
    ];
}
