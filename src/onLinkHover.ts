import { type EphemeralState, Platform, PopoverState } from 'obsidian';

import HoverEditorPlugin from '@/main';
import { HoverEditor, type HoverEditorParent } from '@/popover';
import { isA } from '@/utils/misc';
import { SETTINGS } from '@/settings';

const targetPops = new WeakMap<HTMLElement, HoverEditor>();

export function onLinkHover(
    plugin: HoverEditorPlugin,
    parent: HoverEditorParent,
    targetEl: HTMLElement,
    linkText: string,
    path: string,
    oldState: EphemeralState,
    ...args: unknown[]
) {
    // Tweak the targetEl for calendar to point to the table cell instead of the actual day,
    // so the link won't be broken when the day div is recreated by calendar refreshing
    if (targetEl && targetEl.matches('.workspace-leaf-content[data-type="calendar"] table.calendar td > div'))
        targetEl = targetEl.parentElement!;

    const prevPopover = targetPops.has(targetEl) ? targetPops.get(targetEl) : parent.hoverPopover;
    if (prevPopover?.lockedOut) return;

    const parentHasExistingPopover =
        prevPopover &&
        prevPopover.state !== PopoverState.Hidden &&
        // Don't keep the old popover if manually pinned (so you can tear off multiples)
        (!prevPopover.isPinned || SETTINGS.autoPin.value === 'always') &&
        prevPopover.targetEl !== null &&
        prevPopover.originalLinkText === linkText &&
        prevPopover.originalPath === path &&
        targetEl &&
        prevPopover.adopt(targetEl);

    if (parentHasExistingPopover) {
        targetPops.set(targetEl, prevPopover);
    } else {
        const editor = new HoverEditor(parent, targetEl, plugin, SETTINGS.triggerDelay.value);
        if (targetEl) targetPops.set(targetEl, editor);
        editor.originalLinkText = linkText;
        editor.originalPath = path;
        parent.hoverPopover = editor;
        const controller = editor.abortController!;

        const unlock = function () {
            if (!editor) return;
            editor.lockedOut = false;
        };

        const onMouseDown = function (event: MouseEvent) {
            if (!editor) return;
            if (isA(event.target, HTMLElement) && !event.target.closest('.hover-editor, .menu')) {
                editor.state = PopoverState.Hidden;
                editor.hide();
                editor.lockedOut = true;
                setTimeout(unlock, 1000);
            }
        };

        const { document } = editor;

        // to prevent mod based keyboard shortcuts from accidentally triggering popovers
        const onKeyUp = function (event: KeyboardEvent) {
            if (!editor) return;
            const modKey = Platform.isMacOS ? 'Meta' : 'Control';
            if (!editor.onHover && editor.state !== PopoverState.Shown && event.key !== modKey) {
                editor.state = PopoverState.Hidden;
                editor.hide();
                editor.lockedOut = true;
                setTimeout(unlock, 1000);
            } else {
                document.body.removeEventListener('keyup', onKeyUp, true);
            }
        };

        document.addEventListener('pointerdown', onMouseDown, true);
        document.addEventListener('mousedown', onMouseDown, true);
        document.body.addEventListener('keyup', onKeyUp, true);
        controller.register(() => {
            document.removeEventListener('pointerdown', onMouseDown, true);
            document.removeEventListener('mousedown', onMouseDown, true);
            document.body.removeEventListener('keyup', onKeyUp, true);
        });

        setTimeout(() => {
            if (editor?.state == PopoverState.Hidden) {
                return;
            }
            editor?.openLink(linkText, path, oldState);
        }, 0);
    }
}
