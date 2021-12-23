/*
 * dialog.js
 * (c) 2020 Ananda Masri
 * Released under the MIT license
 * auroraweb.ca/giving-back/dialog
 */

// TODO make busy into an npm package
const busy = {};
busy.start = () => {};
busy.stop = () => {};


import './dialog.styl';
import closeIcon from './close-icon.svg';
import fullscreenIcon from './fullscreen-icon.svg';


// module scope vars
const debug = false;
let loadUrlBusy;
let dialogCount = 0;
let $body;
let $window;


/** launches a popup dialog configured by an options object
 *
 * @param {Object} options
 * @param {string|undefined} options.title - (optional) dialog title, source element title attribute (missing title => chromeless dialog)
 * @param {string|object|undefined} options.source - the content source: html content, selector, url(GET encoded data), or element
 * @param {string|undefined } options.fragment - (optional) selector by which to isolate a portion of the source HTML
 * @param {boolean|undefined} options.modal - (default false) page background dimming
 * @param {boolean|undefined} options.iframe - (default false) if the source is a url, whether to load it in an iFrame (adds a full-screen link to the source url)
 * @param {string|undefined} options.fullscreenUrl - (optional) forces a full-screen button (or for the case that fullscreen url differs from the source url)
 * @param {boolean|undefined} options.replace - (default true) whether to close any existing dialogs or layer up
 * @param {boolean|undefined} options.persistent - (default false) whether ESC/blur automatically closes the dialog
 * @param {function|string|undefined} options.onClose - (optional) function or eval(string) callback to execute after dialog dismissed
 * @param {string|undefined} options.classes - (optional) classes to apply to the dialog
 * @param {string|undefined} options.attributes - (optional) attributes to apply to the dialog
 *
 * @returns {Promise}
 */
