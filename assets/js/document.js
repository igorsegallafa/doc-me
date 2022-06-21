import {Editor} from "./editor";

export const Document = {
    init(socket) {
        // Connect document channel
        this.documentVersion = 0;
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
        this.documentChannel.push("update_cursor", range);
    },

    sendUpdateDocumentChange(delta) {
        if (delta) {
            let message = {
                delta,
                version: this.documentVersion
            }

            this.documentChannel.push("update", message);
        }
    },

    openDocumentHandler(data) {
        this.documentVersion = data.version;
        Editor.setContent(data.content);
    },

    updateDocumentHandler(data) {
        Editor.setContentChanges(data);
    },

    updateVersionHandler(data) {
        this.documentVersion = data.version;
    },

    userJoinedHandler(data) {
        Editor.createCursor(data.id);
    },

    userDisconnectedHandler(data) {
        Editor.destroyCursor(data.id);
    },

    updateCursorHandler(data) {
        Editor.updateCursor(data.id, data);
    }
};