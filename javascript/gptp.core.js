window.gptp = window.gptp || {};
gptp = window.gptp;

gptp.core = (function () {

    function showGPTDialog() {
        gptp.dialog.show({
            title: 'ChatGPT Prompts',
            content: 'This is a dialog content',
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

    function init() {
        loadUI();
    }

    return { init };
}());
