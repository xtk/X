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

goog.provide('X.interactor2D');

// requires
goog.require('X.interactor');
goog.require('X.event.ScrollEvent');



/**
 * Create a 2D interactor for a given element in the DOM tree.
 * 
 * @constructor
 * @param {Element} element The DOM element to be observed.
 * @extends X.interactor
 */
X.interactor2D = function(element) {

  //
  // call the standard constructor of X.base
  goog.base(this, element);
  
  //
  // class attributes
  
  /**
   * @inheritDoc
   * @const
   */
  this._classname = 'interactor2D';
  
};
// inherit from X.base
goog.inherits(X.interactor2D, X.interactor);


/**
 * @inheritDoc
 */
X.interactor2D.prototype.onMouseWheel_ = function(event) {

  goog.base(this, 'onMouseWheel_', event);
  
  // create a new scroll event
  //
  // the scroll event triggers scrolling through the slices in a 2D renderer. we
  // can not use the zoom event here since we also zoom on right click.
  var e = new X.event.ScrollEvent();
  
  // make sure, deltaY is defined
  if (!goog.isDefAndNotNull(event.deltaY)) {
    event.deltaY = 0;
  }
  
  // set the scroll direction
  // true if up, false if down
  // delta is here given by the event
  e._up = (event.deltaY < 0);
  
  // .. fire the event
  this.dispatchEvent(e);
  
};
