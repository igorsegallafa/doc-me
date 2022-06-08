import {Socket} from "phoenix"
import QuillCursors from "quill-cursors";

let socket = new Socket("/socket", {params: {token: window.userToken}})

socket.connect()

Quill.register('modules/cursors', QuillCursors);
let quill = new Quill('#editor', {
    theme: 'bubble',
    modules: {
        cursors: {
            transformOnTextChange: true,
        }
    }
});

const cursorsOne = quill.getModule('cursors');
cursorsOne.createCursor('cursor', 'User 1', 'blue');

quill.on('text-change', textChangeHandler);
quill.on('selection-change', selectionChangeHandler);

// Open Socket
const urlParams = window.location.href.split('/');
const documentId = urlParams[urlParams.findIndex(element => element === "document") + 1];

let documentVersion = 0;
let documentChannel = socket.channel("document:" + documentId, {})

// Join handler
documentChannel.join()
    .receive("ok", resp => {})
    .receive("error", resp => {})

// Messages handler
documentChannel.on("update",        updateDocumentHandler)
documentChannel.on("updateVersion", updateVersionHandler)
documentChannel.on("open",          openDocumentHandler)

function selectionChangeHandler(range, oldRange, source) {
    if (source === 'user') {
        updateCursor(range);
    } else {
        debounce(updateCursor, 500);
    }
}

function updateCursor(range) {
    // Use a timeout to simulate a high latency connection.
    setTimeout(() => cursorsOne.moveCursor('cursor', range), 1000);
}

function debounce(func, wait) {
    let timeout;
    return function(...args) {
        const context = this;
        const later = function() {
            timeout = null;
            func.apply(context, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function textChangeHandler(delta) {
    if (delta) {
        let message = {
            delta,
            version: documentVersion
        }

        documentChannel.push("update", message);
    }
}

function openDocumentHandler(data) {
    documentVersion = data.version;
    quill.setContents(data.content, "silent");
}

function updateDocumentHandler(data) {
    quill.updateContents(data, "silent");
}

function updateVersionHandler(data) {
    documentVersion = data.version;
}

export default socket
