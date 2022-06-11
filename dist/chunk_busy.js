/*!
 * 
 *  dialog package version 1.5.0
 *  (c) 2020 Ananda Masri
 *  Released under the MIT license
 *  auro.technology/open-source/dialog
 *
 */
(self["webpackChunk_aamasri_dialog"] = self["webpackChunk_aamasri_dialog"] || []).push([["busy"],{

/***/ "./node_modules/@aamasri/busy/src/busy.js":
/*!************************************************!*\
  !*** ./node_modules/@aamasri/busy/src/busy.js ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "queue": () => (/* binding */ queue),
/* harmony export */   "reset": () => (/* binding */ reset),
/* harmony export */   "start": () => (/* binding */ start),
/* harmony export */   "status": () => (/* binding */ status),
/* harmony export */   "stop": () => (/* binding */ stop)
/* harmony export */ });
/* harmony import */ var _busy_styl__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./busy.styl */ "./node_modules/@aamasri/busy/src/busy.styl");
/* harmony import */ var _busy_styl__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_busy_styl__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _aamasri_dom_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @aamasri/dom-utils */ "./node_modules/@aamasri/dom-utils/dom-utils.js");
/**
 * @fileOverview busy animation
 * @author Ananda Masri
 * @version 1.0.0
 */

const debug = false;




let $busyAnimation = false;
let $modalOverlay = false;
const queue = [];



// start loading animation
async function start(id, timeout=7, modal=false) {
    id = id ? id.replace(/'/g, '') : '';	// strip any single quotes from id
    timeout = (typeof timeout === 'number') ? timeout * 1000 : 7000;
    const expiry = Date.now() + timeout;

    queue.push({ id: id, expiry: expiry, modal: modal });     // allows matching id to be stopped

    if (!$busyAnimation) {
        // lazy load dependencies
        if (window.jQuery === undefined) {
            window.jQuery = await __webpack_require__.e(/*! import() | jquery */ "jquery").then(__webpack_require__.t.bind(__webpack_require__, /*! jquery */ "./node_modules/jquery/dist/jquery.js", 23));
            window.jQuery = window.jQuery.default;
        }

        if (debug) console.debug('jQuery loaded', typeof window.jQuery);


        const isInIframe = window.location !== window.parent.location;		// detects whether we're in an iframe
        const $body = jQuery(isInIframe ? parent.document.body : document.body);

        // title for debugging only
        $modalOverlay = jQuery(`<div id="animated-loader-modal-overlay"></div>`).appendTo($body);
        $busyAnimation = jQuery(`<div id="animated-loader" title="${id}">
                                            <div>
                                                <div>
                                                    <div>
                                                        <div>
                                                            <div>
                                                                <div>
                                                                    <div>
                                                                        <div>
                                                                            <div>
                                                                                <div></div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>`).appendTo($body);
    }

    $busyAnimation.stop().css('z-index', (0,_aamasri_dom_utils__WEBPACK_IMPORTED_MODULE_1__.onTopZIndex)()).fadeIn();

    if (modal)
        $modalOverlay.fadeTo('slow', 0.4);

    window.setTimeout(`busy.stop()`, timeout);   // dequeue
}




// stop loading animation
function stop(id) {
    if (!queue.length)
        return;

    id = id ? id.toString().replace(/'/g, '') : '';	// strip any single quotes from id
    let arrayIndex;

    // pop specified busy id off queue
    if (id) {
        arrayIndex = queue.findIndex(busyItem => busyItem.id === id);
        if (arrayIndex > -1) {
            if (debug) console.debug(`busy item "${queue[arrayIndex].id}" completed before timeout!`);
            queue.splice(arrayIndex, 1);
        }
    }

    // find any expired busy item
    arrayIndex = queue.findIndex(busyItem => busyItem.expiry <= Date.now());
    if (arrayIndex > -1) {
        console.warn(`busy indication timed out waiting for "${queue[arrayIndex].id}" to finish!`);
        queue.splice(arrayIndex, 1);
    }

    // kill modal overlay if no modal items left in queue
    arrayIndex = queue.findIndex(busyItem => busyItem.modal);
    if (arrayIndex === -1)
        _hideModalOverlay();

    if (queue.length === 0) {
        _hideModalOverlay();
        $busyAnimation.stop().fadeOut('fast');		// stop the busy animation now that the server has responded
    }
}



function _hideModalOverlay() {
    if ($modalOverlay.css('display') === 'none')
        return;

    $modalOverlay.fadeOut('fast', function() {
        $modalOverlay.css('opacity', 0);
    });
}



// clear the busy queue and stop the busy animation
function reset() {
    window.setTimeout(function() {
        queue.length = 0;
        if ($busyAnimation && $busyAnimation.length)
            $busyAnimation.stop().fadeOut('fast');
    }, 1000);
}




// debug the busy animation queue
function status() {
    console.log('busy queue:', queue);
}




/***/ }),

