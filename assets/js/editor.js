import QuillCursors from "quill-cursors";
import Quill from "quill";

import {Document} from "./document";

let editor = null;
let cursorsOne = null;

function setupEditor() {
    Quill.register('modules/cursors', QuillCursors);
    editor = new Quill('#editor', Editor.config);

    cursorsOne = editor.getModule('cursors');
    cursorsOne.createCursor('cursor', 'User 1', 'blue');

    editor.on('text-change', textChangeHandler);
    editor.on('selection-change', selectionChangeHandler);
}

function selectionChangeHandler(range, oldRange, source) {
    Document.sendUpdateCursorPosition(range);
}

function textChangeHandler(delta) {
    Document.sendUpdateDocumentChange(delta);
}

function setContent(content) {
    editor.setContents(content, "silent");
}

function setContentChanges(changes) {
    editor.updateContents(changes, "silent");
}

function updateCursor(range) {
    cursorsOne.moveCursor('cursor', range);
}

export var Editor = {
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
};