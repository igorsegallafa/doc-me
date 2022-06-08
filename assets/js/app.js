import "phoenix_html"
import "flowbite"

// Establish Phoenix Socket and LiveView configuration.
import {Socket} from "phoenix"
import {LiveSocket} from "phoenix_live_view"
import topbar from "../vendor/topbar"

import "./user_socket.js"

let csrfToken = document.querySelector("meta[name='csrf-token']").getAttribute("content")
let liveSocket = new LiveSocket("/live", Socket, {params: {_csrf_token: csrfToken}})

// Show progress bar on live navigation and form submits
topbar.config({barColors: {0: "#29d"}, shadowColor: "rgba(0, 0, 0, .3)"})
window.addEventListener("phx:page-loading-start", info => topbar.show())
window.addEventListener("phx:page-loading-stop", info => topbar.hide())

// Live Socket
liveSocket.connect()
window.liveSocket = liveSocket

window.onload = function() {
    updateTheme();

    let dropdownThemeItems = document.getElementsByClassName('dropdownThemeItem');
    Array.from(dropdownThemeItems).forEach((element) => {
        element.addEventListener('click', (event) => {
            if (event.target.innerText.includes("Dark")) {
                localStorage.theme = 'dark';
            }
            else if (event.target.innerText.includes("Light")) {
                localStorage.theme = 'light';
            }
            else {
                localStorage.removeItem('theme')
            }

            updateTheme();
        });
    });
}

let updateTheme = function() {
    // On page load or when changing themes, best to add inline in `head` to avoid FOUC
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark')
    } else {
        document.documentElement.classList.remove('dark')
    }
}