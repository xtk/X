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
goog.require('X.constructable');
goog.require('X.object');



/**
 * Create a displayable Sphere.
 * 
 * @constructor
 * @extends X.object
 * @mixin X.constructable
 */
X.sphere = function() {

  //
  // call the standard constructor of X.base
  goog.base(this);
  
  //
  // class attributes
  
  /**
   * @inheritDoc
   * @const
   */
  this._classname = 'sphere';
  
  /**
   * The center of this sphere in the world space.
   * 
   * @type {!Array}
   * @protected
   */
  this._center = [0, 0, 0];
  
  /**
   * The radius of this sphere.
   * 
   * @type {!number}
   * @protected
   */
  this._radius = 5;
  
  /**
   * The number of slices to generate the sphere shape.
   * 
   * @type {!number}
   * @protected
   */
  this._slices = 32;
  
  /**
   * The number of stacks to generate the sphere shape.
   * 
   * @type {!number}
   * @protected
   */
  this._stacks = 16;
  
  inject(this, new X.constructable()); // this object is constructable
  
};
// inherit from X.object
goog.inherits(X.sphere, X.object);


/**
 * Get the center of this sphere.
 * 
 * @return {!Array} The center as an array with length 3.
 * @public
 */
X.sphere.prototype.__defineGetter__('center', function() {

  return this._center;
  
});


/**
 * Set the center of this sphere.
 * 
 * @param {!Array} center The center as an array with length 3 ([X,Y,Z]).
 * @throws {Error} An error, if the center is invalid.
 * @public
 */
X.sphere.prototype.__defineSetter__('center', function(center) {

  if (!goog.isDefAndNotNull(center) || !goog.isArray(center) ||
      (center.length != 3)) {
    
    throw new Error('Invalid center');
    
  }
  
  this._center = center;
  
});


/**
 * Get the radius of this sphere.
 * 
 * @return {!number} The radius.
 * @public
 */
X.sphere.prototype.__defineGetter__('radius', function() {

  return this._radius;
  
});


/**
 * Set the radius of this sphere.
 * 
 * @param {!number} radius The radius.
 * @throws {Error} An error, if the given radius is invalid.
 * @public
 */
X.sphere.prototype.__defineSetter__('radius', function(radius) {

  if (!goog.isNumber(radius)) {
    
    throw new Error('Invalid radius.');
    
  }
  
  this._radius = radius;
  
});


/**
 * @inheritDoc
 * @suppress {missingProperties}
 */
X.sphere.prototype.modified = function() {

  this.fromCSG(new CSG.sphere({
    center: this._center,
    radius: this._radius,
    slices: this._slices,
    stacks: this._stacks
  }));
  
  // call the super class
  goog.base(this, 'modified');
  
};

// export symbols (required for advanced compilation)
goog.exportSymbol('X.sphere', X.sphere);
goog.exportSymbol('X.sphere.prototype.modified', X.sphere.prototype.modified);
