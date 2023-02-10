import type { EditorPosition } from 'obsidian';

export function getEditorPositionFromIndex(content: string, index: number): EditorPosition {
    const substr = content.substr(0, index);

    let l = 0;
    let offset = -1;
    let r = -1;
    for (; (r = substr.indexOf('\n', r + 1)) !== -1; l++, offset = r);
    offset += 1;

    const ch = content.substr(offset, index - offset).length;

    return { line: l, ch: ch };
}
