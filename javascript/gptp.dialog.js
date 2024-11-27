
window.gptp = window.gptp || {};
gptp = window.gptp;

gptp.dialog = (function() {

    const prefix = 'gptp';

    let mainContainer = null;
    let onClose = null;
    let onBeforeClose = null;

    let conatinerMethods = {

        find: function (selector) {
            if (!mainContainer) {
                return null;
            }
            return mainContainer.querySelector(selector);
        },

        bindEvents: function (map) {
            for (let eventType in map) {
                for (let selector in map[eventType]) {
                    const handler = map[eventType][selector];
                    const elements = mainContainer.querySelectorAll(selector);
                    console.log(elements)
                    elements.forEach(element => element.addEventListener(eventType, handler));
                }
            }
        }
    };

    function getContainer() {
        if (!mainContainer) {
            mainContainer = document.createElement('div');
            mainContainer.id = prefix + '-dialogs-container';
            document.body.appendChild(mainContainer);
        }
        return mainContainer;
    }

    function getContent(opt) {
        return `
            <div id="${prefix}-${opt.id}-modal" class="${prefix}-modal" tabindex="-100">
                <div class="${prefix}-modal-header">
                    <h5 class="${prefix}-modal-title"></h5>
                </div>
                <div id="${prefix}-${opt.id}-modal-content" class="${prefix}-modal-content ${prefix}-scrollbar"></div>
                <div class="${prefix}-modal-footer"></div>
            </div>
        `;
    }

    function getButton(btnOpt) {
        const id = btnOpt.id ? ` id="${btnOpt.id}-modal-btn" ` : '';
        const className = btnOpt.className ? btnOpt.className : '';
        const text = btnOpt.text;
        return `<button ${id} type="button" class="button ${className}">${text}</button>`;
    }

    function close() {

        if (onBeforeClose && typeof onBeforeClose === 'function') {
            onBeforeClose();
        }

        const container = getContainer();
        container.classList.remove('open');
        const modal = container.querySelectorAll(`div.${prefix}-modal`);
        modal.forEach(m => m.parentNode.removeChild(m));

        if (onClose && typeof onClose === 'function') {
            onClose();
        }
    }

    function onFooterBtnClick(data, event) {
        if (data.action && typeof data.action === 'function') {
            data.action(data.params || []);
        }
        if (!data.dontClose) {
            close();
        }
    }

    function show(opt) {

        onClose = null;
        onBeforeClose = null;
        close();

        if (typeof opt === 'string') {
            opt = {
                content: opt
            };
        }

        if (!opt.id) {
            opt.id = 'd' + new Date().getTime();
        }

        onClose = opt.onClose && typeof opt.onClose === 'function' ? opt.onClose : null;
        onBeforeClose = opt.onBeforeClose && typeof opt.onBeforeClose === 'function' ? opt.onBeforeClose : null;

        const container = getContainer();
        container.innerHTML = getContent(opt);

        const dialogId = `${prefix}-${opt.id}-modal`;
        const dialog = document.getElementById(dialogId);

        dialog.addEventListener('click', event => event.stopPropagation());

        if (opt.big || opt.imageSrc) {

            const windowHeight = window.innerHeight;
            const minHeight = parseInt(windowHeight * 0.8) - 100;
            const top = parseInt(windowHeight * 0.08);

            dialog.style.top = `${top}px`;
            if (!opt.dontStretch) {
                dialog.querySelector(`.${prefix}-modal-content`).style.minHeight = `${minHeight}px`;
            }
            dialog.classList.add(`${prefix}-modal-big`);

            if (opt.imageSrc) {
                const content = dialog.querySelector(`.${prefix}-modal-content`);
                content.style.backgroundImage = `url(${opt.imageSrc})`;
                content.style.backgroundSize = 'contain';
                content.style.backgroundRepeat = 'no-repeat';
                content.style.backgroundPosition = 'center center';
            }
        }

        if (opt.maxWidth) {
            dialog.style.maxWidth = opt.maxWidth;
        }

        if (opt.width) {
            dialog.style.width = opt.width;
        }

        if (opt.top) {
            dialog.style.top = opt.top;
        }

        dialog.querySelector(`.${prefix}-modal-title`).innerHTML = opt.title || '';
        dialog.querySelector(`.${prefix}-modal-content`).innerHTML = opt.content || opt.text || '';
        dialog.style.display = 'block';

        container.classList.add('open');

        if (!opt.title) {
            const modalHeader = dialog.querySelector(`.${prefix}-modal-header`);
            if (modalHeader) {
                modalHeader.style.display = 'none';
            }
            dialog.querySelector(`.${prefix}-modal-content`).style.padding = '30px 20px';
        }

        const footer = dialog.querySelector(`.${prefix}-modal-footer`);
        footer.innerHTML = '';

        if (!opt.disableOverlay) {
            container.addEventListener('click', close);
        } else {
            container.removeEventListener('click', close);
        }

        if (!opt.buttons || !opt.buttons.length) {
            opt.buttons = [{
                text: 'Ok'
            }];
        }

        opt.buttons.forEach(btnOpt => {
            if (!btnOpt.id) {
                btnOpt.id = 'b' + Math.floor(Math.random() * 1000000);
            }
            const buttonHTML = getButton(btnOpt);
            footer.insertAdjacentHTML('beforeend', buttonHTML);
            const button = footer.querySelector(`#${btnOpt.id}-modal-btn`);
            button.addEventListener('click', event => onFooterBtnClick(btnOpt, event));
        });

        return conatinerMethods;
    }

    function showConfirm(text, action) {
        return show({
            id: 'main-confirmation',
            title: 'Confirmation',
            content: text,
            buttons: [
                {
                    text: 'Yes',
                    className: 'danger',
                    action: action
                }, {
                    text: 'No'
                }
            ]
        });
    }

    function showImage(src, title, buttons, maxWidth) {
        return show({
            id: 'image-dialog',
            imageSrc: src,
            big: true,
            maxWidth: maxWidth || null,
            title: title || null,
            buttons: buttons || null
        });
    }

    function showError(message) {
        return show({
            id: 'error-dialog',
            title: 'Error',
            content: message,
        });
    }

    function hide() {
        close();
    }

    return {
        show: show,
        hide: hide,
        confirm: showConfirm,
        image: showImage,
        error: showError,
        getPrefix: () => prefix
    };
})();


