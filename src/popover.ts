import {
    Component,
    type EphemeralState,
    HoverPopover,
    MarkdownView,
    type MousePos,
    PopoverState,
    TFile,
    View,
    Workspace,
    WorkspaceLeaf,
    WorkspaceSplit,
    WorkspaceTabs,
    requireApiVersion,
    resolveSubpath,
    setIcon,
} from 'obsidian';
import HoverEditorPlugin from './main';
import { useSystemStore } from '@/stores';

import { isA } from '@/utils/misc';
import { genId } from '@/utils/common';
import { SETTINGS } from '@/settings';

const popovers = new WeakMap<Element, HoverEditor>();
export interface HoverEditorParent {
    hoverPopover: HoverEditor | null;
    containerEl?: HTMLElement;
    view?: View;
    dom?: HTMLElement;
    parent: HoverEditorParent | null;
}
type ConstructableWorkspaceSplit = new (ws: Workspace, dir: 'horizontal' | 'vertical') => WorkspaceSplit;

function nosuper<T>(base: new (...args: unknown[]) => T): new () => T {
    const derived = function () {
        return Object.setPrototypeOf(new Component(), new.target.prototype);
    };
    derived.prototype = base.prototype;
    return Object.setPrototypeOf(derived, base);
}

export class HoverEditor extends nosuper(HoverPopover) {
    onTarget: boolean;

    onHover: boolean;

    shownPos: MousePos | null;

    abortController? = this.addChild(new Component());

    detaching = false;

    opening = false;

    rootSplit: WorkspaceSplit = new (WorkspaceSplit as ConstructableWorkspaceSplit)(window.app.workspace, 'vertical');

    targetRect = this.targetEl?.getBoundingClientRect();

    titleEl: HTMLElement;

    containerEl: HTMLElement;

    parent: HoverEditorParent | null;

    oldPopover: HoverEditor | null;

    document: Document = this.targetEl?.ownerDocument ?? window.activeDocument ?? window.document;

    id = genId(8);

    onMouseIn: (event: MouseEvent) => void;

    onMouseOut: (event: MouseEvent) => void;

    originalPath: string; // these are kept to avoid adopting targets w/a different link
    originalLinkText: string;

    static activePopover?: HoverEditor;

    static activeWindows() {
        const windows: Window[] = [window];
        const { floatingSplit } = app.workspace;
        if (floatingSplit) {
            for (const split of floatingSplit.children) {
                if (split.win) windows.push(split.win);
            }
        }
        return windows;
    }

    static containerForDocument(doc: Document) {
        if (doc !== document && app.workspace.floatingSplit)
            for (const container of app.workspace.floatingSplit.children) {
                if (container.doc === doc) return container;
            }
        return app.workspace.rootSplit;
    }

    static activePopovers() {
        return this.activeWindows().flatMap(this.popoversForWindow);
    }

    static popoversForWindow(win?: Window) {
        return (
            Array.prototype.slice.call(win?.document?.body.querySelectorAll('.hover-popover') ?? []) as HTMLElement[]
        )
            .map(el => popovers.get(el)!)
            .filter(he => he);
    }

    static forLeaf(leaf: WorkspaceLeaf | undefined) {
        // leaf can be null such as when right clicking on an internal link
        const el = leaf && document.body.matchParent.call(leaf.containerEl, '.hover-popover'); // work around matchParent race condition
        return el ? popovers.get(el) : undefined;
    }

    hoverEl: HTMLElement = this.document.defaultView!.createDiv({
        cls: 'popover hover-popover',
        attr: { id: 'he' + this.id },
    });

    constructor(
        parent: HoverEditorParent,
        public targetEl: HTMLElement,
        public plugin: HoverEditorPlugin,
        waitTime?: number,
        public onShowCallback?: () => unknown,
    ) {
        //
        super();

        this.oldPopover = parent.hoverPopover ?? null;
        if (waitTime === undefined) {
            waitTime = 300;
        }
        this.onTarget = true;
        this.onHover = false;
        this.shownPos = null;
        this.parent = parent;
        this.waitTime = waitTime;
        this.state = PopoverState.Showing;
        const { hoverEl } = this;
        this.onMouseIn = this._onMouseIn.bind(this);
        this.onMouseOut = this._onMouseOut.bind(this);
        this.abortController!.load();

        if (targetEl) {
            targetEl.addEventListener('mouseover', this.onMouseIn);
            targetEl.addEventListener('mouseout', this.onMouseOut);
        }

        hoverEl.addEventListener('mouseover', event => {
            if (mouseIsOffTarget(event, hoverEl)) {
                this.onHover = true;
                this.onTarget = false;
                this.transition();
            }
        });
        hoverEl.addEventListener('mouseout', event => {
            if (mouseIsOffTarget(event, hoverEl)) {
                this.onHover = false;
                this.onTarget = false;
                this.transition();
            }
        });
        this.timer = window.setTimeout(this.show.bind(this), waitTime);

        // custom logic begin
        popovers.set(this.hoverEl, this);
        this.hoverEl.addClass('hover-editor');
        this.containerEl = this.hoverEl.createDiv('popover-content');
        this.buildWindowControls();
        this.setInitialDimensions();
    }

