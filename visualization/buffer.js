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
goog.provide('X.buffer');

// requires
goog.require('X.base');



/**
 * Create a GL buffer container. Besides the actual GL buffer, the container
 * stores the number of items and the size of each item.
 * 
 * @constructor
 * @param {Object} glBuffer The GL buffer.
 * @param {number} itemCount The number of items.
 * @param {number} itemSize The size of each item.
 * @extends X.base
 */
X.buffer = function(glBuffer, itemCount, itemSize) {

  if (!goog.isDefAndNotNull(glBuffer)) {
    
    throw new Error('Invalid GL Buffer.');
    
  }
  
  if (!goog.isDefAndNotNull(itemCount)) {
    
    throw new Error('Invalid number of items.');
    
  }
  
  if (!goog.isDefAndNotNull(itemSize)) {
    
    throw new Error('Invalid item size.');
    
  }
  
  // call the standard constructor of X.base
  goog.base(this);
  
  //
  // class attributes
  
  /**
   * @inheritDoc
   * @const
   */
  this._classname = 'buffer';
  
  /**
   * The GL buffer.
   * 
   * @type {Object}
   * @const
   */
  this._glBuffer = glBuffer;
  
  /**
   * The number of items.
   * 
   * @type {number}
   * @const
   */
  this._itemCount = itemCount;
  
  /**
   * The size of each item.
   * 
   * @type {number}
   * @const
   */
  this._itemSize = itemSize;
  
};
// inherit from X.base
goog.inherits(X.buffer, X.base);
