import "phoenix_html"
import "flowbite"

import {Socket} from "phoenix"
import {LiveSocket} from "phoenix_live_view"
import {Theme} from "./theme"
import {Document} from "./document"
import {Editor} from "./editor"

let csrfToken = document.querySelector("meta[name='csrf-token']").getAttribute("content");
let socket = new Socket("/socket", {params: {token: window.userToken}})
let liveSocket = new LiveSocket("/live", Socket, {params: {_csrf_token: csrfToken}});

liveSocket.connect();
socket.connect();

Theme.init();
Editor.init();
Document.init(socket);