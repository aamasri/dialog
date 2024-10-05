/*
 * dialog.js
 * (c) 2020 Ananda Masri
 * Released under the MIT license
 * auro.technology/open-source/dialog
 */


import './dialog.styl';
import closeIcon from './close-icon.svg?src';
import fullscreenIcon from './fullscreen-icon.svg?src';


// module scope vars
const debug = false;
let loadUrlBusy;


/** launches a popup dialog configured by an options object
 *
 * @param {Object} options
 * @param {string|undefined} options.title - (optional) dialog title, source element title attribute (missing title => chromeless dialog)
 * @param {string|object|undefined} options.source - the content source: html content, selector, url(GET encoded data), or element
 * @param {string|undefined } options.fragment - (optional) selector by which to isolate a portion of the source HTML
 * @param {boolean|undefined} options.modal - (default false) page background dimming
 * @param {boolean|undefined} options.iframe - (default false) if the source is an url, whether to load it in an iFrame (adds a full-screen link to the source url)
 * @param {string|undefined} options.fullscreenUrl - (optional) forces a full-screen button (or for the case that fullscreen url differs from the source url)
 * @param {boolean|undefined} options.replace - (default true) whether to close any existing dialogs or layer up
 * @param {boolean|undefined} options.persistent - (default false) whether ESC/blur automatically closes the dialog
 * @param {function|string|undefined} options.onClose - (optional) function or eval(string) callback to execute after dialog dismissed
 * @param {string|undefined} options.classes - (optional) classes to apply to the dialog
 * @param {string|undefined} options.attributes - (optional) attributes to apply to the dialog
 *
 * @returns {Promise.<HTMLElement|Element|void>}
 */
const open = async function(options) {
    options = options || {};
    if (debug) console.debug('dialog.open invoked with options', options);

    if (throttleEvent())
        return;     // prevent multiple events from firing in quick succession

    const dialogId = 'dialog-' + generateHash(options);
    if (debug) console.log('id:', dialogId);
    if (document.querySelector(`#${dialogId}:not(.closing)`)) {
        if (debug) console.warn(`dialog with id "${dialogId}" already exists!`);
        return;
    }

    await loadDependencies(); // jquery and anime.js
    const $body = jQuery('body');

    if (!options.title && !options.source) {
        options.title = 'Dialog Cheat Sheet';
        options.source = usageInstructions;
    }

    let dialogBody;
    let dialogTitle = options.title || '';

    // autodetect if specified source is an url (ie starts with "http" or "/")
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
                dialogTitle = dialogTitle || sourceElement.title || '';
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
        closeAll(dialogId);     // close all existing dialogs (except identical to this one)

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
                        <div id="${dialogId}" class="dialog-box loading ${classes.join(' ')}" ${attributes} ${createdData} ${urlData}>
                            <div class="dialog-header">
                                <div class="title">${dialogTitle}</div>
                                <div class="icons">
                                    ${fullScreenIcon}
                                    <span class="icon-close">${closeIcon}</span>
                                </div>
                            </div>
                            
                            <div class="dialog-body">
                                ${(dialogBody || '<div class="dialog-loader">Loading <div class="dialog-progress-bar"></div></div>')}
                            </div>
                        </div>`);

    $dialog.appendTo($body);
    if (debug) console.debug(`dialog ${dialogId} appended to body`, $dialog.length);

    // apply z-index to modal underlay and dialog box
    const domUtils = await import(/* webpackChunkName: "dom-utils" */ '@aamasri/dom-utils');
    if (debug) console.debug('dom-utils loaded', typeof domUtils);
    const onTop = domUtils.onTopZIndex();
    if (onTop)
        $dialog.css('z-index', onTop);

    let $modal;
    if (options.modal) {
        $modal = $body.find(`data-url[${dialogId}]`);
        $dialog = $body.find(`#${dialogId}`);    // exclude the modal overlay div
    }

    initDialogListeners();   // dialog events: fullscreen, close (upon ESC, blur, close icon)

    if (options.onClose)
        bindCloseCallback($dialog, options.onClose);

    let openAnimation = openAnimateDialog($dialog);

    // fetch the url content
    if (sourceIsUrl && !useIframe) {
        // give urls a chance to load (with a timeout)
        if (loadUrlBusy) {
            console.warn('dialog cancelled because another dialog is loading');
            if ($modal)
                $modal.remove();

            $dialog.remove();
            return;
        }

        loadUrlBusy = window.setTimeout(() => {
            loadUrlBusy = false;
        }, 2000);


        // CORS compatible request (allows non SSL sites to access content from SSL sites)
        // with progress indicator
        const $progressBar = $dialog.find('.dialog-progress-bar');
        try {
            dialogBody = await jQuery.ajax({
                url: options.source,
                xhr: () => {
                    $progressBar.css('width', '40%');
                    const xhr = new window.XMLHttpRequest();
                    xhr.addEventListener('progress', evt => {
                        if (evt.lengthComputable) {
                            const loadProgress = evt.loaded / evt.total;
                            $progressBar.css('width', `${loadProgress * 100}%`);
                        }
                    }, false);
                    return xhr;
                }
            });

            // mimics jQuery.load fragment functionality: isolate the specified selector within the returned content
            if (options.fragment)
                dialogBody = jQuery(dialogBody).find(options.fragment).html();

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

        // allows us to test the url loading animation
        if (debug) await new Promise(r => setTimeout(r, 3000));

        loadUrlBusy = false;
        $dialog.find('.dialog-body').html(dialogBody);

        if (debug) console.debug('replace content:', $dialog.find('.dialog-body').html());

        // animate dialog open again as it's remotely loaded content is probably bigger
        openAnimation.pause();
        openAnimation = openAnimateDialog($dialog);
    }

    await openAnimation.finished;   // resolved on animation complete
    $dialog.find('.dialog-header .icons svg').fadeIn();     // this is really just to get Firefox to re-render them properly
    $dialog.removeClass('loading');     // fully loaded

    //if ($dialog.hasClass('remove-after-loaded'))
    //  close($dialog);     // close was requested before the dialog was fully loaded - we delayed it until now to prevent errors

    return $dialog[0];  // enables dialog element to be manipulated by invoker
}



