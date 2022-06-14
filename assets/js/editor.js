import QuillCursors from "quill-cursors";
import Quill from "quill";

import {Document} from "./document";

function setupEditor() {
    Quill.register('modules/cursors', QuillCursors);

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

function createCursor(userId) {
    const colors = [
        "red",
        "orange",
        "yellow",
        "green",
        "cyan",
        "blue",
        "purple",
        "magenta",
        "pink",
        "red"
    ];

    const editorCursors = Editor.getEditor().getModule('cursors');
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    editorCursors.createCursor(userId, 'User '+ userId, randomColor);
}

function updateCursor(userId, range) {
    const editorCursors = Editor.getEditor().getModule('cursors');
    if (editorCursors.cursors().findIndex(elem => elem.id === userId) === -1)
        createCursor(userId);

    Editor.getEditor().getModule('cursors').moveCursor(userId, range);
}

function destroyCursor(userId) {
    Editor.getEditor().getModule('cursors').removeCursor(userId);
}

export const Editor = {
    editor: null,
    config: {
        theme: 'bubble',
        modules: {
            cursors: {
                hideDelayMs: 500,
                transformOnTextChange: true,
            }
        }
    },

    setContent,
    setContentChanges,
    createCursor,
    updateCursor,
    destroyCursor,

    init: function() {
        setupEditor();
    },
    getEditor: function() {
        if (Editor.editor == null)
            Editor.editor = new Quill('#editor', Editor.config);

        return Editor.editor;
    }
};