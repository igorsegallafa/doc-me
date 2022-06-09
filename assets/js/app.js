import "phoenix_html"
import "flowbite"

import {Socket} from "phoenix"
import {LiveSocket} from "phoenix_live_view"
import {Theme} from "./theme"

import "./user_socket.js"

let csrfToken = document.querySelector("meta[name='csrf-token']").getAttribute("content");
let liveSocket = new LiveSocket("/live", Socket, {params: {_csrf_token: csrfToken}});

// Live Socket
liveSocket.connect();
window.liveSocket = liveSocket;

Theme.init();