/***/ "./node_modules/@aamasri/busy/src/busy.styl":
/*!**************************************************!*\
  !*** ./node_modules/@aamasri/busy/src/busy.styl ***!
  \**************************************************/
/***/ (() => {

throw new Error("Module parse failed: Identifier directly after number (5:11)\nYou may need an appropriate loader to handle this file type, currently no loaders are configured to process this file. See https://webpack.js.org/concepts#loaders\n| green = rgba(0, 255, 0, 0.5)\n| blue = rgba(0, 0, 255, 0.5)\n> width = 120px\n| animation = rotate2 10s cubic-bezier(0.1, 0.7, 1, 0.1) infinite\n| ");

/***/ }),

/***/ "./node_modules/@aamasri/dom-utils/dom-utils.js":
/*!******************************************************!*\
  !*** ./node_modules/@aamasri/dom-utils/dom-utils.js ***!
  \******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "$cache": () => (/* binding */ $cache),
/* harmony export */   "getAppliedStyle": () => (/* binding */ getAppliedStyle),
/* harmony export */   "getViewportOffset": () => (/* binding */ getViewportOffset),
/* harmony export */   "getZIndex": () => (/* binding */ getZIndex),
/* harmony export */   "hash": () => (/* binding */ hash),
/* harmony export */   "isInIframe": () => (/* binding */ isInIframe),
/* harmony export */   "isMobile": () => (/* binding */ isMobile),
/* harmony export */   "isTouchDevice": () => (/* binding */ isTouchDevice),
/* harmony export */   "isVisible": () => (/* binding */ isVisible),
/* harmony export */   "loaded": () => (/* binding */ loaded),
/* harmony export */   "onTopZIndex": () => (/* binding */ onTopZIndex),
/* harmony export */   "ready": () => (/* binding */ ready),
/* harmony export */   "screenResolution": () => (/* binding */ screenResolution),
/* harmony export */   "webpSupport": () => (/* binding */ webpSupport)
/* harmony export */ });
/**
 * @fileOverview A collection of DOM utils to add syntactic sugar and supplement jQuery.
 * @author Ananda Masri
 * @version 1.0.4
 */



/**
 * Defer execution until after document ready.
 *
 * Usage:
 *     import { ready } from 'dom-utils';
 *     ready().then(function() { ... });
 */
const ready = () => new Promise((resolve) => {
	if (document.readyState !== 'loading')
		resolve($cache());
	else
		document.addEventListener('DOMContentLoaded', () => {
			resolve($cache());
		});
});


/**
 * Defer execution until after window has fully loaded (including images).
 *
 * Usage:
 * 	   import { loaded } from 'dom-utils';
 *     loaded().then(function() { ... });
 */
const loaded = () => new Promise((resolve) => {
	if (document.readyState === 'complete')
		resolve($cache());
	else
		window.addEventListener('load', () => {
			resolve($cache());
		});
});




// jQuery selector cache
/**
 * Caches the jQuery window, document, & body elements.
 *
 * @returns {Object}
 */