document.addEventListener('DOMContentLoaded', function () {

    const style = document.createElement('style');
    const prefix = gptp.dialog.getPrefix();

    style.innerHTML = `

    #${prefix}-dialogs-container {
        position: relative;
        height: 0;
        background-color: transparent;
        transition: background-color 0.2s;
    }

    #${prefix}-dialogs-container.open {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1000;
        background-color: rgba(0, 0, 0, 0.2);
    }

    #${prefix}-dialogs-container > div.${prefix}-modal {
        display: none;
        position: fixed;
        top: 30%;
        left: 0;
        right: 0;
        width: 300px;
        max-width: 90%;
        height: auto;
        margin: auto;
        color: rgba(236,236,241,1);
        border-radius: 8px;
        border: 1px solid black;
        background-color: #222;
        box-shadow: 0 0 15px 12px rgba(0,0,0,.2);
        overflow: hidden;
        z-index: 2000;
    }

    #${prefix}-dialogs-container > div.${prefix}-modal.${prefix}-modal-big {
        font-size: 16px;
        max-width: 75vw;
        width: 95%;
        top: 10%;
    }

    #${prefix}-dialogs-container > div.${prefix}-modal.${prefix}-modal-big .${prefix}-modal-content {
        max-height: 50vh;
    }

    #${prefix}-dialogs-container > div.${prefix}-modal.${prefix}-modal-big .${prefix}-modal-footer button {
        min-width: 150px;
    }

    #${prefix}-dialogs-container .${prefix}-modal-header, #${prefix}-dialogs-container .${prefix}-modal-footer {
        text-align: center;
    }

    #${prefix}-dialogs-container .${prefix}-modal-header {
        padding: 10px 10px;
        background-color: rgba(255,255,255,.1);
    }

    #${prefix}-dialogs-container .${prefix}-modal-header h5 {
        margin: 0;
        padding: 0;
        font-size: 18px;
        font-weight: normal;
    }

    #${prefix}-dialogs-container .${prefix}-modal-footer {
        padding: 5px 10px;
    }

    #${prefix}-dialogs-container .${prefix}-modal-content {
        padding: 20px;
        max-height: 250px;
        overflow-y: scroll;
    }

    #${prefix}-dialogs-container .${prefix}-modal-content::-webkit-scrollbar {
        width: 5px;
        height: 5px;
    }

    #${prefix}-dialogs-container button {
        border-radius: 5px;
        padding: 5px 15px;
        margin: 5px 7px;
        background: rgba(255,255,255,.2);
        color: rgba(236,236,241,1);
        border: 1px solid black;
        font-size: 16px;
        opacity: 1;
        cursor: pointer;
    }

    #${prefix}-dialogs-container .${prefix}-modal-footer button {
        min-width: 40%;
    }

    #${prefix}-dialogs-container button:hover {
        opacity: 0.8;
    }

    #${prefix}-dialogs-container button.${prefix}-button-danger {
        background: #df4c73;
    }

    #${prefix}-dialogs-container .${prefix}-modal-content input[type="text"],
    #${prefix}-dialogs-container .${prefix}-modal-content textarea {
        background-color: rgb(64, 65, 79);
        border-radius: .375rem;
        border: none;
        outline: none;
        padding: 8px;
        color: rgba(236,236,241,1);
        font-size: 14px;
        box-sizing: border-box;
    }
    `;

    document.head.appendChild(style);
});