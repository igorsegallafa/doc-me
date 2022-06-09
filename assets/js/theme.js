function setupTheme() {
    let dropdownThemeItems = document.getElementsByClassName('dropdownThemeItem');
    Array.from(dropdownThemeItems).forEach((element) => {
        element.addEventListener('click', (event) => {
            if (element.innerText.includes("Dark")) {
                localStorage.theme = 'dark';
            }
            else if (element.innerText.includes("Light")) {
                localStorage.theme = 'light';
            }
            else {
                localStorage.removeItem('theme')
            }

            updateTheme();
        });
    });

    updateTheme();
}

function updateTheme() {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark')
    } else {
        document.documentElement.classList.remove('dark')
    }
}

export var Theme = {
    init: function() {
        setupTheme();
    }
};