    updateLeaves() {
        if (this.onTarget && this.targetEl && !this.document.contains(this.targetEl)) {
            this.onTarget = false;
            this.transition();
        }
        let leafCount = 0;
        this.plugin.app.workspace.iterateLeaves(leaf => {
            leafCount++;
        }, this.rootSplit);
        if (leafCount === 0) {
            this.hide(); // close if we have no leaves
        }
        this.hoverEl.setAttribute('data-leaf-count', leafCount.toString());
    }

    attachLeaf(): WorkspaceLeaf {
        this.rootSplit.getRoot = () => app.workspace[this.document === document ? 'rootSplit' : 'floatingSplit']!;
        this.rootSplit.getContainer = () => HoverEditor.containerForDocument(this.document);
        this.titleEl.insertAdjacentElement('afterend', this.rootSplit.containerEl);
        const leaf = this.plugin.app.workspace.createLeafInParent(this.rootSplit, 0);
        this.updateLeaves();
        return leaf;
    }

    onload(): void {
        super.onload();
        this.registerEvent(this.plugin.app.workspace.on('layout-change', this.updateLeaves, this));
        this.registerEvent(
            app.workspace.on('layout-change', () => {
                // Ensure that top-level items in a popover are not tabbed
                this.rootSplit.children.forEach((item, index) => {
                    if (item instanceof WorkspaceTabs) {
                        this.rootSplit.replaceChild(index, item.children[0]);
                    }
                });
            }),
        );
    }

    leaves() {
        const leaves: WorkspaceLeaf[] = [];
        this.plugin.app.workspace.iterateLeaves(leaf => {
            leaves.push(leaf);
        }, this.rootSplit);
        return leaves;
    }

    setInitialDimensions() {
        this.hoverEl.style.height = SETTINGS.initialHeight.value;
        this.hoverEl.style.width = SETTINGS.initialWidth.value;
    }

    buildWindowControls() {
        this.titleEl = this.document.defaultView!.createDiv('popover-titlebar');
        this.titleEl.createDiv('popover-title');
        const popoverActions = this.titleEl.createDiv('popover-actions');

        const closeEl = popoverActions.createEl('a', 'popover-action mod-close');
        setIcon(closeEl, 'x');
        closeEl.addEventListener('click', event => {
            this.hide();
        });
        this.containerEl.prepend(this.titleEl);
    }

    onShow() {
        // Once we've been open for closeDelay, use the closeDelay as a hiding timeout
        const closeDelay = SETTINGS.closeDelay.value;
        setTimeout(() => (this.waitTime = closeDelay), closeDelay);

        this.oldPopover?.hide();
        this.oldPopover = null;

        this.hoverEl.toggleClass('is-new', true);

        this.document.body.addEventListener(
            'click',
            () => {
                this.hoverEl.toggleClass('is-new', false);
            },
            { once: true, capture: true },
        );

        if (this.parent) {
            this.parent.hoverPopover = this;
        }

        // Workaround until 0.15.7
        if (requireApiVersion('0.15.1') && !requireApiVersion('0.15.7'))
            app.workspace.iterateLeaves(leaf => {
                if (leaf.view instanceof MarkdownView) (leaf.view.editMode as any).reinit?.();
            }, this.rootSplit);

        this.onShowCallback?.();
        this.onShowCallback = undefined; // only call it once
    }

    transition() {
        if (this.shouldShow()) {
            if (this.state === PopoverState.Hiding) {
                this.state = PopoverState.Shown;
                clearTimeout(this.timer);
            }
        } else {
            if (this.state === PopoverState.Showing) {
                this.hide();
            } else {
                if (this.state === PopoverState.Shown) {
                    this.state = PopoverState.Hiding;
                    this.timer = window.setTimeout(() => {
                        if (this.shouldShow()) {
                            this.transition();
                        } else {
                            this.hide();
                        }
                    }, this.waitTime);
                }
            }
        }
    }

    _onMouseIn(event: MouseEvent) {
        if (!(this.targetEl && !mouseIsOffTarget(event, this.targetEl))) {
            this.onTarget = true;
            this.transition();
        }
    }

