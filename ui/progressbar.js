/*
 * 
 *                  xxxxxxx      xxxxxxx
 *                   x:::::x    x:::::x 
 *                    x:::::x  x:::::x  
 *                     x:::::xx:::::x   
 *                      x::::::::::x    
 *                       x::::::::x     
 *                       x::::::::x     
 *                      x::::::::::x    
 *                     x:::::xx:::::x   
 *                    x:::::x  x:::::x  
 *                   x:::::x    x:::::x 
 *              THE xxxxxxx      xxxxxxx TOOLKIT
 *                    
 *                  http://www.goXTK.com
 *                   
 * Copyright (c) 2012 The X Toolkit Developers <dev@goXTK.com>
 *                   
 *    The X Toolkit (XTK) is licensed under the MIT License:
 *      http://www.opensource.org/licenses/mit-license.php
 * 
 *      "Free software" is a matter of liberty, not price.
 *      "Free" as in "free speech", not as in "free beer".
 *                                         - Richard M. Stallman
 * 
 * 
 */

// provides
goog.provide('X.progressbar');

// requires
goog.require('X.base');
goog.require('goog.dom');
goog.require('goog.style');
goog.require('goog.ui.ProgressBar');


/**
 * Create a progress bar.
 * 
 * @constructor
 * @param {?Element} parent The parent element in the DOM tree.
 * @param {!number} initialvalue An initial value for this progress bar.
 * @extends goog.ui.ProgressBar
 */
X.progressbar = function(parent, initialvalue) {

  // check if we have a valid parent
  if (!goog.isDefAndNotNull(parent)) {
    
    throw new Error('No valid parent element.');
    
  }
  
  // check if we have an initial value
  if (!goog.isDefAndNotNull(initialvalue)) {
    
    throw new Error('Invalid initial value.');
    
  }
  
  //
  // call the standard constructor of goog.ui.ProgressBar
  goog.base(this);
  
  //
  // class attributes
  
  /**
   * The className of this class.
   * 
   * @type {string}
   * @protected
   */
  this._classname = 'progressbar';
  
  /**
   * The parent element in the DOM tree of this progress bar.
   * 
   * @type {?Element}
   * @protected
   */
  this._parent = parent;
  
  /**
   * The original position style setting of the parent.
   * 
   * @type {string}
   * @protected
   */
  this._parent_position_original = '';
  
  /**
   * The element for the CSS style of this progress bar.
   * 
   * @type {?Element}
   * @protected
   */
  this._style = null;
  
  /**
   * A green, full progressBar to replace this one once it's done.
   * 
   * @type {?X.progressbar}
   * @protected
   */
  this._doneProgressBar = null;
  
  /**
   * The collection of CSS definitions.
   * 
   * @type {!Array}
   * @protected
   */
  this._css = [];
  // configure some styles
  var css1 = '.progress-bar-horizontal {\n';
  css1 += '  position: relative;\n';
  css1 += '  border: 1px solid #949dad;\n';
  css1 += '  background: white;\n';
  css1 += '  padding: 1px;\n';
  css1 += '  overflow: hidden;\n';
  css1 += '  margin: 2px;\n';
  css1 += '  width: 100px;\n';
  css1 += '  height: 5px;\n';
  css1 += '}';
  var css2 = '.progress-bar-thumb {\n';
  css2 += '  position: relative;\n';
  css2 += '  background: #F62217;\n';
  css2 += '  overflow: hidden;\n';
  css2 += '  width: 0%;\n';
  css2 += '  height: 100%;\n';
  css2 += '}';
  var css3 = '.progress-bar-thumb-done {\n';
  css3 += '  background: #57E964;\n';
  css3 += '}';
  this._css = [css1, css2, css3];
  
  // set initial value
  this.setValue(initialvalue);
  
  // now initialize
  this.init_();
  
};
// inherit from X.base
goog.inherits(X.progressbar, goog.ui.ProgressBar);

/**
 * Internal function to initialize the progress bar which gets called by the
 * constructor.
 * 
 * @private
 */
X.progressbar.prototype.init_ = function() {

  // enable relative positioning for the main container
  // this is required to place the progressBar in the center

	var position = goog.style.getComputedStyle(this._parent, "position");
  
  if (position == 'static' || position == '') {
    // buffer the original setting
    this._parent_position_original = this._parent.style.position;
    this._parent.style.position = 'relative';
  }
  
  //
  // apply CSS styles to the document
  //
  var head = goog.dom.getDocument().getElementsByTagName('head')[0];
  var style = goog.dom.createDom('style');
  style.type = 'text/css';
  style.media = 'screen';
  var css = goog.dom.createTextNode(this._css[0]);
  var css2 = goog.dom.createTextNode(this._css[1]);
  var css3 = goog.dom.createTextNode(this._css[2]);
  goog.dom.appendChild(head, style);
  goog.dom.appendChild(style, css);
  goog.dom.appendChild(style, css2);
  goog.dom.appendChild(style, css3);
  // save the style element for later
  this._style = style;
  
  // render..
  this.render(this._parent);
  
  // place the progressBar in the center
  var pbElement = this.getElement();
  pbElement.style.position = 'absolute';
  pbElement.style.top = (this._parent.clientHeight - 5) / 2 + 'px';
  pbElement.style.left = (this._parent.clientWidth - 100) / 2 + 'px';
  pbElement.classList.add('xtk-progress-bar');
  
};


/**
 * Display a green, full progress bar.
 */
X.progressbar.prototype.done = function() {

  // save the position of the original progress bar
  var top = this.getElement().style.top;
  var left = this.getElement().style.left;
  
  // .. destroy the original progress bar (on the DOM side)
  goog.dom.removeNode(this.getElement());
  
  // create a 'fake' new progress bar in place of the original one
  // the new one always shows 100
  var pb = new X.progressbar(this._parent, 100);
  
  // place the progressBar in the center
  var pbElement = pb.getElement();
  pbElement.style.position = 'absolute';
  pbElement.style.top = top;
  pbElement.style.left = left;
  pbElement.classList.add('xtk-progress-bar');
  
  // get the actual progress element of the progressBar
  var pbBar = goog.dom.getFirstElementChild(pbElement);
  
  // .. change the color to green
  pbBar.classList.add('progress-bar-thumb-done');
  
  this._doneProgressBar = pb;
  
};


/**
 * Remove the progress bar from the document.
 */
X.progressbar.prototype.kill = function() {

  // hide the progress bar
  if (this._style) {
    goog.dom.removeNode(this._style);
  }
  if (this.getElement()) {
    goog.dom.removeNode(this.getElement());
  }
  if (this._doneProgressBar) {
    goog.dom.removeNode(this._doneProgressBar.getElement());
  }
  
  this._style = null;
  this._doneProgressBar = null;
  
  // reset the original parent position style
  if (this._parent_position_original)
    this._parent.style.position = this._parent_position_original;
  
};
