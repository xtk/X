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
goog.provide('X.base');

// requires
goog.require('X');
goog.require('goog.events');
goog.require('goog.events.EventTarget');



/**
 * The superclass for all X.base-objects. All derived objects will be registered
 * for event handling.
 * 
 * @constructor
 * @extends goog.events.EventTarget
 */
X.base = function() {

  //
  // register this class within the event system by calling the superclass
  // constructor
  goog.base(this);
  
  //
  // class attributes
  
  /**
   * The className of this class.
   * 
   * @type {string}
   * @protected
   */
  this._className = 'base';
  
  /**
   * The 'dirty' flag of this object.
   * 
   * @type {boolean}
   * @protected
   */
  this._dirty = false;
};
// enable events
goog.inherits(X.base, goog.events.EventTarget);

/**
 * Get the className of this object.
 * 
 * @return {string} The className of this object.
 * @public
 */
X.base.prototype.__defineGetter__('className', function() {

  return this._className;
  
});

// export symbols (required for advanced compilation)
goog.exportSymbol('X.base', X.base);
