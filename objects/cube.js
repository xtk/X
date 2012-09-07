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
goog.provide('X.cube');

// requires
goog.require('CSG.cube');
goog.require('X.base');
goog.require('X.constructable');
goog.require('X.object');



/**
 * Create a displayable cube.
 * 
 * @constructor
 * @extends X.object
 * @mixin X.constructable
 */
X.cube = function() {

  //
  // call the standard constructor of X.base
  goog.base(this);
  
  //
  // class attributes
  
  /**
   * @inheritDoc
   * @const
   */
  this._classname = 'cube';
  
  /**
   * The center of this cube in the world space.
   * 
   * @type {!Array}
   * @protected
   */
  this._center = [0, 0, 0];
  
  /**
   * The edge length in X-direction.
   * 
   * @type {!number}
   * @protected
   */
  this._lengthX = 20;
  
  /**
   * The edge length in Y-direction.
   * 
   * @type {!number}
   * @protected
   */
  this._lengthY = 20;
  
  /**
   * The edge length in Z-direction.
   * 
   * @type {!number}
   * @protected
   */
  this._lengthZ = 20;
  
  /**
   * @inheritDoc
   * @const
   */
  this._textureCoordinateMap = [

  // Right face
  0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0,

  // Left face
  1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1,

  // Bottom face
  0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0,

  // Top face
  0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0,

  // Back face
  1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1,

  // Front face
  0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0

  ];
  
  inject(this, new X.constructable()); // this object is constructable
  
};
// inherit from X.object
goog.inherits(X.cube, X.object);


/**
 * Get the center of this cube.
 * 
 * @return {!Array} The center as an array with length 3.
 * @public
 */
X.cube.prototype.__defineGetter__('center', function() {

  return this._center;
  
});


/**
 * Set the center of this cube.
 * 
 * @param {!Array} center The center as an array with length 3 ([X,Y,Z]).
 * @throws {Error} An error, if the center is invalid.
 * @public
 */
X.cube.prototype.__defineSetter__('center', function(center) {

  if (!goog.isDefAndNotNull(center) || !goog.isArray(center) ||
      (center.length != 3)) {
    
    throw new Error('Invalid center');
    
  }
  
  this._center = center;
  
});


/**
 * Get the edge length in X-direction.
 * 
 * @return {!number} The edge length in X-direction.
 * @public
 */
X.cube.prototype.__defineGetter__('lengthX', function() {

  return this._lengthX;
  
});


/**
 * Set the edge length in X-direction.
 * 
 * @param {!number} lengthX The edge length in X-direction.
 * @throws {Error} An error, if the given length is invalid.
 * @public
 */
X.cube.prototype.__defineSetter__('lengthX', function(lengthX) {

  if (!goog.isNumber(lengthX)) {
    
    throw new Error('Invalid lengthX.');
    
  }
  
  this._lengthX = lengthX;
  
});


/**
 * Get the edge length in Y-direction.
 * 
 * @return {!number} The edge length in Y-direction.
 * @public
 */
X.cube.prototype.__defineGetter__('lengthY', function() {

  return this._lengthY;
  
});


/**
 * Set the edge length in Y-direction.
 * 
 * @param {!number} lengthY The edge length in Y-direction.
 * @throws {Error} An error, if the given length is invalid.
 * @public
 */
X.cube.prototype.__defineSetter__('lengthY', function(lengthY) {

  if (!goog.isNumber(lengthY)) {
    
    throw new Error('Invalid lengthY.');
    
  }
  
  this._lengthY = lengthY;
  
});


/**
 * Get the edge length in Z-direction.
 * 
 * @return {!number} The edge length in Z-direction.
 * @public
 */
X.cube.prototype.__defineGetter__('lengthZ', function() {

  return this._lengthZ;
  
});


/**
 * Set the edge length in Z-direction.
 * 
 * @param {!number} lengthZ The edge length in Z-direction.
 * @throws {Error} An error, if the given length is invalid.
 * @public
 */
X.cube.prototype.__defineSetter__('lengthZ', function(lengthZ) {

  if (!goog.isNumber(lengthZ)) {
    
    throw new Error('Invalid lengthZ.');
    
  }
  
  this._lengthZ = lengthZ;
  
});


/**
 * @inheritDoc
 * @suppress {missingProperties}
 */
X.cube.prototype.modified = function() {

  this.fromCSG(new CSG.cube({
    center: this._center,
    radius: [this._lengthX / 2, this._lengthY / 2, this._lengthZ / 2]
  }));
  
  // call the super class
  goog.base(this, 'modified');
  
};

// export symbols (required for advanced compilation)
goog.exportSymbol('X.cube', X.cube);
goog.exportSymbol('X.cube.prototype.modified', X.cube.prototype.modified);
