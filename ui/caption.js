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
goog.provide('X.caption');

// requires
goog.require('X.base');
goog.require('X.interactor');
goog.require('goog.dom');
goog.require('goog.style');
goog.require('goog.positioning.ViewportPosition');
goog.require('goog.ui.Tooltip');


/**
 * Create a caption element (similar to a tooltip).
 * 
 * @constructor
 * @param {?Element} parent The parent element in the DOM tree.
 * @param {!number} x The X-coordinate of the upper left caption corner.
 * @param {!number} y The Y-coordinate of the upper left caption corner.
 * @param {?X.interactor} interactor The interactor for listening to the
 *          X.event.HoverEndEvent.
 * @extends goog.ui.Tooltip
 */
X.caption = function(parent, x, y, interactor) {

  // check if we have a valid parent
  if (!goog.isDefAndNotNull(parent)) {
    
    throw new Error('No valid parent element.');
    
  }
  
  // check if we have valid coordinates
  if (!goog.isNumber(x) || !goog.isNumber(y)) {
    
    throw new Error('Invalid coordinates.');
    
  }
  
  // check if we have a valid interactor
  if (!goog.isDefAndNotNull(interactor) ||
      !(interactor instanceof X.interactor)) {
    
    throw new Error('Invalid interactor.');
    
  }
  
  //
  // call the standard constructor of goog.ui.Tooltip
  goog.base(this);
  
  //
  // class attributes
  
  /**
   * The className of this class.
   * 
   * @type {string}
   * @protected
   */
  this._classname = 'caption';
  
  /**
   * The parent element in the DOM tree of this caption element.
   * 
   * @type {!Element}
   * @protected
   */
  this._parent = parent;
  
  /**
   * The X-coordinate of this caption element.
   * 
   * @type {!number}
   * @protected
   */
  this._x = x;
  
  /**
   * The Y-coordinate of this caption element.
   * 
   * @type {!number}
   * @protected
   */
  this._y = y;
  
  /**
   * The interactor for listening to the X.event.HoverEndEvent.
   * 
   * @type {?X.interactor}
   * @protected
   */
  this._interactor = interactor;
  
  /**
   * The element for the CSS style of this caption element.
   * 
   * @type {?Element}
   * @protected
   */
  this._style = null;
  
  /**
   * The collection of CSS definitions.
   * 
   * @type {!Array}
   * @protected
   */
  this._css = [];
  // configure some styles
  var css1 = '.x-tooltip {\n';
  css1 += '  background: #C0C0FF;\n';
  css1 += '  color: #000000;\n';
  css1 += '  border: 1px solid infotext;\n';
  css1 += '  padding: 1px;\n';
  css1 += '  font-family: sans-serif;\n';
  // css1 += ' width: 120px;\n';
  css1 += '}';
  this._css = [css1];
  
  // listen to the X.event.HoverEndEvent from the interactor and kill this
  // caption element, if caught
  goog.events.listenOnce(interactor, X.event.events.HOVER_END, this.kill
      .bind(this));
  
  // now initialize
  this.init_();
  
};
// inherit from X.base
goog.inherits(X.caption, goog.ui.Tooltip);

/**
 * Internal function to initialize the caption element which gets called by the
 * constructor.
 * 
 * @private
 */
X.caption.prototype.init_ = function() {

  // enable relative positioning for the main container
  // this is required to place the progressBar in the center

	var position = goog.style.getComputedStyle(this._parent, "position");
  
  if (position == 'static' || position == '') {
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
  goog.dom.appendChild(head, style);
  goog.dom.appendChild(style, css);
  // save the style element for later
  this._style = style;
  
  this.setPosition(new goog.positioning.ViewportPosition(this._x, this._y));
  this.setVisible(true);
  
  // ..render
  this.attach(this._parent);
  
  // get the actual DOM element of this caption element
  var captionElement = this.getElement();
  
  // .. change the color to green
  captionElement.classList.add('x-tooltip');
  
};


/**
 * Remove the caption element from the document.
 */
X.caption.prototype.kill = function() {

  // hide the caption element
  
  this.setVisible(false);
  
  if (this._style) {
    goog.dom.removeNode(this._style);
  }
  if (this.getElement()) {
    goog.dom.removeNode(this.getElement());
  }
  
  this._style = null;
  
};
