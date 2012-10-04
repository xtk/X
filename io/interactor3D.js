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

goog.provide('X.interactor3D');

// requires
goog.require('X.interactor');



/**
 * Create a 3D interactor for a given element in the DOM tree.
 * 
 * @constructor
 * @param {Element} element The DOM element to be observed.
 * @extends X.interactor
 */
X.interactor3D = function(element) {

  //
  // call the standard constructor of X.base
  goog.base(this, element);
  
  //
  // class attributes
  
  /**
   * @inheritDoc
   * @const
   */
  this._classname = 'interactor3D';
  
  this._clear_all = false;
  
};
// inherit from X.base
goog.inherits(X.interactor3D, X.interactor);


/**
 * @inheritDoc
 */
X.interactor3D.prototype.onMouseWheel_ = function(event) {

  goog.base(this, 'onMouseWheel_', event);
  
  // create a new zoom event
  var e = new X.event.ZoomEvent();
  
  // make sure, deltaY is defined
  if (!goog.isDefAndNotNull(event.deltaY)) {
    event.deltaY = 0;
  }
  
  // set the zoom direction
  // true if zooming in, false if zooming out
  // delta is here given by the event
  e._in = (event.deltaY < 0);
  
  // with the mouseWheel, the zoom will happen rather
  // fast than fine
  e._fast = true;
  
  // .. fire the event
  this.dispatchEvent(e);
  
};
