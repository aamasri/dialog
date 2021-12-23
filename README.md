<h1>Dialog</h1>

<p>A flexible javascript popup dialog.</p>

<img src="https://auroraweb.ca/uploads/aurora/webpage/205/dialog-js.png" width="400px" alt="">
<pre>
dialog.open({
        title: 'Dialog Title',
        source: 'Body content can be (HTML, CSS selector, DOM element, or URL)',
    }).then(...);
</pre>

<br>
<h2>Features</h2>
<ul>
    <li>Easy to use.</li>
    <li>Lazy loading (3kb initial page load).</li>
    <li>Usable as a webpack/ES6 module or a pre-built browser bundle.</li>
    <li>Handles multiple programming scenarios and content sources.</li>
    <li>Simple HTML structure and easy custom styling using CSS3 variables.</li>
    <li>Dialogs can be 'modal', and/or can be layered on top of each other.</li>
    <li>Implements the 'Promise' interface, allowing sequential notifications.</li> 
</ul>


<br><br>
<h2>Demo</h2>
<a href="https://auroraweb.ca/demos/dialog">Try me</a>



<br><br>
<h2>Installation</h2>
Dialog is a javascript package built for and using the ES6 module system, but it's also provided as a pre-built, minified browser package (in this package's "dist" folder).

<br>
<h3>Browser</h3>

1. Download & copy this package's "dist" folder into your web server's public folder eg. ```public/js/dist/*```.
2. Rename "dist" to "dialog" eg. ```public/js/dialog```
3. Load the dialog script at the end of your web page (before the closing `body` tag) like this:
```
<body>
    ...

    <script src="/js/dialog/dialog.js"></script>
</body>
</html>

```
4. When the browser loads, dialog will be attached to the browser's global window object. Use it anywhere in your scripts like this:
  
```
<button>Target</button>

<script>
    dialog.open();          // Display the dialog cheat sheet

    ...

    dialog.closeLast();     // close the on-top dialog
    
    ...
    
    dialog.closeAll();

</script>
```
    
<br>
<h3>ES6 module</h3>
Install the dialog package into your project using npm: 
<pre>
$ cd to/your/project
$ npm install @aamasri/dialog
</pre>

Then import and use it in your project's ES6 modules:
<h4>Static import</h4>
<pre>
import dialog from 'dialog';

function helloWorld() {
    dialog.open({ title: 'Greetings', source: 'Hello World' });
}
</pre>

