window.gptp = window.gptp || {};
gptp = window.gptp;

gptp.logging = {

    name: 'gptp',

    log: function (message) {
        console.log(`[${this.name}]: `, message);
    },

    error: function (message) {
        console.error(`[${this.name}]: `, message);
    },

    warn: function (message) {
        console.warn(`[${this.name}]: `, message);
    }
};