async function open(options) {
    options = options || {};

    if (debug) console.debug('dialog.open invoked with options', options);

    // lazy load dependencies
    if (window.jQuery === undefined) {
        window.jQuery = await import(/* webpackChunkName: "jquery" */ 'jquery');
        window.jQuery = window.jQuery.default;
    }

    if (debug) console.debug('jQuery loaded', typeof window.jQuery);

    if (window.anime === undefined) {
        window.anime = await import(/* webpackChunkName: "anime" */ 'animejs/lib/anime.es.js');
        window.anime = window.anime.default;
    }

    if (debug) console.debug('animejs loaded', typeof window.anime);

    const domUtils = await import(/* webpackChunkName: "dom-utils" */ '@aamasri/dom-utils');

    if (debug) console.debug('dom-utils loaded', typeof domUtils);

    $body = $body || domUtils.$cache().$body;
    $window = $window || domUtils.$cache().$window;

    if (!options.title && !options.source) {
        options.title = 'Dialog Cheat Sheet';
        options.source = usageInstructions;
    }

    // variables for constructing the dialog UI component
    let dialogId = `dialog-${++dialogCount}`;
    let dialogBody;
    let dialogTitle = options.title || '';

    // autodetect if specified source is a url (ie starts with "http" or "/")
    const sourceIsUrl = typeof options.source === 'string' && (/^https?:\/\/[a-z]+/.test(options.source) || /^\/[a-z]+/.test(options.source));

    let useIframe = options.iframe && sourceIsUrl || false;
    if (useIframe)
        dialogBody = `<iframe src="${options.source}"></iframe>`;

    // selector or raw content?
    if (!sourceIsUrl) {
        if (debug) console.debug(`not url`);  // non-url source

        try {
            const sourceElement = document.querySelector(options.source);
            if (debug) console.debug('source is an element');

            if (sourceElement) {
                dialogBody = sourceElement.innerHTML;
                dialogTitle = dialogTitle || elementTitle(sourceElement) || '';
            }

            if (debug) console.debug(`dialog title:${dialogTitle} \n\n body:${dialogBody}`);
        } catch (error) {
            // ignore error - just means options.source isn't a selector
            if (debug) console.debug(`source "${options.source}" is not a selector`);
        }

        dialogBody = dialogBody || options.source || '';
    }

    options.replace = typeof options.replace === 'undefined' || !!options.replace;  // default true
    if (options.replace)
        closeAll();     // close all existing dialogs

    // build the dialog UI
    const modalDiv = options.modal ? `<div class="dialog-modal" data-for="${dialogId}"></div>` : '';

    const urlData = (useIframe || options.fullscreenUrl) ? `data-url="${options.fullscreenUrl || options.source}"` : '';
    const createdData = `data-created="${Date.now()}"`;
    const fullScreenIcon = (useIframe || options.fullscreenUrl) ? `<span class="icon-fullscreen" title="Fullscreen">${fullscreenIcon}</span>` : '';

    let classes = [];
    if (useIframe) classes.push('has-iframe');
    if (!dialogTitle) classes.push('chromeless');
    if (options.persistent) classes.push('persistent');
    if (options.classes && typeof options.classes === 'string') classes.push(options.classes);

    const attributes = options.attributes || '';

    let $dialog = jQuery(`${modalDiv}
                            <div id="${dialogId}" class="dialog-box ${classes.join(' ')}" ${attributes} ${createdData} ${urlData}>
                                <div class="dialog-header">
                                    <div class="title">${dialogTitle}</div>
                                    <div class="icons">
                                        ${fullScreenIcon}
                                        <span class="icon-close">${closeIcon}</span>
                                    </div>
                                </div>
                                
                                <div class="dialog-body">
                                    ${(dialogBody || 'Loading •••')}
                                </div>
                            </div>`);

    $dialog.appendTo($body);

    // apply z-index to modal underlay and dialog box
    const onTop = domUtils.onTopZIndex();
    if (onTop)
        $dialog.css('z-index', onTop);


    if (options.modal)
        $dialog = $body.find(`#${dialogId}`);    // exclude the modal overlay div

    if (debug) console.debug(`dialog ${dialogId} appended to body`, $dialog.length);


    initDialogListeners();   // dialog events: fullscreen, close(ESC, blur, close icon)

    if (options.onClose)
        bindCloseCallback($dialog, options.onClose);

    let openAnimation = openAnimateDialog($dialog);

    // fetch the url content
    if (sourceIsUrl && !useIframe) {
        // give urls a chance to load (with a timeout)
        if (loadUrlBusy)
            throw 'dialog cancelled because another dialog is busy loading';

        loadUrlBusy = window.setTimeout(function () {
            loadUrlBusy = false;
        }, 5000);

        busy.start(`dialog.open ${dialogId}`);

        // jQuery.get() is CORS compatible (allows non SSL http://site to access SSL https://site eg. when login is SSL only)
        try {
            dialogBody = await jQuery.get(options.source);
            dialogBody = options.fragment ? jQuery(dialogBody).find(options.fragment).html() : dialogBody;		//if html fragment specified (mimics jQuery.load fragment functionality) then discard all but the specified selector content

            if (dialogBody.includes('<head')) {
                dialogBody = `<iframe src="${options.source}"></iframe>`;   // optimally the developer would have specified this option in the first place
                $dialog.addClass('has-iframe');
                console.warn('package @aamasri/dialog recommends using the "iframe" or "fragment" options when the loading a full HTML document!');
            }

        } catch (error) {
            if (error.responseText)
                dialogBody = error.responseText;    // backend error message
            else if (error.statusText)              // backend error status eg. 404 Not Found
                dialogBody = `Loading url ${options.source} failed with "${error.statusText}"`;
            else
                dialogBody = 'Loading url ${options.source} failed!';      // whoops - we've got no idea what went wrong
        }

        busy.stop(`dialog.open ${dialogId}`);
        loadUrlBusy = false;
        $dialog.find('.dialog-body').html(dialogBody);

        if (debug) console.debug('replace content:', $dialog.find('.dialog-body').html());

        // animate dialog open again as it's remotely loaded content is probably bigger
        openAnimation.pause();
        openAnimation = openAnimateDialog($dialog);
    }

    await openAnimation.finished;   // resolved on animation complete

    return $dialog[0];  // enables dialog element to be manipulated by invoker
}




