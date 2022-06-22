import {Editor} from "./editor";

export const Document = {
    documentVersion: 0,

    init(socket) {
        // Connect document channel
        this.documentChannel = socket.channel("document:" + documentId, {});

        // Join handler
        this.documentChannel.join()
            .receive("ok", _resp => {})
            .receive("error", _resp => {})

        // Messages handler
        this.documentChannel.on("open", this.openDocumentHandler);
        this.documentChannel.on("update", this.updateDocumentHandler);
        this.documentChannel.on("updateVersion", this.updateVersionHandler);
        this.documentChannel.on("userJoined", this.userJoinedHandler);
        this.documentChannel.on("userDisconnected", this.userDisconnectedHandler);
        this.documentChannel.on("updateCursor", this.updateCursorHandler);
    },

    sendUpdateCursorPosition(range) {
        let message = {
            range: range,
            version: Document.documentVersion
        }

        this.documentChannel.push("update_cursor", message);
    },

    sendUpdateDocumentChange(delta) {
        if (delta) {
            let message = {
                delta,
                version: Document.documentVersion
            }

            this.documentChannel.push("update", message);
        }
    },

    openDocumentHandler(data) {
        Document.documentVersion = data.version;
        Editor.setContent(data.content);
    },

    updateDocumentHandler(data) {
        Document.documentVersion = data.version;
        Editor.setContentChanges(data);
    },

    updateVersionHandler(data) {
        Document.documentVersion = data.version;
    },

    userJoinedHandler(data) {
        Editor.createCursor(data.id);
    },

    userDisconnectedHandler(data) {
        Editor.destroyCursor(data.id);
    },

    updateCursorHandler(data) {
        if (Document.documentVersion >= data.version)
            Editor.updateCursor(data.id, data.range);
    }
};