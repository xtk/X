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
goog.provide('X.sphere');

// requires
goog.require('CSG.sphere');
goog.require('X.base');
goog.require('X.object');



/**
 * Create a displayable Sphere.
 * 
 * @constructor
 * @param {!Array} center The center position in 3D space as a 1-D Array with
 *          length 3.
 * @param {!number} radius The radius of the Sphere.
 * @extends X.object
 */
X.sphere = function(center, radius) {

  if (!goog.isDefAndNotNull(center) || !(center instanceof Array) ||
      (center.length != 3)) {
    
    throw new Error('Invalid center.');
    
  }
  
  if (!goog.isNumber(radius)) {
    
    throw new Error('Invalid radius.');
    
  }
  
  /**
   * @inheritDoc
   * @const
   */
  this._className = this._className || 'sphere';    
  
  //
  // call the standard constructor of X.base
  goog.base(this);
  
  //
  // class attributes
  
  this._center = center;
  
  this._radius = radius;
  
  this._slices = 32;
  
  this._stacks = 16;
  
  this.create_();
  
};
// inherit from X.object
goog.inherits(X.sphere, X.object);


/**
 * Create the Sphere.
 * 
 * @private
 */
X.sphere.prototype.create_ = function() {

  this.fromCSG(new CSG.sphere({
    center: this._center,
    radius: this._radius,
    slices: this._slices,
    stacks: this._stacks
  }));
  
};

// export symbols (required for advanced compilation)
goog.exportSymbol('X.sphere', X.sphere);
