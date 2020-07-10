/*
 * global loader (attaches Growl to the global window object)
 */

const debug = false;

// lazy load dialog and it's dependencies (on first invocation only)
import(/* webpackChunkName: "dialog" */ './dialog').then(function (dialogModule) {
    window.dialog = dialogModule;
    if (debug) console.debug('dialog loaded', typeof window.dialog);
});