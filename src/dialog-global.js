/*
 * global loader (attaches Growl to the global window object)
 */

const debug = false;

// lazy load dialog and it's dependencies (on first invocation only)
import(/* webpackChunkName: "dialog-js" */ './dialog').then(function (dialogModule) {
    window.dialog = dialogModule;
    if (debug) console.debug('dialog-js loaded', typeof window.dialog);
});