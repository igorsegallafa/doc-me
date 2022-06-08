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
documentChannel.on("update",            updateDocumentHandler)
documentChannel.on("updateVersion",     updateVersionHandler)
documentChannel.on("open",              openDocumentHandler)
documentChannel.on("userJoined",        userJoinedHandler)
documentChannel.on("userDisconnected",  userDisconnected)
documentChannel.on("updateCursor",      updateCursor)

function selectionChangeHandler(range, oldRange, source) {
    documentChannel.push("update_cursor", range);
}

function updateCursor(data) {
    cursorsOne.moveCursor('cursor', data);
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

function userJoinedHandler(data) {
    console.log(data);
}

function userDisconnected(data) {
    console.log(data);
}

export default socket
