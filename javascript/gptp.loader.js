
window.gptp = window.gptp || {};
gptp = window.gptp;

gptp.loader = (function() {

    const prefix = 'gptp';

    let loader = null;

    function getLoader() {
        if (!loader) {
            loader = document.createElement('div');
            loader.className = `${prefix}-spinner`;
            loader.innerHTML = `
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
            `;
        }
        return loader;
    }

    function show() {
        const container = document.body;
        const loader = getLoader();
        if (!container.contains(loader)) {
            container.appendChild(loader);
        }
        loader.style.display = 'block';
    }

    function hide() {
        const loader = getLoader();
        if (loader && loader.parentNode) {
            loader.style.display = 'none';
            loader.parentNode.removeChild(loader);
        }
    }

    return {
        getPrefix: () => prefix,
        show: show,
        hide: hide
    };
})();

document.addEventListener('DOMContentLoaded', function () {

    const style = document.createElement('style');
    const prefix = gptp.dialog.getPrefix();

    style.innerHTML = `

    .${prefix}-spinner {
        height: 70px;
        width: 70px;
        margin: -35px 0 0 -35px;
        position: fixed;
        top: 50%;
        left: 50%;
        z-index: 99999999;
    }

    .${prefix}-spinner > div {
        border-radius: 50%;
        position: absolute;
        border: calc(45px * 0.05) solid transparent;
        border-top-color: rgb(64, 65, 79);
        border-left-color: rgb(64, 65, 79);
        animation: ${prefix}-spinner-animation 2s infinite;
    }

    .${prefix}-spinner > div:nth-child(1) {
        height: calc(65px - 65px * 0.2 * 0);
        width: calc(65px - 65px * 0.2 * 0);
        top: calc(65px * 0.1 * 0);
        left: calc(65px * 0.1 * 0);
        animation-delay: calc(2000ms * 0.1 * 4);
        z-index: 5;
    }

    .${prefix}-spinner > div:nth-child(2) {
        height: calc(65px - 65px * 0.2 * 1);
        width: calc(65px - 65px * 0.2 * 1);
        top: calc(65px * 0.1 * 1);
        left: calc(65px * 0.1 * 1);
        animation-delay: calc(2000ms * 0.1 * 3);
        z-index: 4;
    }

    .${prefix}-spinner > div:nth-child(3) {
        height: calc(65px - 65px * 0.2 * 2);
        width: calc(65px - 65px * 0.2 * 2);
        top: calc(65px * 0.1 * 2);
        left: calc(65px * 0.1 * 2);
        animation-delay: calc(2000ms * 0.1 * 2);
        z-index: 3;
    }

    .${prefix}-spinner > div:nth-child(4) {
        height: calc(65px - 65px * 0.2 * 3);
        width: calc(65px - 65px * 0.2 * 3);
        top: calc(65px * 0.1 * 3);
        left: calc(65px * 0.1 * 3);
        animation-delay: calc(2000ms * 0.1 * 1);
        z-index: 2;
    }

    .${prefix}-spinner > div:nth-child(5) {
        height: calc(65px - 65px * 0.2 * 4);
        width: calc(65px - 65px * 0.2 * 4);
        top: calc(65px * 0.1 * 4);
        left: calc(65px * 0.1 * 4);
        animation-delay: calc(2000ms * 0.1 * 0);
        z-index: 1;
    }

    @keyframes ${prefix}-spinner-animation {
        50% {
            transform: rotate(360deg) scale(0.7);
        }
    }
    @-webkit-keyframes ${prefix}-spinner-animation {
        50% {
            transform: rotate(360deg) scale(0.7);
        }
    }
    @-moz-keyframes ${prefix}-spinner-animation {
        50% {
            transform: rotate(360deg) scale(0.7);
        }
    }
    @-o-keyframes ${prefix}-spinner-animation {
        50% {
            transform: rotate(360deg) scale(0.7);
        }
    }
    `;

    document.head.appendChild(style);
});