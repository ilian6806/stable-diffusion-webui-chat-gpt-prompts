window.gptp = window.gptp || {};
gptp = window.gptp;

gptp.core = (function () {

    let config = null;

    const DEFAULT_INSTRUCTIONS = `
        I want you to act as a Stable Diffusion Art Prompt Generator.
        The formula for a prompt is made of parts, the parts are indicated by brackets.
        The [Subject] is the person place or thing the image is focused on.
        [Emotions] is the emotional look the subject or scene might have.
        [Verb] is What the subject is doing, such as standing, jumping, working and other varied that match the subject.
        [Adjectives] like beautiful, rendered, realistic, tiny, colorful and other varied that match the subject.
        The [Environment] in which the subject is in, [Lighting] of the scene like moody, ambient, sunny, foggy and others that match the Environment and compliment the subject.
        [Photography type] like Polaroid, long exposure, monochrome, GoPro, fisheye, bokeh and others.
        And [Quality] like High definition, 4K, 8K, 64K UHD, SDR and other.
        The subject and environment should match and have the most emphasis.
        It is ok to omit one of the other formula parts. I will give you a [Subject], you will respond with 5 full prompts. Present the results as one full sentence, no line breaks, no delimiters, no  period, no quotes, 2 new lines after each answer, and keep it as concise as possible while still conveying a full scene.

        Examples:
        "Beautiful woman, contemplative and reflective, sitting on a bench, cozy sweater, autumn park with colorful leaves, soft overcast light, muted color photography style, 4K quality."
        "Fierce gladiators, intense and determined, clashing in battle, muscular and scarred, ancient Roman arena filled with spectators, harsh sunlight casting strong shadows, dynamic action shot, 8K ultra-realistic detail"
        "Commanding general, strategic and intense, orchestrating the siege from a vantage point, wearing ornate armor, overlooking a chaotic battlefield with tents and troops, dawn's first light creeping over hills, epic perspective, high-definition clarity, (digital art), (pov), (detailed)"
    `;

    function removeLeadingSpaces(text) {
        return text.split('\n').map(line => line.trimStart()).join('\n');
    }

    function doGenerate(e) {

        let prompt = document.getElementById('gptp-prompt').value;

        if (!prompt) {
            return;
        }

        console.log(e);
        console.log(config);
    }

    function toggleInstructions() {

        let instructions = document.getElementById('gptp-instructuions');
        let showBtnOff = document.getElementById('gptp-show-instructions-btn-off');
        let showBtnOn = document.getElementById('gptp-show-instructions-btn-on');

        if (instructions.style.display === 'none') {
            instructions.style.display = 'inline-block';
            showBtnOff.style.display = 'none';
            showBtnOn.style.display = 'inline-block';
        } else {
            instructions.style.display = 'none';
            showBtnOff.style.display = 'inline-block';
            showBtnOn.style.display = 'none';
        }
    }

    function showGPTDialog() {
        gptp.dialog.show({
            title: 'ChatGPT Prompts',
            content: `
                <div class="gptp-instructions">
                    <div>
                        <span>Show Instructions</span>
                        <svg id="gptp-show-instructions-btn-on" class="gptp-icon gptp-instructions-btn" viewBox="0 0 576 512">
                            <path d="M192 64C86 64 0 150 0 256S86 448 192 448l192 0c106 0 192-86 192-192s-86-192-192-192L192 64zm192 96a96 96 0 1 1 0 192 96 96 0 1 1 0-192z"/>
                        </svg>
                        <svg id="gptp-show-instructions-btn-off" class="gptp-icon gptp-instructions-btn" style="display: none;" viewBox="0 0 576 512">
                            <path d="M384 128c70.7 0 128 57.3 128 128s-57.3 128-128 128l-192 0c-70.7 0-128-57.3-128-128s57.3-128 128-128l192 0zM576 256c0-106-86-192-192-192L192 64C86 64 0 150 0 256S86 448 192 448l192 0c106 0 192-86 192-192zM192 352a96 96 0 1 0 0-192 96 96 0 1 0 0 192z"/>
                        </svg>
                    </div>
                </div>
                <textarea id="gptp-instructuions" class="gptp-prompt gptp-textarea gptp-scrollbar" style="display: none;" rows="20">${removeLeadingSpaces(DEFAULT_INSTRUCTIONS)}</textarea>
                <textarea id="gptp-prompt" class="gptp-prompt gptp-textarea gptp-scrollbar" placeholder="Type your prompt topic..." rows="4"></textarea>
            `,
            big: true,
            buttons: [
                {
                    text: 'Generate',
                    action: doGenerate,
                    className: 'gptp-button-danger',
                    dontClose: true
                }, {
                    text: 'Cancel'
                }
            ],
        }).bindEvents({
            click: {
                '.gptp-instructions-btn': toggleInstructions,
            }
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
