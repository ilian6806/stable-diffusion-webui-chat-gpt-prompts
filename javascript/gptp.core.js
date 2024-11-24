window.gptp = window.gptp || {};
gptp = window.gptp;

gptp.core = (function () {

    let config = null;

    function showGPTDialog() {
        gptp.dialog.show({
            title: 'ChatGPT Prompts',
            content: `
                <textarea id="gptp-prompt" class="gptp-prompt gptp-textarea" placeholder="Type your prompt topic..."></textarea>
            `,
            big: true,
            buttons: [
                {
                    text: 'Test',
                    action: () => alert('Test'),
                },
            ],
        });
    }

    function createHeaderButton(title, text, className, style, action) {

        const button = state.utils.html.create('button', {
            title: title,
            innerHTML: text,
            className: className,
        }, style);

        if (action) {
            button.addEventListener('click', action);
        }

        return button;
    }

    function loadUI() {
        let quickSettings = gradioApp().getElementById("quicksettings");
        let className = quickSettings.querySelector('button').className;
        quickSettings.appendChild(createHeaderButton('ChatGPT Prompts', "✨", className, {}, showGPTDialog));
    }

    function loadConfig() {
        fetch('/gptp/config.json?_=' + (+new Date()))
            .then(response => response.json())
            .then(jsonResponse => {
                config = jsonResponse;
            })
            .catch(error => state.logging.error(error));
    }

    function init() {
        loadUI();
        loadConfig();
    }

    return { init };
}());