const selectorCache = {};
function $cache() {
	if (selectorCache.hasOwnProperty('$body') && selectorCache.$body.length)
		return selectorCache;

	selectorCache.$window = jQuery(window);
	selectorCache.$document = jQuery(document);
	selectorCache.$body = jQuery('body');

	return selectorCache;
}



/**
 * Whether the current window is actually a child window (contained in an iframe).
 *
 * @returns {boolean}
 */
function isInIframe() {
	return window.location !== window.parent.location;
}


/**
 * Whether this device has a touch screen.
 *
 * @returns {boolean}
 */
let cachedIsTouchDevice;
function isTouchDevice() {
	if (typeof cachedIsTouchDevice === 'boolean')
		return cachedIsTouchDevice;

	if (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
		cachedIsTouchDevice = true;
		return cachedIsTouchDevice;
	}

	// include the 'heartz' as a way to have a non matching MQ to help terminate the join
	// https://git.io/vznFH
	const mq = function (query) {
		cachedIsTouchDevice = window.matchMedia(query).matches;
		return cachedIsTouchDevice;
	};

	const prefixes = ' -webkit- -moz- -o- -ms- '.split(' ');
	const query = ['(', prefixes.join('touch-enabled),('), 'heartz', ')'].join('');
	cachedIsTouchDevice = !!mq(query);
	return cachedIsTouchDevice;
}





/**
 * Whether this device is a recognized mobile device.
 *
 * @returns {boolean}
 */
function isMobile() {
	return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase());
}





/**
 * Whether the specified element is visible (ie. css display/visibility/opacity and viewport scroll position).
 *
 * @param {Element | Node | ParentNode | jQuery} el
 * @returns {boolean}
 */
function isVisible(el) {
    if (!el instanceof Object)
        return false;

	if (el instanceof jQuery)
		el = el[0];

	//is object hidden
	if (getAppliedStyle(el, 'display') === 'none' || getAppliedStyle(el, 'visibility') === 'hidden' || parseFloat(getAppliedStyle(el, 'opacity')) < 0.1)
		return false;

    try {
		const rect = el.getBoundingClientRect();
		return (
			rect.top >= 0 &&
			rect.left >= 0 &&
			rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
			rect.right <= (window.innerWidth || document.documentElement.clientWidth)
		);

	} catch (error) {
        console.warn('dom-utils.isVisible(el) threw error', error);
        return false;
    }
}





/** Returns the specified element's offset from the visible viewport.
 *
 * @param {Element | Node | ParentNode | jQuery} $element
 * @returns {Object | undefined}
 */
function getViewportOffset($element) {
	$element = jQuery($element);	// convert to all element types to jQuery
	if (!$element.length) {
		console.error('function getViewportOffset(element) expects a DOM element or jQuery object!');
		return undefined;
	}

	let offset;
	try {
		offset = $element.offset();
	} catch (error) {
		console.error('function getViewportOffset(element) could not determine the element offset!');
		return undefined;
	}

	const $win = $cache().$window;

	const left = offset.left - $win.scrollLeft();
	const top = offset.top - $win.scrollTop();
	const right = $win.outerWidth() - left - $element.outerWidth();
	const bottom = $win.height() - top - $element.outerHeight();

	return { top, right, bottom, left };
}




/** Get the highest z-index in the document.
 *
 * @returns {number}
 */
function onTopZIndex() {
	let zTop = 0;
	const elements = document.getElementsByTagName('*');

	for (let i = 0; i < elements.length; i++) {
		let zIndex = getZIndex(elements[i]);

		if (zIndex && zIndex > zTop)
			zTop = zIndex;
	}

	return zTop;
}





/**
 * Get the z-index of the the specified element.
 * The recursive option will traverse the parent tree (z-index includes descendents)
 *
 * @param {Element | Node | ParentNode} element
 * @param {boolean} [recursive=false] - whether to traverse parents in search of z-index
 * @returns {number} - the z-index
 */
