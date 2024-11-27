
window.gptp = window.gptp || {};
gptp = window.gptp;

gptp.cache = (function() {

    const prefix = 'gptp';
    const storage = window.sessionStorage;

    function set(key, value) {
        storage.setItem(`${prefix}-${key}`, JSON.stringify(value));
    }

    function get(key) {
        return JSON.parse(storage.getItem(`${prefix}-${key}`));
    }

    return {
        getPrefix: () => prefix,
        set: set,
        get: get
    };
})();
