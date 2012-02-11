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
goog.provide('X.cylinder');

// requires
goog.require('CSG.cylinder');
goog.require('X.base');
goog.require('X.object');



/**
 * Create a displayable cylinder.
 * 
 * @constructor
 * @param {!Array} start The start position in 3D space as a 1-D Array with
 *          length 3.
 * @param {!Array} end The end position in 3D space as a 1-D Array with length
 *          3.
 * @param {!number} radius The radius of the cylinder.
 * @extends X.object
 */
X.cylinder = function(start, end, radius) {

  if (!goog.isDefAndNotNull(start) || !(start instanceof Array) ||
      (start.length != 3)) {
    
    throw new Error('Invalid start position.');
    
  }
  
  if (!goog.isDefAndNotNull(end) || !(end instanceof Array) ||
      (end.length != 3)) {
    
    throw new Error('Invalid end position.');
    
  }
  
  if (!goog.isNumber(radius)) {
    
    throw new Error('Invalid radius.');
    
  }
  
  //
  // call the standard constructor of X.base
  goog.base(this);
  
  //
  // class attributes
  
  /**
   * @inheritDoc
   * @const
   */
  this['_className'] = 'cylinder';
  
  this._start = start;
  
  this._end = end;
  
  this._radius = radius;
  
  this._slices = 32;
  
  this.create_();
  
};
// inherit from X.object
goog.inherits(X.cylinder, X.object);


/**
 * Create the cylinder.
 * 
 * @private
 */
X.cylinder.prototype.create_ = function() {

  this.fromCSG(new CSG.cylinder({
    start: this._start,
    end: this._end,
    radius: this._radius,
    slices: this._slices
  }));
  
};

// export symbols (required for advanced compilation)
goog.exportSymbol('X.cylinder', X.cylinder);
