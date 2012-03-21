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
goog.provide('X.colorTable');

// requires
goog.require('X.base');
goog.require('goog.structs.Map');



/**
 * Create a container for a colorTable.
 * 
 * @constructor
 * @extends X.base
 */
X.colorTable = function() {

  //
  // call the standard constructor of X.base
  goog.base(this);
  
  //
  // class attributes
  
  /**
   * @inheritDoc
   * @const
   */
  this['_className'] = 'colorTable';
  
  /**
   * The internal hash map to store the value-color mapping.
   * 
   * @type {!goog.structs.Map}
   */
  this._map = new goog.structs.Map();
  
};
// inherit from X.base
goog.inherits(X.colorTable, X.base);


/**
 * Add an entry to this color table.
 * 
 * @param value
 * @param label
 * @param r
 * @param g
 * @param b
 * @param a
 * @throws {Error} If the given values are invalid.
 */
X.colorTable.prototype.add = function(value, label, r, g, b, a) {

  if (!goog.isNumber(value) || !goog.isNumber(r) || !goog.isNumber(g) ||
      !goog.isNumber(b) || !goog.isNumber(a)) {
    
    throw new Error('Invalid color table entry.');
    
  }
  
  this._map.set(value, [label, r, g, b, a]);
  
  this._dirty = true;
  
};