    _onMouseOut(event: MouseEvent) {
        if (!(this.targetEl && !mouseIsOffTarget(event, this.targetEl))) {
            this.onTarget = false;
            this.transition();
        }
    }

    position(pos?: MousePos | null): void {
        // without this adjustment, the x dimension keeps sliding over to the left as you progressively mouse over files
        // disabling this for now since messing with pos.x like this breaks the detect() logic
        // if (pos && pos.x !== undefined) {
        //   pos.x = pos.x + 20;
        // }

        // native obsidian logic
        if (pos === undefined) {
            pos = this.shownPos;
        }

        let rect;

        if (pos) {
            rect = {
                top: pos.y - 10,
                bottom: pos.y + 10,
                left: pos.x,
                right: pos.x,
            };
        }

        this.document.body.appendChild(this.hoverEl);
        positionEl(rect, this.hoverEl, { gap: 10 }, this.document);

        // custom hover editor logic
        if (pos) {
            // give positionEl a chance to adjust the position before we read the coords
            setTimeout(() => {
                const left = parseFloat(this.hoverEl.style.left);
                const top = parseFloat(this.hoverEl.style.top);
                this.hoverEl.setAttribute('data-x', String(left));
                this.hoverEl.setAttribute('data-y', String(top));
            }, 0);
        }
    }

    shouldShow() {
        return this.shouldShowSelf() || this.shouldShowChild();
    }

    shouldShowChild(): boolean {
        return HoverEditor.activePopovers().some(popover => {
            if (popover !== this && popover.targetEl && this.hoverEl.contains(popover.targetEl)) {
                return popover.shouldShow();
            }
            return false;
        });
    }

    shouldShowSelf() {
        // Don't let obsidian show() us if we've already started closing
        // return !this.detaching && (this.onTarget || this.onHover);
        return (
            !this.detaching &&
            !!(
                this.onTarget ||
                this.onHover ||
                this.state == PopoverState.Shown ||
                this.document.querySelector(
                    `body>.modal-container, body > #he${this.id} ~ .menu, body > #he${this.id} ~ .suggestion-container`,
                )
            )
        );
    }

    show() {
        // native obsidian logic start
        if (!this.targetEl || this.document.body.contains(this.targetEl)) {
            this.state = PopoverState.Shown;
            this.timer = 0;
            const mouseCoords: MousePos = useSystemStore().systemState.mouseCoords;
            this.shownPos = mouseCoords;
            this.position(mouseCoords);
            this.onShow();
            app.workspace.onLayoutChange();
            this.load();
        } else {
            this.hide();
        }
        // native obsidian logic end

        // if this is an image view, set the dimensions to the natural dimensions of the image
        // an interactjs reflow will be triggered to constrain the image to the viewport if it's
        // too large
        if (this.hoverEl.dataset.imgHeight && this.hoverEl.dataset.imgWidth) {
            this.hoverEl.style.height = parseFloat(this.hoverEl.dataset.imgHeight) + this.titleEl.offsetHeight + 'px';
            this.hoverEl.style.width = parseFloat(this.hoverEl.dataset.imgWidth) + 'px';
        }
    }

    onHide() {
        this.oldPopover = null;
        if (this.parent?.hoverPopover === this) {
            this.parent.hoverPopover = null;
        }
    }

    hide() {
        this.onTarget = this.onHover = false;
        this.detaching = true;

        // A timer might be pending to call show() for the first time, make sure
        // it doesn't bring us back up after we close
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = 0;
        }

        // Hide our HTML element immediately, even if our leaves might not be
        // detachable yet.  This makes things more responsive and improves the
        // odds of not showing an empty popup that's just going to disappear
        // momentarily.
        this.hoverEl.hide();

        // If a file load is in progress, we need to wait until it's finished before
        // detaching leaves.  Because we set .detaching, The in-progress openFile()
        // will call us again when it finishes.
        if (this.opening) return;

        const leaves = this.leaves();
        if (leaves.length) {
            // Detach all leaves before we unload the popover and remove it from the DOM.
            // Each leaf.detach() will trigger layout-changed and the updateLeaves()
            // method will then call hide() again when the last one is gone.
            leaves.forEach(leaf => {
                leaf.detach();
                // Newer obsidians don't switch the active leaf until layout processing  :(
                if (leaf === app.workspace.activeLeaf) app.workspace.activeLeaf = null;
            });
        } else {
            this.parent = null;
            this.abortController?.unload();
            this.abortController = undefined;
            return this.nativeHide();
        }
    }

    nativeHide() {
        const { hoverEl, targetEl } = this;

        this.state = PopoverState.Hidden;

        hoverEl.detach();

        if (targetEl) {
            const parent = targetEl.matchParent('.hover-popover');
            if (parent) popovers.get(parent)?.transition();
            targetEl.removeEventListener('mouseover', this.onMouseIn);
            targetEl.removeEventListener('mouseout', this.onMouseOut);
        }

        this.onHide();
        this.unload();
    }
}

