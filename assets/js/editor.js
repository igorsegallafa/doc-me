import QuillCursors from "quill-cursors";
import Quill from "quill";

import hljs from "highlight.js";
import elixir from "highlight.js/lib/languages/elixir";

import {Document} from "./document";

export const Editor = {
    init() {
        Quill.register('modules/cursors', QuillCursors);
        this.editor = new Quill('#editor', {
            theme: 'bubble',
            modules: {
                syntax: {highlight: text => hljs.highlightAuto(text).value},
                toolbar: [{'header': 2}, 'bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block', 'clean'],
                cursors: {
                    hideDelayMs: 500,
                    transformOnTextChange: true,
                },
                keyboard: {
                    bindings: {
                        'indent code-block': null,
                        'outdent code-block': null,
                    }
                }
            }
        });

        hljs.registerLanguage('elixir', elixir);

        this.editor.on('text-change', this.textChangeHandler);
        this.editor.on('selection-change', this.selectionChangeHandler);
    },

    selectionChangeHandler(range, _oldRange, _source) {
        Document.sendUpdateCursorPosition(range);
    },

    textChangeHandler(delta) {
        Document.sendUpdateDocumentChange(delta);
        Editor.buildSectionMenu();
    },

    setContent(content) {
        this.editor.setContents(content, "silent");
        Editor.buildSectionMenu();
    },

    setContentChanges(changes) {
        this.editor.updateContents(changes, "silent");
        Editor.buildSectionMenu();
    },

    buildSectionMenu() {
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
    },

    createCursor(userId) {
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

        const editorCursors = this.editor.getModule('cursors');
        const randomColor = colors[Math.floor(Math.random() * colors.length)];

        editorCursors.createCursor(userId, 'User '+ userId, randomColor);
    },

    updateCursor(userId, range) {
        const editorCursors = this.editor.getModule('cursors');
        if (editorCursors.cursors().findIndex(elem => elem.id === userId) === -1)
            this.createCursor(userId);

        this.editor.getModule('cursors').moveCursor(userId, range);
    },

    destroyCursor(userId) {
        this.editor.getModule('cursors').removeCursor(userId);
    }
};