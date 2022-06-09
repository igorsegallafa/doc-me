import QuillCursors from "quill-cursors";
import {Editor} from "./editor";

let documentVersion = 0;
let documentChannel = null;

function setupDocumentChannel(socket) {
    const urlParams = window.location.href.split('/');
    const documentId = urlParams[urlParams.findIndex(element => element === "document") + 1];

    // Connect document channel
    documentChannel = socket.channel("document:" + documentId, {})

    // Join handler
    documentChannel.join()
        .receive("ok", resp => {})
        .receive("error", resp => {})

    // Messages handler
    documentChannel.on("open", openDocumentHandler);
    documentChannel.on("update", updateDocumentHandler);
    documentChannel.on("updateVersion", updateVersionHandler);
    documentChannel.on("userJoined", userJoinedHandler);
    documentChannel.on("userDisconnected", userDisconnectedHandler);
    documentChannel.on("updateCursor", updateCursorHandler);
}

function sendUpdateCursorPosition(range) {
    documentChannel.push("update_cursor", range);
}

function sendUpdateDocumentChange(delta) {
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
    Editor.setContent(data.content);
}

function updateDocumentHandler(data) {
    Editor.setContentChanges(data);
}

function updateVersionHandler(data) {
    documentVersion = data.version;
}

function userJoinedHandler(data) {
    console.log(data);
}

function userDisconnectedHandler(data) {
    console.log(data);
}

function updateCursorHandler(data) {
    Editor.updateCursor(data);
}

export var Document = {
    init: function(socket) {
        setupDocumentChannel(socket);
    },
    sendUpdateCursorPosition,
    sendUpdateDocumentChange
};