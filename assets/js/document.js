import QuillCursors from "quill-cursors";
import {Editor} from "./editor";

function setupDocumentChannel(socket) {
    const urlParams = window.location.href.split('/');
    const documentId = urlParams[urlParams.findIndex(element => element === "document") + 1];

    // Connect document channel
    Document.setDocumentChannel(socket.channel("document:" + documentId, {}));

    // Join handler
    Document.getDocumentChannel().join()
        .receive("ok", resp => {})
        .receive("error", resp => {})

    // Messages handler
    Document.getDocumentChannel().on("open", openDocumentHandler);
    Document.getDocumentChannel().on("update", updateDocumentHandler);
    Document.getDocumentChannel().on("updateVersion", updateVersionHandler);
    Document.getDocumentChannel().on("userJoined", userJoinedHandler);
    Document.getDocumentChannel().on("userDisconnected", userDisconnectedHandler);
    Document.getDocumentChannel().on("updateCursor", updateCursorHandler);
}

function sendUpdateCursorPosition(range) {
    Document.getDocumentChannel().push("update_cursor", range);
}

function sendUpdateDocumentChange(delta) {
    if (delta) {
        let message = {
            delta,
            version: Document.getDocumentVersion()
        }

        Document.getDocumentChannel().push("update", message);
    }
}

function openDocumentHandler(data) {
    Document.setDocumentVersion(data.version);
    Editor.setContent(data.content);
}

function updateDocumentHandler(data) {
    Editor.setContentChanges(data);
}

function updateVersionHandler(data) {
    Document.setDocumentVersion(data.version);
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

export const Document = {
    documentVersion: 0,
    documentChannel: null,

    sendUpdateCursorPosition,
    sendUpdateDocumentChange,

    init: function(socket) {
        setupDocumentChannel(socket);
    },
    setDocumentChannel: function(channel) {
        Document.documentChannel = channel;
    },
    getDocumentChannel: function() {
        return Document.documentChannel;
    },
    setDocumentVersion: function(version) {
        Document.documentVersion = version;
    },
    getDocumentVersion: function() {
        return Document.documentVersion;
    }
};