<h4>Dynamic import</h4>
Leveraging Webpack's on-demand (lazy) loading and code-splitting:
<pre>
import(/* webpackChunkName: "dialog" */ 'dialog').then((dialog) => {
    dialog.closeAll();
    
    dialog.open(...
});
</pre>


<br><br>
<h2>Dialog Functions</h2>
<pre>dialog.open({ .. }).then((dialogElement) => { .. })    // create a new dialog</pre>
<pre>dialog.close(dialogElement)                            // close a specific dialog instance</pre>
<pre>dialog.closeAll()                                      // close all dialogs</pre>
<pre>dialog.closeLast()                                     // close the on-top dialog</pre>


<br><br>
<h2>Dialog.open Options</h2>
Here's another example with different options; eg. to load/display a fragment of the HTML returned by a URL: 
<pre>    dialog.open({ 
             title: `${userName}'s User Profile`, 
             source: userUrl,
             fragment: '.contact-info'
             modal: true,
             onClose: function() { alert: `Don't hesitate to call ${userName}!`; }
         }).then( function(dialogElement) {
             console.log('fyi the contact info dialog just launched');
             
             window.setTimeout( function() {
                dialog.close(dialogElement);
             }, 10000);
         });
</pre>
<br><br>
Here's the full list of dialog.open options:
<table>
<tr><th align="left">Option</th><th align="left">Type</th><th align="left">Description</th><th align="left">Default</th></tr>

<tr><td>title</td><td>string | undefined</td><td>dialog title, else source element title attribute</td><td>"Missing Title"</td></tr>
<tr><td>source</td><td>string | object | undefined</td><td>the content source: html content, selector, url, or element</td><td>usage instructions</td></tr>
<tr><td>fragment**</td><td>string | undefined</td><td>selector by which to extract a portion of the source HTML</td><td></td></tr>
<tr><td>modal**</td><td>boolean | undefined</td><td>dialog background blurring & dimming</td><td>false</td></tr>
<tr><td>iframe</td><td>boolean | undefined</td><td>if the source is a url, whether to load it in an iFrame. Adds a full-screen link.</td><td>false</td></tr>
<tr><td>fullscreenUrl</td><td>string | undefined</td><td>forces a full-screen button (or for case that the fullscreen url differs from the source url)</td><td>false</td></tr>
<tr><td>replace</td><td>boolean | undefined</td><td>whether to close any existing dialogs or layer up</td><td>false</td></tr>
<tr><td>persistent</td><td>boolean | undefined</td><td>whether ESC key or blur events close the dialog</td><td>false</td></tr>
<tr><td>onClose</td><td>function | string | undefined</td><td>callback function or eval(string) to execute after dialog dismissed</td><td></td></tr>
<tr><td>classes</td><td>string | undefined</td><td>additional classes to apply to the dialog container element</td><td></td></tr>
<tr><td>attributes</td><td>string | undefined</td><td>attributes to apply to the dialog container element eg. 'data-ignore-events="true"'</td><td></td></tr>
</table>

<h4>Notes</h4>
1. To create a chrome-less dialog (ie. one with no padding or header, where the specified content completely fills the dialog box), simply omit the title option.
2. If loading a URL fails then it may be due to a CORS issue (if it's for a different domain). 

<br>
** it is recommended to use the "iframe" or "fragment" options when loading a URL that returns a <strong>FULL</strong> HTML document.
<br>
This is because HTML documents cannot be nested without an iframe; not specifying the "iframe" or "fragment" option will cause the dialog to reload the URL in an iframe (which may unnecessarily increase the dialog load time).
<br><br>



<br><br>
<h2>Dialog Styling</h2>
The dialog's default CSS styles may easily be themed to fit your application.
Change any of these default styles in your CSS :root or body scope: 

<pre>
:root {
    --dialogBoxShadow: 0 0 28px #CCC;
    --dialogBoxShadow: 0 0 28px #CCC;
    --dialogBoxShadow: 0 0 28px #CCC;
    --dialogBackground: #FFF;
    --dialogBorder: 1px solid #DDD;
    --dialogBoxShadow: 0 0 28px #CCC;
    --dialogBorderRadius: 4px;
    --dialogFontFamily: Helvetica, Verdana, sans-serif;
    --dialogLineHeight: 1.8;
    --dialogTitleSize: 1.3rem;
    --dialogTitleColor: #888;
    --dialogTitleWeight: bold;
    --dialogModalBackground: rgba(170, 170, 170, 0.3);
    --dialogModalOpacity: 0.3;
</pre>
<br><br><br>


<h2>Package Management</h2>

Dialog supports [npm](https://www.npmjs.com/package/dialog) under the name `@aamasri/dialog`.

<h3>NPM</h3>
<pre>$ npm install @aamasri/dialog --save</pre>

<br>
<h3>Dependencies</h3>
Dialog depends on 2 external packages:
<ol>
<li>jquery</li>
<li>animejs</li>
<li>@aamasri/dom-utils</li>
</ol>
These dependencies are bundled (as separate pre-built 'chunks') in this package's "dist" folder.  
<br>
Invoking the dialog() function will dynamically load these dependencies at run-time (if these scripts don't already exist on the page) and they'll be added to the global window object.
<br><br>
If your page already loads the jQuery, animejs, or @aamasri/dom-utils packages, dialog will use them instead.


<br><br>

## Manual release steps
<ol>
<li>Increment the "version" attribute of `package.json`.</li>
<li>Re-build the browser output bundle...<pre>npm run build-production</pre>
...and observe that webpack completed with no errors.</li>
<li>Test the bundle by loading page: "dist/index.html" in a browser.</li>
<li>Commit <pre>git commit -a -m "Release version x.x.x - description"</pre></li>
<li>Tag the commit with it's version number <pre>git tag x.x.x</pre></li>
<li>Change the "latest" tag pointer to the latest commit & push:
    <pre>git tag -f latest
git push origin master :refs/tags/latest
git push origin master --tags</pre>
<li>Publish to npm registry:<pre>npm publish</pre></li>
</ol>

<br>
<h2>Authors</h2>

* [Ananda Masri](https://github.com/aamasri)
* And awesome [contributors](https://github.com/aamasri/dialog/graphs/contributors)
