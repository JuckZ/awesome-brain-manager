import {
    Decoration,
    DecorationSet,
    EditorView,
    PluginSpec,
    PluginValue,
    ViewPlugin,
    ViewUpdate,
    WidgetType,
} from '@codemirror/view';

import { EditorState, Extension, RangeSetBuilder, StateEffect, StateField, Transaction } from '@codemirror/state';

import { syntaxTree } from '@codemirror/language';

class EmojiListPlugin implements PluginValue {
    decorations: DecorationSet;

    constructor(view: EditorView) {
        this.decorations = this.buildDecorations(view);
    }

    update(update: ViewUpdate) {
        if (update.docChanged || update.viewportChanged) {
            this.decorations = this.buildDecorations(update.view);
        }
    }

    destroy() {
        // Logger.log('destroy====');
    }

    buildDecorations(view: EditorView): DecorationSet {
        const builder = new RangeSetBuilder<Decoration>();

        for (const { from, to } of view.visibleRanges) {
            syntaxTree(view.state).iterate({
                from,
                to,
                enter(node) {
                    if (node.type.name.startsWith('list')) {
                        // Position of the '-' or the '*'.
                        const listCharFrom = node.from - 2;

                        builder.add(
                            listCharFrom,
                            listCharFrom + 1,
                            Decoration.replace({
                                widget: new EmojiWidget(),
                            }),
                        );
                    }
                },
            });
        }

        return builder.finish();
    }
}

const pluginSpec: PluginSpec<EmojiListPlugin> = {
    decorations: (value: EmojiListPlugin) => value.decorations,
};

class EmojiWidget extends WidgetType {
    toDOM(view: EditorView): HTMLElement {
        const div = document.createElement('span');

        div.innerText = '👉';

        return div;
    }
}

export const emojiListPlugin = ViewPlugin.fromClass(EmojiListPlugin, pluginSpec);