function openAnimateDialog($dialog) {
    if (debug) console.debug(`openAnimateDialog `, $dialog[0].id);

    const $window = jQuery(window);

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

    // dialogs are initially hidden to allow measurement but prevent a flash of content
    $dialog[0].style.visibility = 'visible';

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
const closeAll = function(exceptId) {
    const dialogs = getAllDialogs(exceptId);
    const modals = getAllModals(exceptId);

    if (dialogs.length)
        dialogs.forEach((dialog) => {
            dialog.remove();
        });

    if (modals.length)
        modals.forEach((modal) => {
            modal.remove();
        });

    destroyDialogListeners();
}


/** close/destroy the topmost dialog
 * @returns {void}
 */
const closeLast = function() {
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
const close = function(dialog) {
    if (typeof dialog !== 'object' || dialog === null)
        return;
    else if (jQuery) {
        const $dialog = jQuery(dialog).closest('.dialog-box');
        if ($dialog.length)
            dialog = $dialog[0];
        else
            return;
    } else if (dialog instanceof Element) {
        dialog = dialog.closest('.dialog-box');
        if (dialog === null)
            return;
    }

    if (debug) console.debug(`  closing dialog`, dialog.id);

    // removing a dialog that's still opening/loading will cause js errors
    if (dialog.classList.contains('loading')) {
        dialog.classList.add('remove-after-loaded');
        if (debug) console.debug(`    cancelled because dialog is still loading`);
        return;
    }

    dialog.classList.add('closing');

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
        const relatedModal = getRelatedModal(dialog);
        if (relatedModal)
            relatedModal.remove();

        dialog.remove();
        destroyDialogListeners();
    });
}


