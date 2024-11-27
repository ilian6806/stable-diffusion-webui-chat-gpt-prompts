
window.gptp = window.gptp || {};
gptp = window.gptp;

gptp.toastr = (function() {

    const prefix = 'gptp';

    const timeout = 3000;
    const timeoutLong = 6000;

    const TOAST_TYPE_SUCCESS = 'success';
    const TOAST_TYPE_ERROR = 'error';
    const TOAST_TYPE_WARNING = 'warning';
    const TOAST_TYPE_INFO = 'info';

    let container = null;

    function getContainer() {
        if (!container) {
            container = document.createElement('div');
            container.className = `${prefix}-toast-container`;
            document.body.appendChild(container);
        }
        return container;
    }

    function createToast(type, message) {
        const toast = document.createElement('div');
        toast.className = `${prefix}-toast ${prefix}-${type}`;
        toast.innerHTML = message;

        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 500);
        }, type === TOAST_TYPE_ERROR ? timeoutLong : timeout);

        return toast;
    }

    function showToast(type, message) {
        const container = getContainer();
        const toast = createToast(type, message);
        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('fade-in');
        }, 1);
    }

    return {
        getPrefix: () => prefix,
        success: (msg) => showToast(TOAST_TYPE_SUCCESS, msg),
        error: (msg) => showToast(TOAST_TYPE_ERROR, msg),
        warning: (msg) => showToast(TOAST_TYPE_WARNING, msg),
        info: (msg) => showToast(TOAST_TYPE_INFO, msg)
    };

})();

document.addEventListener('DOMContentLoaded', function () {

    const style = document.createElement('style');
    const prefix = gptp.toastr.getPrefix();

    style.innerHTML = `

    .${prefix}-toast-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 99999999;
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-width: 400px;
        overflow-x: hidden;
    }

    .${prefix}-toast {
        min-width: 200px;
        padding: 15px 20px;
        color: #fff;
        border-radius: 5px;
        box-shadow: 0 0 10px rgba(0,0,0,0.1);
        opacity: 0;
        transition: opacity 0.5s;
    }

    .${prefix}-success {
        background-color: #4caf50;
    }

    .${prefix}-error {
        background-color: #f44336;
    }

    .${prefix}-warning {
        background-color: #ff9800;
    }

    .${prefix}-info {
        background-color: #2196f3;
    }

    .${prefix}-toast.fade-in {
        opacity: 1;
    }

    .${prefix}-toast.fade-out {
        opacity: 0;
    }
    `;

    document.head.appendChild(style);
});
