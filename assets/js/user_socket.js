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

textChangeHandler();

// Open Socket
const urlParams = window.location.href.split('/');
const documentId = urlParams[urlParams.findIndex(element => element === "document") + 1];

let documentChannel = socket.channel("document:" + documentId, {})

// Join handler
documentChannel.join()
    .receive("ok", resp => {})
    .receive("error", resp => {})

// Messages handler
documentChannel.on("update", handleDocumentUpdate)
documentChannel.on("open",   handleDocumentOpened)

function selectionChangeHandler(range, oldRange, source) {
    console.log(source);
    if (source === 'user') {
        // If the user has manually updated their selection, send this change
        // immediately, because a user update is important, and should be
        // sent as soon as possible for a smooth experience.
        updateCursor(range);
    } else {
        // Otherwise, it's a text change update or similar. These changes will
        // automatically get transformed by the receiving client without latency.
        // If we try to keep sending updates, then this will undo the low-latency
        // transformation already performed, which we don't want to do. Instead,
        // add a debounce so that we only send the update once the user has stopped
        // typing, which ensures we send the most up-to-date position (which should
        // hopefully match what the receiving client already thinks is the cursor
        // position anyway).
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
        documentChannel.push("update", delta);
    }
}

function handleDocumentOpened(data) {
    quill.setContents(data.contents, "silent");
}

function handleDocumentUpdate(data) {
    quill.updateContents(data, "silent");
}

export default socket