/**
 * It positions an element relative to a rectangle, taking into account the boundaries of the element's
 * offset parent
 * @param rect - The rectangle of the element you want to position the popup relative to.
 * @param {HTMLElement} el - The element to position
 * @param [options] - {
 * @returns An object with the top, left, and vresult properties.
 */
export function positionEl(
    rect: { top: number; bottom: number; left: number; right: number },
    el: HTMLElement,
    options: { gap?: number; preference?: string; offsetParent?: HTMLElement; horizontalAlignment?: string },
    document: Document,
) {
    options = options || {};
    el.show();
    const gap = options.gap || 0;
    const verticalPref = options.preference || 'bottom';
    const parentEl = options.offsetParent || el.offsetParent || document.documentElement;
    const horizontalAlignment = options.horizontalAlignment || 'left';
    const parentTop = parentEl.scrollTop + 10;
    const parentBottom = parentEl.scrollTop + parentEl.clientHeight - 10;
    const top = Math.min(rect.top, parentBottom);
    const bottom = Math.max(rect.bottom, parentTop);
    const elHeight = el.offsetHeight;
    const fitsAbove = rect.top - parentTop >= elHeight + gap;
    const fitsBelow = parentBottom - rect.bottom >= elHeight + gap;
    let topResult = 0;
    let vresult = ''; // vertical result

    if (!fitsAbove || ('top' !== verticalPref && fitsBelow)) {
        if (!fitsBelow || ('bottom' !== verticalPref && fitsAbove)) {
            if (parentEl.clientHeight < elHeight + gap) {
                topResult = parentTop;
                vresult = 'overlap';
            } else {
                if ('top' === verticalPref) {
                    topResult = parentTop + gap;
                    vresult = 'overlap';
                } else {
                    topResult = parentBottom - elHeight;
                    vresult = 'overlap';
                }
            }
        } else {
            topResult = bottom + gap;
            vresult = 'bottom';
        }
    } else {
        topResult = top - gap - elHeight;
        vresult = 'top';
    }

    const leftBoundary = parentEl.scrollLeft + 10;
    const rightBoundary = parentEl.scrollLeft + parentEl.clientWidth - 10;
    const elWidth = el.offsetWidth;
    let leftResult = 'left' === horizontalAlignment ? rect.left : rect.right - elWidth;

    if (leftResult < leftBoundary) {
        leftResult = leftBoundary;
    } else {
        if (leftResult > rightBoundary - elWidth) {
            leftResult = rightBoundary - elWidth;
        }
    }

    el.style.top = ''.concat(topResult.toString(), 'px');
    el.style.left = ''.concat(leftResult.toString(), 'px');

    return {
        top: topResult,
        left: leftResult,
        vresult: vresult,
    };
}

/**
 * "Get the position of an element relative to a parent element."
 *
 * The function takes two arguments:
 *
 * el: The element whose position we want to get.
 * parentEl: The parent element to which we want to get the relative position.
 * The function returns an object with two properties:
 *
 * top: The top position of the element relative to the parent element.
 * left: The left position of the element relative to the parent element.
 *
 * The function works by looping through the offsetParent chain of the element and subtracting the
 * scrollTop and scrollLeft values of the parent elements
 * @param {HTMLElement | null} el - The element you want to get the relative position of.
 * @param {HTMLElement | null} parentEl - The parent element that you want to get the relative position
 * of.
 * @returns An object with two properties, top and left.
 */
function getRelativePos(el: HTMLElement | null, parentEl: HTMLElement | null) {
    let top = 0,
        left = 0;
    for (let nextParentEl = parentEl ? parentEl.offsetParent : null; el && el !== parentEl && el !== nextParentEl; ) {
        top += el.offsetTop;
        left += el.offsetLeft;
        const offsetParent = el.offsetParent as HTMLElement | null;

        for (let parent = el.parentElement; parent && parent !== offsetParent; ) {
            top -= parent.scrollTop;
            left -= parent.scrollLeft;
            parent = parent.parentElement;
        }

        if (offsetParent && offsetParent !== parentEl && offsetParent !== nextParentEl) {
            top -= offsetParent.scrollTop;
            left -= offsetParent.scrollLeft;
        }

        el = offsetParent;
    }

    return {
        top,
        left,
    };
}

function mouseIsOffTarget(event: MouseEvent, el: Element) {
    const relatedTarget = event.relatedTarget;
    return !(isA(relatedTarget, Node) && el.contains(relatedTarget));
}
