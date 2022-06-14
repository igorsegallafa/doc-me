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
    buildSectionMenu();
}

function setContent(content) {
    Editor.getEditor().setContents(content, "silent");
    buildSectionMenu();
}

function setContentChanges(changes) {
    Editor.getEditor().updateContents(changes, "silent");
    buildSectionMenu();
}

function buildSectionMenu() {
    const sections = document.getElementById("editor").querySelectorAll("h2");

    let sectionsMenu = document.getElementById("sections");
    let ul = document.createElement("ul");

    sectionsMenu.innerHTML = "";
    sectionsMenu.appendChild(ul);

    sections.forEach(function(section, i) {
        section.id = "section" + i;

        let li = document.createElement("li");
        li.className = "section-item";

        let a = document.createElement("a");
        a.innerHTML = section.innerText;
        a.href = "#section" + i;

        li.appendChild(a);
        ul.appendChild(li);
    });
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