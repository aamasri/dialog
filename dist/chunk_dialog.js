"use strict";(self.webpackChunk_aamasri_dialog=self.webpackChunk_aamasri_dialog||[]).push([[802],{780:(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,{close:()=>close,closeAll:()=>closeAll,closeLast:()=>closeLast,open:()=>open});var _close_icon_svg_src__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__(961),_fullscreen_icon_svg_src__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__(351);const debug=!1;let loadUrlBusy,dialogCount=0;const open=async function(options){options=options||{},debug&&console.debug("dialog.open invoked with options",options),await loadDependencies();const $body=jQuery("body");if(options.title||options.source||(options.title="Dialog Cheat Sheet",options.source=usageInstructions),0===dialogCount){let existingDialogs=document.querySelectorAll(".dialog-box");existingDialogs.length&&(existingDialogs=[...existingDialogs],existingDialogs.forEach((dialog=>{const count=parseInt(dialog.id.replace(/[^0-9]+/,""));count>dialogCount&&(dialogCount=count),console.log(`found existing dialog #${dialog.id} --\x3e dialogCount=${dialogCount} ${count}`)})))}let dialogBody,dialogId="dialog-"+ ++dialogCount,dialogTitle=options.title||"";const sourceIsUrl="string"==typeof options.source&&(/^https?:\/\/[a-z]+/.test(options.source)||/^\/[a-z]+/.test(options.source));let useIframe=options.iframe&&sourceIsUrl||!1;if(useIframe&&(dialogBody=`<iframe src="${options.source}"></iframe>`),!sourceIsUrl){debug&&console.debug("not url");try{const sourceElement=document.querySelector(options.source);debug&&console.debug("source is an element"),sourceElement&&(dialogBody=sourceElement.innerHTML,dialogTitle=dialogTitle||sourceElement.title||""),debug&&console.debug(`dialog title:${dialogTitle} \n\n body:${dialogBody}`)}catch(error){debug&&console.debug(`source "${options.source}" is not a selector`)}dialogBody=dialogBody||options.source||""}options.replace=void 0===options.replace||!!options.replace,options.replace&&closeAll();const modalDiv=options.modal?`<div class="dialog-modal" data-for="${dialogId}"></div>`:"",urlData=useIframe||options.fullscreenUrl?`data-url="${options.fullscreenUrl||options.source}"`:"",createdData=`data-created="${Date.now()}"`,fullScreenIcon=useIframe||options.fullscreenUrl?`<span class="icon-fullscreen" title="Fullscreen">${_fullscreen_icon_svg_src__WEBPACK_IMPORTED_MODULE_1__}</span>`:"";let classes=[];useIframe&&classes.push("has-iframe"),dialogTitle||classes.push("chromeless"),options.persistent&&classes.push("persistent"),options.classes&&"string"==typeof options.classes&&classes.push(options.classes);const attributes=options.attributes||"";let $dialog=jQuery(`${modalDiv}\n                        <div id="${dialogId}" class="dialog-box ${classes.join(" ")}" ${attributes} ${createdData} ${urlData}>\n                            <div class="dialog-header">\n                                <div class="title">${dialogTitle}</div>\n                                <div class="icons">\n                                    ${fullScreenIcon}\n                                    <span class="icon-close">${_close_icon_svg_src__WEBPACK_IMPORTED_MODULE_0__}</span>\n                                </div>\n                            </div>\n                            \n                            <div class="dialog-body">\n                                ${dialogBody||'<div class="dialog-loader">Loading <div class="dialog-progress-bar"></div></div>'}\n                            </div>\n                        </div>`);$dialog.appendTo($body);const domUtils=await __webpack_require__.e(518).then(__webpack_require__.bind(__webpack_require__,402));debug&&console.debug("dom-utils loaded",typeof domUtils);const onTop=domUtils.onTopZIndex();let $modal;onTop&&$dialog.css("z-index",onTop),options.modal&&($modal=$body.find(`data-url[${dialogId}]`),$dialog=$body.find(`#${dialogId}`)),debug&&console.debug(`dialog ${dialogId} appended to body`,$dialog.length),initDialogListeners(),options.onClose&&bindCloseCallback($dialog,options.onClose);let openAnimation=openAnimateDialog($dialog);if(sourceIsUrl&&!useIframe){if(loadUrlBusy)return console.warn("dialog cancelled because another dialog is loading"),$modal&&$modal.remove(),void $dialog.remove();loadUrlBusy=window.setTimeout((()=>{loadUrlBusy=!1}),2e3);const $progressBar=$dialog.find(".dialog-progress-bar");try{dialogBody=await jQuery.ajax({url:options.source,xhr:()=>{$progressBar.css("width","40%");const xhr=new window.XMLHttpRequest;return xhr.addEventListener("progress",(evt=>{if(evt.lengthComputable){const loadProgress=evt.loaded/evt.total;$progressBar.css("width",100*loadProgress+"%")}}),!1),xhr}}),options.fragment&&(dialogBody=jQuery(dialogBody).find(options.fragment).html()),dialogBody.includes("<head")&&(dialogBody=`<iframe src="${options.source}"></iframe>`,$dialog.addClass("has-iframe"),console.warn('package @aamasri/dialog recommends using the "iframe" or "fragment" options when the loading a full HTML document!'))}catch(error){dialogBody=error.responseText?error.responseText:error.statusText?`Loading url ${options.source} failed with "${error.statusText}"`:"Loading url ${options.source} failed!"}debug&&await new Promise((r=>setTimeout(r,3e3))),loadUrlBusy=!1,$dialog.find(".dialog-body").html(dialogBody),debug&&console.debug("replace content:",$dialog.find(".dialog-body").html()),openAnimation.pause(),openAnimation=openAnimateDialog($dialog)}return await openAnimation.finished,$dialog.find(".dialog-header .icons svg").fadeIn(),$dialog[0]};function openAnimateDialog($dialog){debug&&console.debug("openAnimateDialog ",$dialog[0].id);const $window=jQuery(window),dialogWidth=$dialog.width(),dialogArea=$dialog.height()*dialogWidth,windowWidth=$window.width(),windowArea=$window.height()*windowWidth,large=dialogArea/windowArea>.3;large&&$dialog.addClass("large"),debug&&console.debug("area",dialogArea/windowArea);const formInput=document.querySelector(`#${$dialog[0].id} .dialog-body input`);formInput&&(formInput.focus(),formInput.select());const wide=dialogWidth/windowWidth>.8,easing=wide||large?"cubicBezier(0.190, 1.000, 0.400, 1.000)":"easeOutElastic(1, 0.6)";debug&&console.debug(`wide ${wide}`,dialogWidth/windowWidth);const animeConfig={targets:$dialog[0],translateX:["-50%","-50%"],translateY:["-50%","-50%"],scale:[0,1],duration:500,easing:easing};return $dialog[0].style.visibility="visible",anime(animeConfig)}function executeCallback(callback){switch(typeof callback){case"function":return void callback();case"string":try{eval(callback)}catch(error){console.error("close callback failed with",error)}}}const closeAll=function(){const dialogs=getAllDialogs(),modals=getAllModals();dialogs.length&&dialogs.forEach((dialog=>{dialog.remove()})),modals.length&&modals.forEach((modal=>{modal.remove()}))},closeLast=function(){const dialogs=getAllDialogs();if(dialogs.length){const lastDialog=dialogs[dialogs.length-1];lastDialog.classList.contains("persistent")||close(lastDialog)}},close=function(dialog){if("object"!=typeof dialog||null===dialog)return;if(jQuery){const $dialog=jQuery(dialog).closest(".dialog-box");if(!$dialog.length)return;dialog=$dialog[0]}else if(dialog instanceof Element&&null===(dialog=dialog.closest(".dialog-box")))return;debug&&console.debug("  closing dialog",dialog.id);const createdAt=dialog.getAttribute("data-created");if(Date.now()-createdAt<500)return void(debug&&console.debug("    cancelled because it's less than a second old"));debug&&console.debug(`    dialog is ${Date.now()-createdAt} mS old`);const relatedModal=getRelatedModal(dialog);anime({targets:dialog,translateX:[{value:["-50%","-50%"]}],translateY:[{value:["-50%","-50%"]}],scale:[{value:[1,0]}],opacity:[{value:[1,0]}],duration:300,easing:"linear"}).finished.then((()=>{dialog.remove(),relatedModal&&relatedModal.remove()}))};function getAllDialogs(){return document.querySelectorAll(".dialog-box")}function getAllModals(){return document.querySelectorAll(".dialog-modal")}function getRelatedModal(dialog){return document.querySelector(`.dialog-modal[data-for="${dialog.id}"]`)}function getRelatedDialog(modal){const dialogId=modal.getAttribute("data-for");return document.getElementById(dialogId)}let blurHandlerBound=!1;function initDialogListeners(){blurHandlerBound||(blurHandlerBound=!0,jQuery(document).on("click",(event=>{const $clicked=jQuery(event.target);debug&&console.debug(`clicked on ${$clicked[0].nodeName} "${$clicked.text().substring(0,10)}.."`);const $closestDialogBox=$clicked.closest(".dialog-box");if($closestDialogBox.length){debug&&console.debug("  clicked on dialog",$closestDialogBox[0].id);const createdAt=$closestDialogBox[0].getAttribute("data-created");if(getAllDialogs().forEach((dialog=>{dialog.getAttribute("data-created")>createdAt&&close(dialog)})),$clicked.closest(".icon-close").length&&(debug&&console.debug("  clicked on dialog close button"),close($closestDialogBox)),$clicked.closest(".icon-fullscreen").length){const url=$closestDialogBox.data("url");debug&&console.debug("  clicked on dialog fullscreen button",url),window.open(url,"_self")}return}const $closestModalOverlay=$clicked.closest(".dialog-modal");if($closestModalOverlay.length){const relatedDialog=getRelatedDialog($closestModalOverlay[0]);if(relatedDialog){debug&&console.debug("  clicked on modal for dialog",relatedDialog.id);const createdAt=relatedDialog.getAttribute("data-created");getAllDialogs().forEach((dialog=>{dialog.getAttribute("data-created")>=createdAt&&(dialog.classList.contains("persistent")||close(dialog))}))}else debug&&console.debug("  clicked on a modal but it's related dialog is no longer in the DOM")}else closeLast()})).on("keydown",(event=>{debug&&console.debug("key pressed",event.key),"Escape"===event.key&&(document.activeElement&&"BODY"!==document.activeElement.nodeName?(debug&&console.debug("blurring",document.activeElement.nodeName),document.activeElement.blur()):closeLast())})))}function bindCloseCallback($dialog,callback){new MutationObserver((mutationsList=>{mutationsList.forEach((mutation=>{mutation.removedNodes.forEach((node=>{$dialog.is(jQuery(node))&&(debug&&console.debug("dialog removed:",node),executeCallback(callback))}))}))})).observe(document.querySelector("body"),{childList:!0,subtree:!0})}async function loadDependencies(){void 0===window.jQuery&&(window.jQuery=await __webpack_require__.e(729).then(__webpack_require__.t.bind(__webpack_require__,755,23)),window.jQuery=window.jQuery.default),debug&&console.debug("jQuery loaded",typeof window.jQuery),void 0===window.anime&&(window.anime=await __webpack_require__.e(342).then(__webpack_require__.bind(__webpack_require__,30)),window.anime=window.anime.default),debug&&console.debug("anime.js loaded",typeof window.anime)}const usageInstructions='Usage instructions for developers: \n<pre style="color:#888; font-size: 12px;">\noptions object {\n    title:      string              dialog title or source element title attribute\n    source:     string | object     the content source: html content, selector, url, or element\n    fragment:   selector            selector by which to isolate a portion of the source HTML\n    modal:      boolean             page background dimming\n    iframe:     boolean             if the source is a url, whether to load it in an iFrame\n    replace:    boolean             whether to close any existing dialogs or layer up\n    persistent: boolean             whether ESC/blur automatically closes the dialog\n    onClose:    function | string   callback function or eval(string) to execute after dialog dismissed\n    classes:    string              classes to apply to the dialog container element\n    attributes: string              attributes to apply to the dialog container element eg. \'data-ignore-events="true"\'\n}\n</pre>\n\n<pre style="color: royalblue;  font-size: 12px;">\ndialog.open(options).then(function() {\n    console.log(\'dialog launched\');\n});\n</pre>'},961:module=>{module.exports='<svg xmlns="http://www.w3.org/2000/svg" viewBox="28 28 116 116">\n     <path d="M35.76335,28.59668c-2.91628,0.00077 -5.54133,1.76841 -6.63871,4.47035c-1.09737,2.70194 -0.44825,5.79937 1.64164,7.83336l45.09961,45.09961l-45.09961,45.09961c-1.8722,1.79752 -2.62637,4.46674 -1.97164,6.97823c0.65473,2.51149 2.61604,4.4728 5.12753,5.12753c2.51149,0.65473 5.18071,-0.09944 6.97823,-1.97165l45.09961,-45.09961l45.09961,45.09961c1.79752,1.87223 4.46675,2.62641 6.97825,1.97168c2.5115,-0.65472 4.47282,-2.61605 5.12755,-5.12755c0.65472,-2.5115 -0.09946,-5.18073 -1.97168,-6.97825l-45.09961,-45.09961l45.09961,-45.09961c2.11962,-2.06035 2.75694,-5.21064 1.60486,-7.93287c-1.15207,-2.72224 -3.85719,-4.45797 -6.81189,-4.37084c-1.86189,0.05548 -3.62905,0.83363 -4.92708,2.1696l-45.09961,45.09961l-45.09961,-45.09961c-1.34928,-1.38698 -3.20203,-2.16948 -5.13704,-2.1696z"/>\n</svg>'},351:module=>{module.exports='<svg xmlns="http://www.w3.org/2000/svg" viewBox="21 21 130 130">\n    <path d="M35.83333,21.5c-7.83362,0 -14.33333,6.49972 -14.33333,14.33333v21.5c-0.03655,2.58456 1.32136,4.98858 3.55376,6.29153c2.2324,1.30295 4.99342,1.30295 7.22582,0c2.2324,-1.30295 3.59031,-3.70697 3.55376,-6.29153v-21.5h21.5c2.58456,0.03655 4.98858,-1.32136 6.29153,-3.55376c1.30295,-2.2324 1.30295,-4.99342 0,-7.22582c-1.30295,-2.2324 -3.70697,-3.59031 -6.29153,-3.55376zM114.66667,21.5c-2.58456,-0.03655 -4.98858,1.32136 -6.29153,3.55376c-1.30295,2.2324 -1.30295,4.99342 0,7.22582c1.30295,2.2324 3.70697,3.59031 6.29153,3.55376h21.5v21.5c-0.03655,2.58456 1.32136,4.98858 3.55376,6.29153c2.2324,1.30295 4.99342,1.30295 7.22582,0c2.2324,-1.30295 3.59031,-3.70697 3.55376,-6.29153v-21.5c0,-7.83362 -6.49972,-14.33333 -14.33333,-14.33333zM28.55469,107.40202c-3.95253,0.06178 -7.10882,3.312 -7.05469,7.26465v21.5c0,7.83362 6.49972,14.33333 14.33333,14.33333h21.5c2.58456,0.03655 4.98858,-1.32136 6.29153,-3.55376c1.30295,-2.2324 1.30295,-4.99342 0,-7.22582c-1.30295,-2.2324 -3.70697,-3.59031 -6.29153,-3.55376h-21.5v-21.5c0.02653,-1.93715 -0.73227,-3.80254 -2.10349,-5.17112c-1.37122,-1.36858 -3.23806,-2.12378 -5.17516,-2.09353zM143.22135,107.40202c-3.95253,0.06178 -7.10882,3.312 -7.05469,7.26465v21.5h-21.5c-2.58456,-0.03655 -4.98858,1.32136 -6.29153,3.55376c-1.30295,2.2324 -1.30295,4.99342 0,7.22582c1.30295,2.2324 3.70697,3.59031 6.29153,3.55376h21.5c7.83362,0 14.33333,-6.49972 14.33333,-14.33333v-21.5c0.02653,-1.93715 -0.73227,-3.80254 -2.10349,-5.17112c-1.37122,-1.36858 -3.23806,-2.12378 -5.17516,-2.09353z"/>\n</svg>'}}]);
//# sourceMappingURL=chunk_dialog.js.map