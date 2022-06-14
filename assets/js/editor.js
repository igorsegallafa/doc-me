import QuillCursors from "quill-cursors";
import Quill from "quill";

import {Document} from "./document";

let cursorsOne = null;

function setupEditor() {
    Quill.register('modules/cursors', QuillCursors);

    cursorsOne = Editor.getEditor().getModule('cursors');
    cursorsOne.createCursor('cursor', 'User 1', 'blue');

    Editor.getEditor().on('text-change', textChangeHandler);
    Editor.getEditor().on('selection-change', selectionChangeHandler);
}

function selectionChangeHandler(range, oldRange, source) {
    Document.sendUpdateCursorPosition(range);
}

function textChangeHandler(delta) {
    Document.sendUpdateDocumentChange(delta);
}

function setContent(content) {
    Editor.getEditor().setContents(content, "silent");
}

function setContentChanges(changes) {
    Editor.getEditor().updateContents(changes, "silent");
}

function updateCursor(range) {
    cursorsOne.moveCursor('cursor', range);
}

export const Editor = {
    editor: null,
    config: {
        theme: 'bubble',
        modules: {
            cursors: {
                transformOnTextChange: true,
            }
        }
    },

    setContent,
    setContentChanges,
    updateCursor,

    init: function() {
        setupEditor();
    },
    getEditor: function() {
        if (Editor.editor == null)
            Editor.editor = new Quill('#editor', Editor.config);

        return Editor.editor;
    }
};