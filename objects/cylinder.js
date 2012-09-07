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
goog.require('X.constructable');
goog.require('X.object');



/**
 * Create a displayable cylinder.
 * 
 * @constructor
 * @extends X.object
 * @mixin X.constructable
 */
X.cylinder = function() {

  //
  // call the standard constructor of X.base
  goog.base(this);
  
  //
  // class attributes
  
  /**
   * @inheritDoc
   * @const
   */
  this._classname = 'cylinder';
  
  /**
   * The start point of this cylinder.
   * 
   * @type {!Array}
   * @protected
   */
  this._start = [-10, -10, -10];
  
  /**
   * The end point of this cylinder.
   * 
   * @type {!Array}
   * @protected
   */
  this._end = [10, 10, 10];
  
  /**
   * The radius of this cylinder.
   * 
   * @type {!number}
   * @protected
   */
  this._radius = 10;
  
  /**
   * The number of slices to generate the cylinder shape.
   * 
   * @type {!number}
   * @protected
   */
  this._slices = 32;
  
  inject(this, new X.constructable()); // this object is constructable
  
};
// inherit from X.object
goog.inherits(X.cylinder, X.object);


/**
 * Get the start point of this cylinder.
 * 
 * @return {!Array} The start point as an array with length 3.
 * @public
 */
X.cylinder.prototype.__defineGetter__('start', function() {

  return this._start;
  
});


/**
 * Set the start point of this cylinder.
 * 
 * @param {!Array} start The start point as an array with length 3 ([X,Y,Z]).
 * @throws {Error} An error, if the start point is invalid.
 * @public
 */
X.cylinder.prototype.__defineSetter__('start', function(start) {

  if (!goog.isDefAndNotNull(start) || !goog.isArray(start) ||
      (start.length != 3)) {
    
    throw new Error('Invalid start');
    
  }
  
  this._start = start;
  
});


/**
 * Get the end point of this cylinder.
 * 
 * @return {!Array} The end point as an array with length 3.
 * @public
 */
X.cylinder.prototype.__defineGetter__('end', function() {

  return this._end;
  
});


/**
 * Set the end point of this cylinder.
 * 
 * @param {!Array} end The end point as an array with length 3 ([X,Y,Z]).
 * @throws {Error} An error, if the end point is invalid.
 * @public
 */
X.cylinder.prototype.__defineSetter__('end', function(end) {

  if (!goog.isDefAndNotNull(end) || !goog.isArray(end) ||
      (end.length != 3)) {
    
    throw new Error('Invalid end');
    
  }
  
  this._end = end;
  
});


/**
 * Get the radius of this cylinder.
 * 
 * @return {!number} The radius.
 * @public
 */
X.cylinder.prototype.__defineGetter__('radius', function() {

  return this._radius;
  
});


/**
 * Set the radius of this cylinder.
 * 
 * @param {!number} radius The radius.
 * @throws {Error} An error, if the given radius is invalid.
 * @public
 */
X.cylinder.prototype.__defineSetter__('radius', function(radius) {

  if (!goog.isNumber(radius)) {
    
    throw new Error('Invalid radius.');
    
  }
  
  this._radius = radius;
  
});


/**
 * @inheritDoc
 * @suppress {missingProperties}
 */
X.cylinder.prototype.modified = function() {

  this.fromCSG(new CSG.cylinder({
    start: this._start,
    end: this._end,
    radius: this._radius,
    slices: this._slices
  }));
  
  // call the super class
  goog.base(this, 'modified');
  
};

// export symbols (required for advanced compilation)
goog.exportSymbol('X.cylinder', X.cylinder);
goog.exportSymbol('X.cylinder.prototype.modified',
    X.cylinder.prototype.modified);