function openAnimateDialog($dialog) {
    if (debug) console.debug(`openAnimateDialog `, $dialog[0].id);

    // dialog sizing
    const dialogWidth = $dialog.width();
    const dialogHeight = $dialog.height();
    const dialogArea = dialogHeight * dialogWidth;
    const windowWidth = $window.width();
    const windowHeight = $window.height();
    const windowArea = windowHeight * windowWidth;

    const large = dialogArea/windowArea > 0.3;
    if (large)
        $dialog.addClass('large');

    if (debug) console.debug(`area`, dialogArea/windowArea);

    // focus/select first input element of any form content
    const formInput = document.querySelector(`#${$dialog[0].id} .dialog-body input`);
    if (formInput) {
        formInput.focus();
        formInput.select();
    }

    const wide = (dialogWidth / windowWidth) > 0.8;   // avoid overshooting the viewport (hence 2 animations)
    const easing = wide || large ? 'cubicBezier(0.190, 1.000, 0.400, 1.000)' : 'easeOutElastic(1, 0.6)';

    if (debug) console.debug(`wide ${wide}`, dialogWidth / windowWidth);

    // launch animation
    const animeConfig = {
        targets: $dialog[0],
        translateX: [ '-50%', '-50%' ],
        translateY: [ '-50%', '-50%' ],
        scale: [ 0, 1 ],
        duration: 500,
        easing: easing
    };

    return anime(animeConfig);   // run open animation
}


function executeCallback(callback) {
    switch (typeof (callback)) {
        case 'function':
            callback();
            return;

        case 'string':
            try {
                eval(callback);
            } catch (error) {
                console.error('close callback failed with', error);
            }
    }
}



/** close/destroy all popup dialogs
 * @returns {void}
 */
function closeAll() {
    const dialogs = getAllDialogs();
    const modals = getAllModals();

    if (dialogs.length)
        dialogs.forEach((dialog) => {
            dialog.remove();
        });

    if (modals.length)
        modals.forEach((modal) => {
            modal.remove();
        });
}


/** close/destroy the topmost dialog
 * @returns {void}
 */
function closeLast() {
    const dialogs = getAllDialogs();
    if (dialogs.length) {
        const lastDialog = dialogs[dialogs.length - 1];

        // persistent dialogs don't close on blur
        if (!lastDialog.classList.contains('persistent'))
            close(lastDialog);
    }
}


/** close/destroy the specified popup dialog
 * @param {object|jQuery|HTMLElement|Element } dialog
 * @returns {void}
 */
function close(dialog) {
    const $dialog = jQuery(dialog).closest('.dialog-box');
    if (!$dialog.length)
        return;

    dialog = $dialog[0];

    if (debug) console.debug(`  closing dialog`, dialog.id);

    // click that launched a dialog shouldn't also remove it
    const createdAt = dialog.getAttribute('data-created');
    if ((Date.now() - createdAt) < 500) {
        if (debug) console.debug(`    cancelled because it's less than a second old`);
        return;
    }

    if (debug) console.debug(`    dialog is ${Date.now() - createdAt} mS old`);

    const relatedModal = getRelatedModal(dialog);

    // close dialog animation
    const animeConfig = {
        targets: dialog,
        translateX: [
            { value: [ '-50%', '-50%' ] }
        ],
        translateY: [
            { value: [ '-50%', '-50%' ] }
        ],
        scale: [
            { value: [ 1, 0 ] }
        ],
        opacity: [
            { value: [ 1, 0 ] }
        ],
        duration: 300,
        easing: 'linear'
    };

    anime(animeConfig).finished.then(() => {
        dialog.remove();

        if (relatedModal)
            relatedModal.remove();
    });

}


function getAllDialogs() {
    return document.querySelectorAll('.dialog-box');
}

function getAllModals() {
    return document.querySelectorAll('.dialog-modal');
}

function getRelatedModal(dialog) {
    return document.querySelector(`.dialog-modal[data-for="${dialog.id}"]`);
}

function getRelatedDialog(modal) {
    const dialogId = modal.getAttribute('data-for');
    return document.getElementById(dialogId);
}