function getAllDialogs(exceptId) {
    return document.querySelectorAll(`.dialog-box${exceptId ? `:not(#${exceptId})` : ''}`);
}

function getAllModals(exceptId) {
    return document.querySelectorAll(`.dialog-modal${exceptId ? ':not([data-for="' + exceptId +'"])' : ''}`);
}

function getRelatedModal(dialog) {
    return document.querySelector(`.dialog-modal[data-for="${dialog.id}"]`);
}

function getRelatedDialog(modal) {
    const dialogId = modal.getAttribute('data-for');
    return document.getElementById(dialogId);
}


// setup dialog blur event detection once (on the body element)
let blurHandlerBound = false;
function initDialogListeners() {
    if (blurHandlerBound)
        return;

    blurHandlerBound = true;
    jQuery(document).on('click', docClickHandler);
    jQuery(document).on('keydown', docKeyHandler);
}
function destroyDialogListeners() {
    if (!blurHandlerBound || getAllDialogs().length)
        return;     // handlers already destroyed or dialogs still open

    jQuery(document).off('click', docClickHandler);
    jQuery(document).off('keydown', docKeyHandler);
    blurHandlerBound = false;

    if (debug) console.debug(`destroyed dialog click and key event listeners`);
}


function docKeyHandler(event) {
    if (debug) console.debug(`key pressed`, event.key);
    if (event.key === 'Escape') {
        // ESC on a form input first blurs the form - then closes the top dialog
        if (document.activeElement && document.activeElement.nodeName !== "BODY") {
            if (debug) console.debug(`blurring`, document.activeElement.nodeName);
            document.activeElement.blur();
        } else
            closeLast();
    }
}

function docClickHandler(event) {
    if (throttleEvent())
        return;     // prevent multiple events from firing in quick succession

    const clicked = event.target;

    if (!clicked.parentNode)
        return;     // This ignores clicks on enclosed ckeditor content - which we can't always handle correctly

    if (debug)
        console.debug(`clicked on ${clicked.nodeName} "${(clicked.innerText || '').substring(0,10)}.."`, clicked, clicked.parentNode);

    // interacting with a dialog only closes any later/on-top dialogs
    const closestDialogBox = clicked.closest('.dialog-box');
    console.log(`  closest dialog`, closestDialogBox);
    if (closestDialogBox) {
        if (debug) console.debug(`  clicked on dialog`, closestDialogBox.id);
        const createdAt = closestDialogBox.getAttribute('data-created');

        getAllDialogs().forEach(dialog => {
            if (dialog.getAttribute('data-created') > createdAt)
                close(dialog);
        });

        if (clicked.closest('.icon-close')) {
            if (debug) console.debug(`  clicked on dialog close button`);
            close(closestDialogBox);
        }

        if (clicked.closest('.icon-fullscreen')) {
            const url = closestDialogBox.getAttribute('data-url');
            if (debug) console.debug(`  clicked on dialog fullscreen button`, url);
            window.open(url, '_self');
        }

        return;
    }

    // clicking on a modal overlay closes its related dialog, and all later/on-top dialogs/modals
    const closestModalOverlay = clicked.closest('.dialog-modal');
    if (closestModalOverlay) {
        const relatedDialog = getRelatedDialog(closestModalOverlay);
        if (relatedDialog) {
            if (debug) console.debug(`  clicked on modal for dialog`, relatedDialog.id);

            const createdAt = relatedDialog.getAttribute('data-created');

            getAllDialogs().forEach(dialog => {
                if (dialog.getAttribute('data-created') >= createdAt) {

                    // persistent dialogs don't close on blur
                    if (!dialog.classList.contains('persistent'))
                        close(dialog);
                }
            });
        } else
        if (debug) console.debug(`  clicked on a modal but it's related dialog is no longer in the DOM`);

        return;
    }

    closeLast();    // click was not on a dialog or modal
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




// lazy load jquery and anime.js
async function loadDependencies() {
    if (window.jQuery === undefined) {
        window.jQuery = await import(/* webpackChunkName: "jquery" */ 'jquery');
        window.jQuery = window.jQuery.default;
    }
    if (debug) console.debug('jQuery loaded', typeof window.jQuery);

    if (window.anime === undefined) {
        window.anime = await import(/* webpackChunkName: "anime" */ 'animejs/lib/anime.es.js');
        window.anime = window.anime.default;
    }
    if (debug) console.debug('anime.js loaded', typeof window.anime);
}




// used to suppress identical duplicate dialogs from opening in quick succession
function generateHash(object) {
    const json = JSON.stringify(object);

    let hash = 0;
    for (let i = 0; i < json.length; i++) {
        hash = ((hash << 5) - hash) + json.charCodeAt(i);
        hash = hash & hash; // Convert to 32bit integer
    }
    if (debug) console.log(`generateHash: ${hash} for\n`, json);
    // Return the hash
    return hash;
}


// prevent multiple events from firing in quick succession
let eventTimestamp = 0;
function throttleEvent() {
    const now = Date.now();
    if (debug) console.log('last event fired', Math.round((now - eventTimestamp)/1000), 'seconds ago');
    if ((eventTimestamp + 500) > now)
        return true;

    eventTimestamp = now;
    return false;
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