function getZIndex(element, recursive=false) {
	let zIndex = getAppliedStyle(element, 'z-Index') || 0;	// z-index can be "auto"
	zIndex = (isNaN(zIndex) || zIndex == 2147483647) ? 0 : parseInt(zIndex);	// solve an earlier bug which caused zIndex to be 2147483647
	return (recursive && zIndex === 0) ? getZIndex(element.parentNode, true) : zIndex;
}





/**
 * Get the computed style of the the specified element and style.
 *
 * @param {Element | Node | ParentNode} element
 * @param {string} style - eg. 'z-index' or 'margin'
 * @returns {string} - the style value
 */
function getAppliedStyle(el, style) {
    if (el instanceof jQuery)
        el = el[0];

    if (!el instanceof Object)
        return '';

    try {
        return window.getComputedStyle(el).getPropertyValue(style);
    } catch (error) {
        console.warn('dom-utils.getAppliedStyle(el, style) threw error', error);
        return '';
    }
}




/**
 * Check for webp feature support. Some browsers initially introduced partial support i.e. for lossy images
 * (i.e. compression), then added lossless & alpha support, finally adding support for animation.
 *
 * Usage: webpSupport('animated').then(() => console.log(`webp supported`)).catch(errMsg => console.log(errMsg) )
 *
 * @param {('lossy'|'lossless'|'alpha'|'animation')} feature
 * @return {Promise}
 */
function webpSupport(feature='alpha') {
	return new Promise((resolve, reject) => {
		const testImages = {
			lossy: "UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA",
			lossless: "UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==",
			alpha: "UklGRkoAAABXRUJQVlA4WAoAAAAQAAAAAAAAAAAAQUxQSAwAAAARBxAR/Q9ERP8DAABWUDggGAAAABQBAJ0BKgEAAQAAAP4AAA3AAP7mtQAAAA==",
			animation: "UklGRlIAAABXRUJQVlA4WAoAAAASAAAAAAAAAAAAQU5JTQYAAAD/////AABBTk1GJgAAAAAAAAAAAAAAAAAAAGQAAABWUDhMDQAAAC8AAAAQBxAREYiI/gcA"
		};
		const img = new Image();

		img.onload = () => {
			if ((img.width > 0) && (img.height > 0))
				resolve(`This browser supports webp images with ${feature}.`);
			else
				reject(`This browser does NOT fully support webp images with ${feature}.`);
		};
		img.onerror = () => {
			reject(`This browser does NOT fully support webp images with ${feature}`);
		};

		img.src = "data:image/webp;base64," + testImages[feature];
	});
}




/**
 * Part of a system to determine the best image resolution for a given device.
 *
 * @returns {string} - lo|med|hi
 */
function screenResolution() {
	const pixelDensity = window.outerWidth * window.outerHeight;
	// iPhone SE:  320 x 568	 182k	lo
	// iPhone 8:   375 x 667     250k   lo
	// iPhone 8+:  414 x 736     305k   lo
	// iPad":      768 x 1024    786k   med
	// iPad Pro+:  1024 x 1365   1.4M   med
	// my desktop: 1024 x 1920   2M     hi
	// my 4k:      3200 x 1800   5.8M   hi

	if (pixelDensity > 1500000)
		return 'hi';

	else if (pixelDensity > 500000)
		return 'med';

	return 'lo';
}


/**
 * A simple, fast (faster than md5 etc) hash code generator.
 *
 * @param {string} content  - string to hash
 * @returns {string}		- the unique hash code
 */
function hash(content) {
	let hash = '';

	if (content.length === 0)
		return hash;

	for (let i = 0; i < content.length; i++) {
		let char = content.charCodeAt(i);
		hash = ((hash << 5) - hash) + char;
		hash = hash & hash; // Convert to 32bit integer
	}

	return hash;
}

/***/ })

}]);
//# sourceMappingURL=chunk_busy.js.map