// setup dialog blur event detection once (on body element)
let blurHandlerBound = false;
function initDialogListeners() {
    if (blurHandlerBound)
        return;

    blurHandlerBound = true;

    jQuery(document).on('click', (event) => {
        const $clicked = jQuery(event.target);

        if (debug) console.debug(`clicked on ${$clicked[0].nodeName} "${$clicked.text().substring(0,10)}.."`);

        // interacting with a dialog only closes any later/on-top dialogs
        const $closestDialogBox = $clicked.closest('.dialog-box');
        if ($closestDialogBox.length) {
            if (debug) console.debug(`  clicked on dialog`, $closestDialogBox[0].id);
            const createdAt = $closestDialogBox[0].getAttribute('data-created');

            getAllDialogs().forEach((dialog) => {
                if (dialog.getAttribute('data-created') > createdAt)
                    close(dialog);
            });

            if ($clicked.closest('.icon-close').length) {
                if (debug) console.debug(`  clicked on dialog close button`);
                close($closestDialogBox);
            }

            if ($clicked.closest('.icon-fullscreen').length) {
                const url = $closestDialogBox.data('url');
                if (debug) console.debug(`  clicked on dialog fullscreen button`, url);
                window.open(url, '_self');
            }

            return;
        }

        // clicking on a modal overlay closes it, it's related dialog and all later/on-top dialogs/modals
        const $closestModalOverlay = $clicked.closest('.dialog-modal');
        if ($closestModalOverlay.length) {
            const relatedDialog = getRelatedDialog($closestModalOverlay[0]);
            if (debug) console.debug(`  clicked on modal for dialog`, relatedDialog.id);

            const createdAt = relatedDialog.getAttribute('data-created');

            getAllDialogs().forEach((dialog) => {
                if (dialog.getAttribute('data-created') >= createdAt) {

                    // persistent dialogs don't close on blur
                    if (!dialog.classList.contains('persistent'))
                        close(dialog);
                }
            });

            return;
        }

        closeLast();    // click was not on a dialog or modal

    }).on('keydown', (event) => {
        if (debug) console.debug(`key pressed`, event.key);
        if (event.key === 'Escape') {
            // ESC on a form input first blurs the form - then closes the top dialog
            if (document.activeElement && document.activeElement.nodeName !== "BODY") {
                if (debug) console.debug(`blurring`, document.activeElement.nodeName);
                document.activeElement.blur();
            } else
                closeLast();
        }
    });
}



function bindCloseCallback($dialog, callback) {

// Create an observer instance linked to the callback function
    const observer = new MutationObserver((mutationsList) => {
        mutationsList.forEach((mutation) => {
            mutation.removedNodes.forEach((node) => {
                if ($dialog.is(jQuery(node))) {
                    if (debug) console.debug('dialog removed:', node);
                    executeCallback(callback);
                }
            });
        });
    });

// Start observing the target node for configured mutations
    observer.observe(document.querySelector('body'), { childList: true, subtree: true });
}




function elementTitle(element) {
    if (element instanceof jQuery)
        return element[0].title || element.data('title') || '';
    else
        return element.title || jQuery(element).data('title') || '';
}



const usageInstructions = `Usage instructions for developers: 
<pre style="color:#888; font-size: 12px;">
options object {
    title:      string              dialog title or source element title attribute
    source:     string | object     the content source: html content, selector, url, or element
    fragment:   selector            selector by which to isolate a portion of the source HTML
    modal:      boolean             page background dimming
    iframe:     boolean             if the source is a url, whether to load it in an iFrame
    replace:    boolean             whether to close any existing dialogs or layer up
    persistent: boolean             whether ESC/blur automatically closes the dialog
    onClose:    function | string   callback function or eval(string) to execute after dialog dismissed
    classes:    string              classes to apply to the dialog container element
    attributes: string              attributes to apply to the dialog container element eg. 'data-ignore-events="true"'
}
</pre>

<pre style="color: royalblue;  font-size: 12px;">
dialog.open(options).then(function() {
    console.log('dialog launched');
});
</pre>`;


export { open, close, closeLast, closeAll };