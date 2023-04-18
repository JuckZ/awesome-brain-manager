import type { Tag } from '../types/types';

export function buildTagRules(tag: Tag) {
    return [
        `body:not(.tag-default) span.cm-tag-${tag.type}:not(.cm-formatting-hashtag)::after,
        body:not(.tag-default) .tag[href^='#${tag.type}']::after {
          content: '${tag.icon}';
        }`,
        `body:not(.tag-default) .tag:is([href^='#${tag.type}']):not(.token),
        body:not(.tag-default) span:is(.cm-tag-${tag.type}) {
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
