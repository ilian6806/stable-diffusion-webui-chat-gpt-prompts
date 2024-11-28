window.gptp = window.gptp || {};
gptp = window.gptp;

gptp.core = (function () {

    let config = null;

    const COMPLETIONS_URL = 'https://api.openai.com/v1/chat/completions';
    const DEEPL_URL = 'gptp/translate';

    const ROLE_TYPE_SYSTEM = 'system';
    const ROLE_TYPE_USER = 'user';

    const DISPLAY_NONE = 'none';
    const DISPLAY_INLINE_BLOCK = 'inline-block';

    const RESPONSE_SCHEMA = {
        'type': 'json_schema',
        'json_schema': {
            'name': 'sd_prompt_response',
            'strict': true,
            'schema': {
                'type': 'object',
                'properties': {
                    'success': {
                        'type': 'boolean'
                    },
                    'error': {
                        'type': 'string'
                    },
                    'prompts': {
                        'type': 'array',
                        'items': {
                            'type': 'string',
                        }
                    }
                },
                'required': [
                    'success',
                    'error',
                    'prompts'
                ],
                'additionalProperties': false
            }
        }
    };

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

    async function doGenerate() {

        let promptElement = document.getElementById('gptp-prompt');
        let instructionsElement = document.getElementById('gptp-instructuions');
        let prompt = promptElement.value;
        let instructions = instructionsElement.value;

        if (!prompt) {
            gptp.toastr.error('Please provide a prompt');
            return;
        }

        gptp.loader.show();

        if (isTranslationEnabled()) {

            const deeplResponsePromise = await fetch(DEEPL_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `DeepL-Auth-Key ${config.gptp_deepl_api_key}`
                },
                body: JSON.stringify({
                    'text': prompt,
                    'target_lang': 'EN'
                })
            });

            const deeplResponse = await deeplResponsePromise.json();

            if (deeplResponse.text) {
                prompt = deeplResponse.text;
                console.log('Translated prompt:', prompt);
                promptElement.value = prompt;
            } else {
                let error = deeplResponse.error || 'Failed to translate the prompt';
                console.error(error);
                gptp.toastr.error(error);
                gptp.loader.hide();
                return;
            }
        }

        const additionalInstructions = `
            Return "success": true if the prompt was successful, and "prompts": [array of 5 prompts] if successful.
            Return "success": false if the prompt was unsuccessful, and "prompts": [] if unsuccessful.
        `;

        const openAIResponsePromise = await fetch(COMPLETIONS_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.gptp_openai_api_key}`
            },
            body: JSON.stringify({
                model: config.gptp_openai_model,
                messages: [
                    {
                        role: ROLE_TYPE_SYSTEM,
                        content: instructions +  removeLeadingSpaces(additionalInstructions)
                    }, {
                        role: ROLE_TYPE_USER,
                        content: prompt
                    }
                ],
                response_format: RESPONSE_SCHEMA
            }),
        });

        const openAIResponse = await openAIResponsePromise.json();

        if (!openAIResponsePromise.ok) {
            let error = 'Failed to generate prompts';
            if (openAIResponse.error) {
                error = openAIResponse.error.message || openAIResponse.error;
            }
            console.error(error);
            gptp.toastr.error(error);
            gptp.loader.hide();
            return;
        }

        if (openAIResponse.choices &&
            openAIResponse.choices[0] &&
            openAIResponse.choices[0].message &&
            openAIResponse.choices[0].message.content
        ) {
            const content = JSON.parse(openAIResponse.choices[0].message.content);
            if (content.success) {
                document.getElementById('gptp-response').innerHTML = content.prompts.map(prompt => `
                    <div class="gptp-response-row">
                        <span>${prompt}</span>
                        <button onclick="gptp.core.applyPrompt(event)">Apply</button>
                    </div>
                `).join('');
            } else {
                document.getElementById('gptp-response').innerHTML = `
                    <div class="gptp-reponse-row">${content.error || 'No prompts can be generated.'}</div>
                `;
            }
        }

        gptp.loader.hide();
    }

    function toggleInstructions() {

        let instructions = document.getElementById('gptp-instructuions');
        let showBtnOff = document.getElementById('gptp-show-instructions-btn-off');
        let showBtnOn = document.getElementById('gptp-show-instructions-btn-on');

        if (instructions.style.display === DISPLAY_NONE) {
            instructions.style.display = DISPLAY_INLINE_BLOCK;
            showBtnOff.style.display = DISPLAY_NONE;
            showBtnOn.style.display = DISPLAY_INLINE_BLOCK;
        } else {
            instructions.style.display = DISPLAY_NONE;
            showBtnOff.style.display = DISPLAY_INLINE_BLOCK;
            showBtnOn.style.display = DISPLAY_NONE;
        }

        gptp.cache.set('toggle-instructions', showBtnOn.style.display === DISPLAY_INLINE_BLOCK ? 1 : 0);
    }

    function toggleTranslation() {

        let translateBtnOff = document.getElementById('gptp-show-translation-btn-off');
        let translateBtnOn = document.getElementById('gptp-show-translation-btn-on');

        if (translateBtnOff.style.display === DISPLAY_NONE) {
            translateBtnOff.style.display = DISPLAY_INLINE_BLOCK;
            translateBtnOn.style.display = DISPLAY_NONE;
        } else {
            translateBtnOff.style.display = DISPLAY_NONE;
            translateBtnOn.style.display = DISPLAY_INLINE_BLOCK;
        }

        gptp.cache.set('toggle-translation', translateBtnOn.style.display === DISPLAY_INLINE_BLOCK ? 1 : 0);
    }

    function isTranslationEnabled() {
        return (
            config.gptp_deepl_api_key &&
            config.gptp_deepl_api_key.trim().length &&
            document.getElementById('gptp-show-translation-btn-on').style.display === DISPLAY_INLINE_BLOCK
        );
    }

    function showGPTDialog() {

        let content = {
            instructions: gptp.cache.get('instructions') || removeLeadingSpaces(DEFAULT_INSTRUCTIONS),
            prompt: gptp.cache.get('prompt') || '',
            response: gptp.cache.get('response') || ''
        };

        let translateSwithchDisplay = config.gptp_deepl_api_key.trim().length ? 'inline-block' : 'none';

        gptp.dialog.show({
            title: 'ChatGPT Prompts',
            content: `
                <div class="gptp-instructions">
                    <div>
                        <div style="display: ${translateSwithchDisplay}">
                            <span>Translate Prompt</span>
                            <svg id="gptp-show-translation-btn-on" class="gptp-icon gptp-translation-btn" style="display: none;"  viewBox="0 0 576 512">
                                <path d="M192 64C86 64 0 150 0 256S86 448 192 448l192 0c106 0 192-86 192-192s-86-192-192-192L192 64zm192 96a96 96 0 1 1 0 192 96 96 0 1 1 0-192z"/>
                            </svg>
                            <svg id="gptp-show-translation-btn-off" class="gptp-icon gptp-translation-btn" viewBox="0 0 576 512">
                                <path d="M384 128c70.7 0 128 57.3 128 128s-57.3 128-128 128l-192 0c-70.7 0-128-57.3-128-128s57.3-128 128-128l192 0zM576 256c0-106-86-192-192-192L192 64C86 64 0 150 0 256S86 448 192 448l192 0c106 0 192-86 192-192zM192 352a96 96 0 1 0 0-192 96 96 0 1 0 0 192z"/>
                            </svg>
                        </div>
                        <span>Show Instructions</span>
                        <svg id="gptp-show-instructions-btn-on" class="gptp-icon gptp-instructions-btn" style="display: none;" viewBox="0 0 576 512">
                            <path d="M192 64C86 64 0 150 0 256S86 448 192 448l192 0c106 0 192-86 192-192s-86-192-192-192L192 64zm192 96a96 96 0 1 1 0 192 96 96 0 1 1 0-192z"/>
                        </svg>
                        <svg id="gptp-show-instructions-btn-off" class="gptp-icon gptp-instructions-btn" viewBox="0 0 576 512">
                            <path d="M384 128c70.7 0 128 57.3 128 128s-57.3 128-128 128l-192 0c-70.7 0-128-57.3-128-128s57.3-128 128-128l192 0zM576 256c0-106-86-192-192-192L192 64C86 64 0 150 0 256S86 448 192 448l192 0c106 0 192-86 192-192zM192 352a96 96 0 1 0 0-192 96 96 0 1 0 0 192z"/>
                        </svg>
                    </div>
                </div>
                <textarea id="gptp-instructuions" class="gptp-prompt gptp-textarea gptp-scrollbar" style="display: none;" rows="20">${content.instructions}</textarea>
                <textarea id="gptp-prompt" class="gptp-prompt gptp-textarea gptp-scrollbar" placeholder="Type your prompt topic..." rows="4">${content.prompt}</textarea>
                <div id="gptp-response">${content.response}</div>
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
            onBeforeClose: function () {
                gptp.loader.hide();
                gptp.cache.set('instructions', document.getElementById('gptp-instructuions').value);
                gptp.cache.set('response', document.getElementById('gptp-response').innerHTML);
                gptp.cache.set('prompt', document.getElementById('gptp-prompt').value);
            }
        }).bindEvents({
            click: {
                '.gptp-instructions-btn': toggleInstructions,
                '.gptp-translation-btn': toggleTranslation
            },
            input: {
                '.gptp-prompt': function () {
                    gptp.cache.set('prompt', this.value);
                },
                '.gptp-instructuions': function () {
                    gptp.cache.set('instructions', this.value);
                }
            }
        });
        if (gptp.cache.get('toggle-instructions')) {
            toggleInstructions();
        }
        if (gptp.cache.get('toggle-translation')) {
            toggleTranslation();
        }
    }

    function applyPrompt(e) {
        gptp.dialog.hide();
        const button = e.target;
        const previousSibling = button.previousElementSibling;
        const prompt = previousSibling.textContent;
        gradioApp().querySelector("#txt2img_prompt textarea").value = prompt;
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

    return { init, applyPrompt };
}());
